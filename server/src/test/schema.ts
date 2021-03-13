import "mocha";
import { makeExecutableSchema } from 'graphql-tools';
import { default as typeDefs, pluginTypeDefs } from '../typeDefs';

describe("GraphQL schema test", () => {
	describe("Plugins", () => {
		Object.keys(pluginTypeDefs).forEach((key) => {
			it(key, () => {
				makeExecutableSchema({
					typeDefs: pluginTypeDefs[key]
				});
			});
		});
	});

	it("Main merge", () => {
		makeExecutableSchema({typeDefs});
	});
});
