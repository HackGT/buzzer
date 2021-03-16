import fs from "fs";
import path from "path";

import { pluginSetup } from "./plugins";
import { upperCamel } from "./util";

export const SOCKETIO_KEY = "mapgt";
const mainTypeDefs = fs.readFileSync(path.resolve(__dirname, "./api.graphql"), "utf8");

const baseNames = Object.keys(pluginSetup);

// Generate PluginMaster body (See base api.graphql)
const configStrArr = baseNames.map(name => `${name}: ${upperCamel(name)}Config`);
const pluginMasterBody = configStrArr.join("\n\t");
const pluginMasterStr = `input PluginMaster {\n\t${pluginMasterBody}\n}`;

export const pluginTypeDefs: {
  [key: string]: string;
} = {}; // For testing
export const configTypeDefs: {
  [key: string]: string;
} = {};

const processedPluginTypeDefs = Object.entries(pluginSetup).map(([name, setup]) => {
  const typeDef = `input ${upperCamel(name)}Config ${setup.schema()}`;
  pluginTypeDefs[name] = typeDef;
  return typeDef;
});

let processedConfigKeys = "";
Object.values(pluginSetup).forEach(setup => {
  const schema = setup.schema();
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

fs.writeFile("./src/merged.graphql", mergedTypeDefs, err => {
  if (err) throw err;
});

export default mergedTypeDefs;
