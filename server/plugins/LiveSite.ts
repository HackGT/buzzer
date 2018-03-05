import { PluginReturn, Plugin, Notifier } from "./Plugin";

/* Typescript no like
 * interface Config {
 * }
 */
class LiveSite implements Notifier<{}> {

	public async check(config: any): Promise<{}> {
		return {};
	}

	public async sendMessage(message: string, config: {}): Promise<PluginReturn[]> {
		return [{
			error: false,
			key: "LiveSite",
			message: "Live site success"
		}];
	}

}

const LiveSitePlugin: Plugin<{}> = {
	schema: () => `{
		_: Boolean
	}`,
	init: async () => new LiveSite()
};

export default LiveSitePlugin;
