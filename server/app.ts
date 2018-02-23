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
	[medium: string]: [Promise<APIReturn>] | APIReturn; // String for generic unpacking error
}

const resolvers = {
	Query: {
		send_message: (prev: any, args: any) => {
			let statusRet: IStatusReturn = {};
			const src = Object.keys(args.plugins);
			src.forEach( name => {
				try {
					const message = args.message;
					const config = args.plugin[name];
					const plugin: GenericNotifier<any> = plugins.mediaAPI[name.toUpperCase()];
					statusRet[name] = plugin.sendMessage(message, config);
				} catch {
					statusRet[name] = {
						error: true,
						key: "Server",
						message: "Malformed arguments, plugin not called. (Generic server error)"};
				}
			});
			return statusRet;
		}
	}
};

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(PORT, () => {
	console.log(`Buzzer system started on 0.0.0.0:${PORT}`);
});

export default app;
