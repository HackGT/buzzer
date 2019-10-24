import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import Datastore from "nedb";
import dotenv from "dotenv";
import http from "http";
import moment from "moment-timezone";

const MAPGT_URL = process.env.MAPGT_URL;
const SOCKET_OPTIONS = {
	allowUpgrades: true,
	transports: ['polling', 'websocket'],
	origins: process.env.MAPGT_URL
};
import {
	graphqlExpress,
	graphiqlExpress
} from 'graphql-server-express';
import {
	makeExecutableSchema
} from 'graphql-tools';
import config from './config';
import {
	upperCamel
} from './common';
import {
	mediaAPI
} from './plugins';
import {
	PluginReturn,
	Notifier,
	MetaDataType
} from './plugins/Plugin';
import fetch from 'node-fetch';
import * as schedule from 'node-schedule';
import * as path from 'path';
import MapGTPlugin from './plugins/MapGT';
import typeDefs, {
	SOCKETIO_KEY
} from './typeDefs';
import {
	isAdmin
} from './middleware';

const app = express();
const server = new http.Server(app);
const io = require('socket.io')(SOCKET_OPTIONS).listen(server); // tslint:disable-line
io.origins((origin: any, callback: any) => {
	if (origin === MAPGT_URL) {
		return callback(null, true);
	}
	callback('illegal', false);
});
dotenv.config();
const db: any = {};
const events: any = {};

Object.keys(mediaAPI).forEach(key => {
	const file = `./server/datastore/${key.toLowerCase()}_log.db`;
	db[key] = new Datastore({
		filename: file,
		autoload: true,
		timestampData: true
	});
});

// Hack for mapgt
const fileMapgt = `./server/datastore/map_g_t_log.db`;
db.Mapgt = new Datastore({
	filename: fileMapgt,
	autoload: true,
	timestampData: true
});

app.use(compression());
app.use(express.static(path.join(__dirname, '../', 'client/')));
app.use('/static', express.static(path.join(__dirname, '../', 'client/build/static')));
process.on("unhandledRejection", err => {
	throw err;
});

interface IPluginReturn {
	plugin: string;
	errors: PluginReturn[];
}

interface IMessageReturn {
	message: string;
	config: MetaDataType;
	_id: string;
	createdAt: string;
	updatedAt: string;
}

let plugins: {
	[name: string]: Notifier < any > ;
} = {};

const eventQuery = `query {
	eventbases(start: 0) {
		id
		title
		start_time
		notification
		area {
			name
		}
		tags {
			slug
		}
		type
	}
}`;

// tslint:disable-next-line
const UNSAFE_parseAsLocal = (t: string) => { // Parse iso-formatted string as local time
	let localString = t;
	if (t.slice(-1).toLowerCase() === "z") {
		localString = t.slice(0, -1);
	}
	return moment(localString);
};

// tslint:disable-next-line
const UNSAFE_toUTC = (t: string) => UNSAFE_parseAsLocal(t).utc();

const resolvers = {
	Query: {
		get_messages: async (prev: any, args: any): Promise < IMessageReturn[] > => {
			let plugin = args.plugin;
			if (plugin === SOCKETIO_KEY) {
				return []; // TODO
			}
			let returnDocs = await new Promise < IMessageReturn[] > (resolve => {
				db[upperCamel(plugin)].find({}, (err: any, docs: any) => {
					resolve(docs);
				});
			});
			return returnDocs;
		},
		send_message: async (prev: any, args: any): Promise < IPluginReturn[] > => {
			const message = args.message;
			const checkQueue = Object.keys(args.plugins).map(rawName => {
				return (async () => { // Loading checkQueue IIFE
					// Upper Cameled
					const name = upperCamel(rawName);
					const plugin = plugins[name];
					const verifiedConfig = await plugin.check(args.plugins[rawName]); // Verify
					return async () => { // Sending function
						try {
							const pluginReturn = {
								plugin: name,
								errors: await plugin.sendMessage(message, verifiedConfig)
							};
							return pluginReturn;
						} catch (e) {
							return {
								plugin: name,
								errors: [{
									error: true,
									key: name,
									message: e.toString()
								}]
							};
						}
					};
				})();
			});

			const sendingQueue = await Promise.all(checkQueue);
			return Promise.all(sendingQueue.map(async f => {
				const result = await f();
				const p = result.plugin.split(/(?=[A-Z])/).join('_').toLowerCase();
				const insertArg = {
					message: args.message,
					config: args.plugins[p],
					_id: args._id,
					createdAt: args.createdAt,
					errors: result.errors
				};
				db[upperCamel(result.plugin)].insert(insertArg);
				return result; // We catch in sending function
			})); // Send all!
		}
	}
};
function scheduleCMS() {
	fetch('https://cms.hack.gt/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': `application/json`,
			'Accept': `application/json`
		},
		body: JSON.stringify({
			query: eventQuery,
			variables: {
				"start": 0
			}
		})
	}).then((r: any) => {
		return r.json();
	}).then((result: any) => {
		const info = result.data.eventbases;
		info.forEach((e: any) => {

			const startTime = UNSAFE_toUTC(e.start_time).local();
			const startTimeFormatted = startTime.format("hh:mm");
			const notification = e.notification;
			const area = e.area.name;
			const id = e.id;
			const tagList = e.tags.map((t: any) => t.slug);
			const now = moment(Date.now()).utcOffset('-0500')
			const difference = startTime.diff(now, "minutes");
			const title = e.title;
			console.log(difference);
			if (difference < 0 || difference >= 16) return;
			if((id in events)) return;
			events[id] = true;
			console.log("sending...");
			const topic = tagList.includes("core") ? "all" : id;
			resolvers.Query.send_message(null, {
				plugins: {
					slack: {
						channels: ["announcements"],
						at_channel: false,
						at_here: false
					},
					mapgt: {
						title,
						area,
						time: startTime.format()
					},
					live_site: {
						title
					},
					f_c_m: {
						header: title,
						id: topic
					}
				},
				message: notification ? notification : `${title} starts at ${startTimeFormatted} in ${area}!`
			}).then((msgOut: any) => {
				return msgOut;
			}).catch((err: any) => {
				console.log(err);
			});
		});
	}).then((output: any) => {
		return output;
	}).catch((err: any) => {
		console.log(err);
	});

}

async function scheduleWorkshops() {
	schedule.scheduleJob("*/1 * * * *", () => {
		console.log("check");
		scheduleCMS();
	});
}

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../', 'client/build/index.html'));
});

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

const middlewares = [bodyParser.json(), isAdmin, graphqlExpress({
	schema
})];
app.use(
	'/graphql',
	...middlewares
);
app.use('/graphiql', bodyParser.json(), graphiqlExpress({
	endpointURL: '/graphql'
}));

// Run plugin setup
async function runSetup() {
	await Promise.all(Object.keys(mediaAPI).map(async pluginKey => {
		plugins[pluginKey] = await mediaAPI[pluginKey].init();
	}));
	await scheduleWorkshops();
	// Code for getting schedule
	// tslint:disable-next-line
	plugins["Mapgt"] = await MapGTPlugin.init(io);
}

runSetup().then(() => {
	server.listen(config.port, () => {
		console.log(`Buzzer system started on 0.0.0.0:${config.port}`);
	});
}).catch(error => {
	console.log("App setup failed");
	throw error;
});

export default app;
