import * as fs from "fs";
import * as path from "path";
import { mediaAPI } from './plugins';
import SocketPlugin from "./plugins/Socket";
import { lowerSnake } from './common';

export const SOCKETIO_KEY = "Socketio";
const mainTypeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");

const baseNames = Object.keys(mediaAPI);

baseNames.push(SOCKETIO_KEY);
// Generate PluginMaster body (See base api.graphql)
const configStrArr = baseNames.map(name => {
	const lowerSnaked = lowerSnake(name);
	return `${lowerSnaked}: ${name}Config`;
});
const pluginMasterBody = configStrArr.join("\n\t");
const pluginMasterStr = `input PluginMaster {\n\t${pluginMasterBody}\n}`;

export let pluginTypeDefs: {
	[key: string]: string;
} = {}; // For testing
export let configTypeDefs: {
	[key: string]: string;
} = {};
const processedPluginTypeDefs = Object.keys(mediaAPI).map(plugin => {
	const schema = mediaAPI[plugin].schema();
	const typeDef = `input ${plugin}Config ${schema}\n\ntype ${plugin}ConfigType ${schema}`;
	pluginTypeDefs[plugin] = typeDef;
	return typeDef;
});

const socketSchema = SocketPlugin.schema();
const socketTypeDef = `input ${SOCKETIO_KEY}Config ${socketSchema}\n\ntype ${SOCKETIO_KEY}ConfigType ${socketSchema}`;
processedPluginTypeDefs.push(socketTypeDef); // Note we don't update pluginTypeDefs here

let processedConfigKeys = "";
Object.keys(mediaAPI).map(plugin => {
	const schema = mediaAPI[plugin].schema();
	processedConfigKeys = processedConfigKeys.concat(schema.slice(1, -1));
	return;
});

const processedConfig = `type MetaDataType {${processedConfigKeys}}`;
const processedStr = processedPluginTypeDefs.join("\n\n");

const mergedTypeDefs = `
${mainTypeDefs}
${pluginMasterStr}\n
${processedStr} \n
${processedConfig}
`;

fs.writeFile('merged.graphql', mergedTypeDefs, err => {
	if (err) throw err;
}); // For logging/debugging

export default mergedTypeDefs;
