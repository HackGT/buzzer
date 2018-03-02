import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import { PORT } from './common';
import * as plugins from './plugins';
import { GenericNotifier } from './plugins/GenericNotifier';
import { APIReturn } from './plugins/APIReturn';
import typeDefs from './typeDefs';

const app = express();

app.use(compression());
process.on("unhandledRejection", err => {
	throw err;
});

interface IPluginReturn {
	plugin: string;
	errors: APIReturn[];
}

const resolvers = {
	Query: {
		send_message: async (prev: any, args: any): Promise<IPluginReturn[]> => {
			const message = args.message;

			const checkQueue = Object.keys(args.plugins).map( rawName => {

				return (async () => { // Loading checkQueue IIFE
					// Upper Cameled
					const name = rawName.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join('');
					const plugin: GenericNotifier<any> = plugins.mediaAPI[name];
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

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Run plugin setup
async function runSetup() {
	await Promise.all(Object.keys(plugins.mediaAPI).map(pluginKey => {
		return plugins.mediaAPI[pluginKey].setup();
	}));
}

runSetup().then(() => {
	app.listen(PORT, () => {
		console.log(`Buzzer system started on 0.0.0.0:${PORT}`);
	});
}).catch(error => {
	console.log("App setup failed");
	throw error;
});

export default app;
