import * as fs from "fs";
import * as path from "path";

const mainTypeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");
const typeDefFileArr = fs.readdirSync(path.resolve(__dirname, "../server/plugins/graphql"), "utf8");
const rawPluginTypeDefs = typeDefFileArr.map(fn => fs.readFileSync(path.resolve(__dirname, "../server/plugins/graphql", fn), "utf8"));

// E.g. Slack
const baseNames = typeDefFileArr.map(fn => fn.substring(0, fn.indexOf("Plugin.graphql")));

// Generate PluginMaster body (See base api.graphql)
let pluginMasterStr = "\ninput PluginMaster {";
const configStrArr = baseNames.map(name => `${name.toLowerCase()}: ${name}Config`);
configStrArr.forEach(s => {
	pluginMasterStr += "\n\t" + s;
});
pluginMasterStr = pluginMasterStr + "\n}\n\n"; // Formatting

// Append pluginTypeDefs (rename each Config)
// IE input Config => input SlackConfig
const processedPluginTypeDefs = rawPluginTypeDefs.map((s, i) => s.slice(0, 6) + baseNames[i] + s.slice(6));
let processedStr = "";
processedPluginTypeDefs.forEach(s => {
	processedStr += s + "\n";
});
processedStr = processedStr.substring(0, processedStr.length - 1); // Formatting

const mergedTypeDefs = mainTypeDefs + pluginMasterStr + processedStr;

// TODO: Conflict checking

export default mergedTypeDefs;
