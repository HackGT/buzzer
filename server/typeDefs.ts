import * as fs from "fs";
import * as path from "path";

const mainTypeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");
const typeDefFileArr = fs.readdirSync(path.resolve(__dirname, "../server/plugins/graphql"), "utf8");
const rawPluginTypeDefs = typeDefFileArr.map(fn => fs.readFileSync(path.resolve(__dirname, "../server/plugins/graphql", fn), "utf8"));

// E.g. Slack
const baseNames = typeDefFileArr.map(fn => fn.substring(0, fn.indexOf("Plugin.graphql")));

// Generate PluginMaster body (See base api.graphql)
const configStrArr = baseNames.map(name => `${name.toLowerCase()}: ${name}Config`);
const pluginMasterBody = configStrArr.join("\n\t");
const pluginMasterStr = `input PluginMaster {\n\t${pluginMasterBody}\n}`;

// Append pluginTypeDefs (rename each Config)
// IE input Config => input SlackConfig
const processedPluginTypeDefs = rawPluginTypeDefs.map((s, i) => s.slice(0, 6) + baseNames[i] + s.slice(6));
const processedStr = processedPluginTypeDefs.join("\n");

const mergedTypeDefs = `
${mainTypeDefs}
${pluginMasterStr}\n
${processedStr}
`;
console.log(mergedTypeDefs);
// TODO: Conflict checking

export default mergedTypeDefs;
