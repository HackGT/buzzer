import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as Datastore from "nedb";
import * as dotenv from "dotenv";
import * as http from "http";

// TODO deploy
// tslint:disable: comment-format
const MAPGT_URL = 'http://localhost:8000';
const SOCKET_OPTIONS = {
	allowUpgrades: true,
	transports: [ 'polling', 'websocket' ],
	origins: MAPGT_URL
};

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import config from './config';
import { upperCamel } from './common';
import { mediaAPI } from './plugins';
import { PluginReturn, Notifier, MetaDataType } from './plugins/Plugin';
import SocketPlugin from './plugins/Socket';
import typeDefs, { SOCKETIO_KEY } from './typeDefs';
import { isAdmin } from './middleware';

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
	db[key] = new Datastore({ filename: file, autoload: true, timestampData: true });
});

app.use(compression());
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
						}
						catch (e) {
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
				if (result.plugin === SOCKETIO_KEY) return result;
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

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

const middlewares = [bodyParser.json(), graphqlExpress({schema})];
if (process.env.DEV_MODE !== 'True') {
	middlewares.splice(1, 0, isAdmin);
}
app.use(
	'/graphql',
	...middlewares
);
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Run plugin setup
async function runSetup() {
	await Promise.all(Object.keys(mediaAPI).map(async pluginKey => {
		plugins[pluginKey] = await mediaAPI[pluginKey].init();
	}));
	// tslint:disable-next-line
	plugins[SOCKETIO_KEY] = await SocketPlugin.init(io);
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
