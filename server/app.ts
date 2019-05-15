import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as Datastore from "nedb";

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import config from './config';
import { upperCamel } from './common';
import { mediaAPI } from './plugins';
import { PluginReturn, Notifier, MetaDataType } from './plugins/Plugin';
import typeDefs from './typeDefs';
import { isAdmin } from './middleware';

const app = express();
const db: any = {
	live_site: new Datastore({
		filename: './server/datastore/livesite_log.db', autoload: true, timestampData: true
	}),
	twitter: new Datastore({ filename: './server/datastore/twitter_log.db', autoload: true, timestampData: true }),
	slack: new Datastore({ filename: './server/datastore/slack_log.db', autoload: true, timestampData: true }),
	twilio: new Datastore({ filename: './server/datastore/twilio_log.db', autoload: true, timestampData: true })
};

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

			let returnDocs = await new Promise<IMessageReturn[]>(resolve => {
				db[plugin].find({}, (err: any, docs: any) => {
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
							const insertArg = {
								message: args.message,
								config: args.plugins[rawName],
								_id: args._id,
								createdAt: args.createdAt,
								updatedAt: args.updatedAt
							};
							db[rawName].insert(insertArg); // Inserts the args object from GraphQL query into database
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
			return await Promise.all(sendingQueue.map(f => f())); // Send all!
		}
	}
};

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

app.use(
	'/graphql',
	bodyParser.json(),
	isAdmin,
	graphqlExpress({
		schema
	})
);
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Run plugin setup
async function runSetup() {
	await Promise.all(Object.keys(mediaAPI).map(async pluginKey => {
		plugins[pluginKey] = await mediaAPI[pluginKey].init();
	}));
}

runSetup().then(() => {
	app.listen(config.port, () => {
		console.log(`Buzzer system started on 0.0.0.0:${config.port}`);
	});
}).catch(error => {
	console.log("App setup failed");
	throw error;
});

export default app;
