import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as Datastore from "nedb";
import * as dotenv from "dotenv";
import * as http from "http";
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
db.MapGT = new Datastore({
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

const workshopMessage = `query {
talks(start: 0) {
base {
    start_time
    end_time
    notification
}
}

}`;

function isoToCron(iso: string) {
	let date = new Date(iso);
	return `${date.getSeconds()} ${date.getMinutes()} ${date.getHours() + 4} ${date.getDate()} ${date.getMonth() + 1} *`;
}

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
				if (result.plugin === SOCKETIO_KEY) return result;
				return result; // We catch in sending function
			})); // Send all!
		}
	}
};

async function scheduleWorkshops() {
	fetch('https://cms.hack.gt/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': `application/json`,
			'Accept': `application/json`
		},
		body: JSON.stringify({
			query: workshopMessage,
			variables: {
				"start": 0
			}
		})
	}).then(r => {
		return r.json();
	}).then(data => {
		for (let i = 0; i < data.data.talks.length; i++) {
			if (data.data.talks[i].base != null) {
				let cronString = isoToCron(data.data.talks[i].base.start_time);
				schedule.scheduleJob(cronString, () => {
					resolvers.Query.send_message(null, {
						plugins: {
							slack: {
								channels: ["announcements"],
								at_here: true,
								at_channel: true
							},
							socketio: {
								// TODO!
							},
							f_c_m: {
								// TODO!
							},
							live_site: {
								// TODO!
							}
						},
						message: data.data.talks[i].base.notification
					}).then(result => {
						console.log(result);
					}).catch(err => {
						console.log(err);
					});
				});
			}
			console.log("scheduling made");
		}
	}).catch(err => {
		console.log(err);
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
	plugins[SOCKETIO_KEY] = await MapGTPlugin.init(io);
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
