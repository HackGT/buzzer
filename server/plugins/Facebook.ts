import { APIReturn } from "./APIReturn";
import { Plugin, GenericNotifier } from "./GenericNotifier";
/* Typescript no like
 * interface Config {
 * }
 **/

class Facebook implements GenericNotifier<{}> {

	public async check(config: any): Promise<{}> {
		return {};
	}

	public async sendMessage(message: string, config: {}): Promise<[APIReturn]> {
		return [{
			error: false,
			key: "Facebook",
			message: "Facebook success"
		}];
	}

}

const FacebookPlugin: Plugin<{}> = {
	schema: () => `{
		_: Boolean
	}`,
	init: async () => new Facebook()
};

export default FacebookPlugin;
