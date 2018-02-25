import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import { PORT } from './common';
import * as plugins from './plugins/api';
import { GenericNotifier } from './plugins/api/GenericNotifier';
import { APIReturn } from './plugins/api/APIReturn';

const typeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");

const app = express();

app.use(compression());
process.on("unhandledRejection", err => {
	throw err;
});

interface IStatusReturn {
	[medium: string]: [APIReturn];
}

const resolvers = {
	Query: {
		send_message: async (prev: any, args: any): Promise<IStatusReturn> => {
			let statusRet: IStatusReturn = {};
			const message = args.message;

			const checkQueue = Object.keys(args.plugins).map( name => {

				return (async () => { // Loading checkQueue IIFE

					const plugin: GenericNotifier<any> = plugins.mediaAPI[name.toUpperCase()];
					const verifiedConfig = await plugin.check(args.plugins[name]); // Verify

					return async () => { // Sending function
						try {
							statusRet[name] = await plugin.sendMessage(message, verifiedConfig);
						}
						catch (e) {
							statusRet[name] = [{
								error: true,
								key: name,
								message: e.toString()
							}];
						}
					};
				})();
			});

			const sendingQueue = await Promise.all(checkQueue);
			await Promise.all(sendingQueue.map(f => f())); // Send all!
			return statusRet;
		}
	}
};

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

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
}).catch(() => {
	console.log("App setup failed");
});

export default app;
