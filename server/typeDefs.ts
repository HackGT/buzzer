import * as fs from "fs";
import * as path from "path";

const mainTypeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");
const typeDefFileArr = fs.readdirSync(path.resolve(__dirname, "../server/plugins/graphql"), "utf8");
const rawPluginTypeDefs = typeDefFileArr.map(fn => fs.readFileSync(path.resolve(__dirname, "../server/plugins/graphql", fn), "utf8"));

// Generate custom fields for PluginMaster and PluginReturn
const baseNames = typeDefFileArr.map(fn => fn.substring(0, fn.indexOf("Plugin.graphql")));

// Store base GraphQL before pluginMaster
const base = mainTypeDefs.substring(0, mainTypeDefs.indexOf("input PluginMaster {"));
let pluginMasterStr = "input PluginMaster {\n\t";
const configStrArr = baseNames.map(name => `${name.toLowerCase()}: ${name}Config`);
configStrArr.forEach(s => {
	pluginMasterStr += s + "\n\t";
});
pluginMasterStr = pluginMasterStr.substring(0, pluginMasterStr.length - 1) + "}\n\n"; // Formatting
let pluginReturnStr = "type PluginReturn {\n\t";
const returnStrArr = baseNames.map(name => `${name.toLowerCase()}: [Status!]!`);
returnStrArr.forEach(s => {
	pluginReturnStr += s + "\n\t";
});
pluginReturnStr = pluginReturnStr.substring(0, pluginReturnStr.length - 1) + "}\n\n"; // Formatting

// Append pluginTypeDefs (rename each Config)
// IE input Config => input SlackConfig
const processedPluginTypeDefs = rawPluginTypeDefs.map((s, i) => s.slice(0, 6) + baseNames[i] + s.slice(6));
let processedStr = "";
processedPluginTypeDefs.forEach(s => {
	processedStr += s + "\n";
});
processedStr = processedStr.substring(0, processedStr.length - 1); // Formatting

const mergedTypeDefs = base + pluginMasterStr + pluginReturnStr + processedStr;

export default mergedTypeDefs;
