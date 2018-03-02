import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

/* Typescript no like
 * interface Config {
 * }
 **/

export default class Facebook implements GenericNotifier<{}> {

	public schema: string = `{
		_: Boolean
	}`;

	public async setup(): Promise<void> {
		return;
	}

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
