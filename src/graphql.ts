import { upperCamel } from "./util";
import { SOCKETIO_KEY } from "./typeDefs";
import { MetaDataType, PluginReturn } from "./plugins/Plugin";
import { plugins, logs } from "./plugins";

interface IPluginReturn {
  plugin: string;
  errors: PluginReturn[];
}

interface IMessageReturn {
  _id: string;
  message: string;
  config: MetaDataType;
  createdAt: string;
  updatedAt: string;
}

export const resolvers = {
  Query: {
    get_messages: async (prev: any, args: any): Promise<IMessageReturn[]> => {
      const { plugin } = args;
      if (plugin === SOCKETIO_KEY) {
        return []; // TODO
      }
      const returnDocs = await new Promise<IMessageReturn[]>(resolve => {
        logs[upperCamel(plugin)].find({}, (err: any, docs: any) => {
          resolve(docs);
        });
      });
      return returnDocs;
    },
    send_message: async (prev: any, args: any): Promise<IPluginReturn[]> => {
      const { message } = args;
      const checkQueue = Object.keys(args.plugins).map(rawName =>
        (async () => {
          // Loading checkQueue IIFE
          // Upper Cameled
          const name = rawName === "mapgt" ? rawName : upperCamel(rawName);
          const plugin = plugins[name];

          const verifiedConfig = await plugin.check(args.plugins[rawName]); // Verify

          return async () => {
            // Sending function
            try {
              const pluginReturn = {
                plugin: name,
                errors: await plugin.sendMessage(message, verifiedConfig),
              };
              return pluginReturn;
            } catch (e) {
              return {
                plugin: name,
                errors: [
                  {
                    error: true,
                    key: name,
                    message: e.toString(),
                  },
                ],
              };
            }
          };
        })()
      );

      const sendingQueue = await Promise.all(checkQueue);
      return Promise.all(
        sendingQueue.map(async f => {
          const result = await f();
          const p = result.plugin
            .split(/(?=[A-Z])/)
            .join("_")
            .toLowerCase();
          const insertArg = {
            _id: args._id, // eslint-disable-line no-underscore-dangle
            message: args.message,
            config: args.plugins[p],
            createdAt: args.createdAt,
            errors: result.errors,
          };
          const dbName = result.plugin === "mapgt" ? result.plugin : upperCamel(result.plugin);
          logs[dbName].insert(insertArg);
          return result; // We catch in sending function
        })
      ); // Send all!
    },
  },
};
