import { APIReturn } from "./APIReturn";
import { Plugin, GenericNotifier } from "./GenericNotifier";

/* Typescript no like
 * interface Config {
 * }
 */
class LiveSite implements GenericNotifier<{}> {

	public async check(config: any): Promise<{}> {
		return {};
	}

	public async sendMessage(message: string, config: {}): Promise<[APIReturn]> {
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
