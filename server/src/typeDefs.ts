import fs from "fs";
import path from "path";

import { mediaAPI } from "./plugins";
import MapGTPlugin from "./plugins/MapGT";
import { lowerSnake } from "./common";

export const SOCKETIO_KEY = "mapgt";
const mainTypeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");

const baseNames = Object.keys(mediaAPI);

// Generate PluginMaster body (See base api.graphql)
const configStrArr = baseNames.map(name => {
  const lowerSnaked = lowerSnake(name);
  return `${lowerSnaked}: ${name}Config`;
});
configStrArr.push(`mapgt: mapgtConfig`);
const pluginMasterBody = configStrArr.join("\n\t");
const pluginMasterStr = `input PluginMaster {\n\t${pluginMasterBody}\n}`;

export const pluginTypeDefs: {
  [key: string]: string;
} = {}; // For testing
export const configTypeDefs: {
  [key: string]: string;
} = {};
const processedPluginTypeDefs = Object.keys(mediaAPI).map(plugin => {
  const schema = mediaAPI[plugin].schema();
  const typeDef = `input ${plugin}Config ${schema}\n\ntype ${plugin}ConfigType ${schema}`;
  pluginTypeDefs[plugin] = typeDef;
  return typeDef;
});

const mapgtSchema = MapGTPlugin.schema();
const mapgtTypeDef = `input mapgtConfig ${mapgtSchema}\n\ntype mapgtConfigType ${mapgtSchema}`;
processedPluginTypeDefs.push(mapgtTypeDef); // Note we don't update pluginTypeDefs here

let processedConfigKeys = "";
Object.keys(mediaAPI).map(plugin => {
  const schema = mediaAPI[plugin].schema();
  processedConfigKeys = processedConfigKeys.concat(schema.slice(1, -1));
});

const processedConfig = `type MetaDataType {${processedConfigKeys}}`;
const processedStr = processedPluginTypeDefs.join("\n\n");

const mergedTypeDefs = `
${mainTypeDefs}
${pluginMasterStr}\n
${processedStr} \n
${processedConfig}
`;

fs.writeFile("merged.graphql", mergedTypeDefs, err => {
  if (err) throw err;
}); // For logging/debugging

export default mergedTypeDefs;
