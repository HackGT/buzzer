import { plugins } from "../plugins";
import { IMessage, Message } from "../schema";
import { Status } from "../plugins/types";

interface PluginReturn {
  plugin: string;
  results: Status[];
}

const SOCKETIO_KEY = "mapgt";

export const resolvers = {
  Query: {
    getMessages: async (prev: any, args: any): Promise<IMessage[]> => {
      if (args.plugin === SOCKETIO_KEY) {
        return []; // TODO
      }

      return await Message.find({ plugin: args.plugin });
    },
    sendMessage: async (prev: any, args: any): Promise<PluginReturn[]> => {
      // Verify config for each plugin
      await Promise.all(
        Object.entries(args.plugins).map(async ([name, config]) => {
          const plugin = plugins[name];

          await plugin.check(config);
        })
      );

      // Sending function
      const pluginReturns = await Promise.all(
        Object.entries(args.plugins).map(async ([name, config]) => {
          const plugin = plugins[name];

          let pluginReturn: PluginReturn;
          try {
            pluginReturn = {
              plugin: name,
              results: await plugin.sendMessage(args.message, config),
            };
          } catch (error) {
            pluginReturn = {
              plugin: name,
              results: [
                {
                  error: true,
                  key: name,
                  message: error.toString(),
                },
              ],
            };
          }

          await Message.create({
            plugin: pluginReturn.plugin,
            message: args.message,
            config: args.plugins[pluginReturn.plugin],
            createdAt: args.createdAt,
            results: pluginReturn.results,
          });

          return pluginReturn;
        })
      );

      return pluginReturns;
    },
  },
};
