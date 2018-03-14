import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import config from './config';
import { upperCamel } from './common';
import { mediaAPI } from './plugins';
import { PluginReturn, Notifier } from './plugins/Plugin';
import typeDefs from './typeDefs';
import { schema as types } from "./graphql.types";
import { isAdmin } from './middleware';

const app = express();

app.use(compression());
process.on("unhandledRejection", err => {
	throw err;
});

interface IPluginReturn {
	plugin: string;
	errors: PluginReturn[];
}

let plugins: {
	[name: string]: Notifier<any>;
} = {};

type Ctx = express.Request;

interface IResolver {
	Query: types.Query<Ctx>;
}

const resolvers: IResolver = {
	Query: {
		send_message: async (prev, args): Promise<IPluginReturn[]> => {
			const message = args.message;
			const graphQLPlugins = args.plugins as {[name: string]: any}; // Help! typewriter doesn't know these are strings!
			const checkQueue = Object.keys(graphQLPlugins).map( rawName => {
				// Temp: const checkQueue = Object.keys(args.plugins).map( rawName => {

				return (async () => { // Loading checkQueue IIFE
					// Upper Cameled
					const name = upperCamel(rawName);
					const plugin = plugins[name];
					const verifiedConfig = await plugin.check(graphQLPlugins[rawName]); // Verify
					// Temp: const verifiedConfig = await plugin.check(args.plugins[rawName]); // Verify

					return async () => { // Sending function
						try {
							return {
								plugin: name,
								errors: await plugin.sendMessage(message, verifiedConfig)
							};
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

const schema = makeExecutableSchema({ typeDefs,
																			resolvers: resolvers as any // What a joke
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
