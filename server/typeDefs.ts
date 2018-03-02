import * as fs from "fs";
import * as path from "path";
import * as plugins from './plugins';
import { lowerSnake } from './common';

const mainTypeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");

const baseNames = Object.keys(plugins.mediaAPI);

// Generate PluginMaster body (See base api.graphql)
const configStrArr = baseNames.map(name => {
	const lowerSnaked = lowerSnake(name);
	return `${lowerSnaked}: ${name}Config`;
});
const pluginMasterBody = configStrArr.join("\n\t");
const pluginMasterStr = `input PluginMaster {\n\t${pluginMasterBody}\n}`;

const processedPluginTypeDefs = Object.keys(plugins.mediaAPI).map(plugin => `input ${plugin}Config ${plugins.mediaAPI[plugin].schema}`);
const processedStr = processedPluginTypeDefs.join("\n\n");

const mergedTypeDefs = `
${mainTypeDefs}
${pluginMasterStr}\n
${processedStr}
`;
console.log(mergedTypeDefs);
// TODO: Conflict checking

export default mergedTypeDefs;
