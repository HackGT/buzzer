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

const resolvers = {
	Query: {
		send_message: async (prev: any, args: any): Promise<IPluginReturn[]> => {
			const message = args.message;

			const checkQueue = Object.keys(args.plugins).map( rawName => {

				return (async () => { // Loading checkQueue IIFE
					// Upper Cameled
					const name = upperCamel(rawName);
					const plugin = plugins[name];
					const verifiedConfig = await plugin.check(args.plugins[rawName]); // Verify

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
