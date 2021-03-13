import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import Datastore from "nedb";
import dotenv from "dotenv";
import http from "http";
import moment from "moment-timezone";

const MAPGT_URL = process.env.MAPGT_URL;
const SOCKET_OPTIONS = {
	handlePreflightRequest: (req: any, res: any) => {
		const headers = {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true
		};
		res.writeHead(200, headers);
		res.end();
	},
	allowUpgrades: true,
	transports: ['polling', 'websocket'],
	origins: "*:*"
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
import cors from "cors";
const app = express();
app.use(cors());
app.options('*', cors());
app.use((req: any, res: any, next: any) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Credentials", "true");
	next();
});
const server = new http.Server(app);
const io = require('socket.io')(SOCKET_OPTIONS).listen(server); // tslint:disable-line
io.origins((origin: any, callback: any) => {
	console.log(origin, MAPGT_URL);
	console.log((origin === MAPGT_URL));
	return callback(null, true);
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
const fileMapgt = `./server/datastore/mapgt_log.db`;
db.mapgt = new Datastore({
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
	[name: string]: Notifier<any>;
} = {};

const eventQuery = `{
	allEvents(where: {
		hackathon: {
			name: "HackGT 7"
		}
	}) {
		id
		name
		startDate
		type {
			name
		}
		tags {
			name
		}
		url
	}
}`;

const DEVELOPMENT = process.env.DEV_MODE === 'True';

const resolvers = {
	Query: {
		get_messages: async (prev: any, args: any): Promise<IMessageReturn[]> => {
			let plugin = args.plugin;
			if (plugin === SOCKETIO_KEY) {
				return []; // TODO
			}
			let returnDocs = await new Promise<IMessageReturn[]>(resolve => {
				db[upperCamel(plugin)].find({}, (err: any, docs: any) => {
					resolve(docs);
				});
			});
			return returnDocs;
		},
		send_message: async (prev: any, args: any): Promise<IPluginReturn[]> => {
			const message = args.message;
			const checkQueue = Object.keys(args.plugins).map(rawName => {
				return (async () => { // Loading checkQueue IIFE
					// Upper Cameled
					const name = (rawName === "mapgt") ? rawName : upperCamel(rawName);
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
				const dbName = (result.plugin === "mapgt") ? result.plugin : upperCamel(result.plugin);
				db[dbName].insert(insertArg);
				return result; // We catch in sending function
			})); // Send all!
		}
	}
};
function scheduleCMS() {
	const cmsUrl = (process.env.CMS_URL && !DEVELOPMENT) ? process.env.CMS_URL : "https://keystone.dev.hack.gt/admin/api";
	fetch(cmsUrl, {
		method: 'POST',
		headers: {
			'Content-Type': `application/json`,
			'Accept': `application/json`
		},
		body: JSON.stringify({
			query: eventQuery
		})
	}).then(async (r: any) => {
		const resp = await r.json();
		return resp;
	}).then((result: any) => {
		const info = result.data.allEvents;
		info.forEach((e: any) => {
			const startTime = moment(e.startDate).tz("America/New_York");
			const startTimeFormatted = startTime.local().format("hh:mm A");
			const notification = e.notification;
			const title = e.name;
			const url = e.url;
			const id = e.id;
			const type = e.type ? e.type.name : "";
			const now = moment.utc().tz("America/New_York");
			const difference = startTime.diff(now, "minutes");
			// Check if event is 15min. away
			console.log(title, difference);
			if (difference < 0 || difference >= 16) return;
			// Ensure notifications dont get sent out multiple times
			if ((id in events)) return;
			events[id] = true;

			const msg = url ? `${title} starts at ${startTimeFormatted} EDT. Click here to join: https://calls.healthtech.hack.gt/${id}!` : `${title} starts at ${startTimeFormatted}!`;
			console.log("sending...", startTimeFormatted);
			const topic = (type === "important") ? "all" : id;
			const slackChannel = DEVELOPMENT ? "bot-spam" : "general";

			let pluginJson: any = {
				live_site: {
					title
				},
				f_c_m: {
					header: title,
					id: topic
				},
				slack: {
					channels: [slackChannel],
					at_channel: false,
					at_here: false
				}
			};

			resolvers.Query.send_message(null, {
				plugins: pluginJson,
				message: notification ? notification : msg
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
	scheduleCMS();
	schedule.scheduleJob("*/1 * * * *", () => {
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
	plugins["mapgt"] = await MapGTPlugin.init(io);
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
