import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

export default class Twitter implements GenericNotifier<{}> {

	public async setup(): Promise<void> {
		return;
	}

	public async check(config: any): Promise<{}> {
		return {};
	}

	public async sendMessage(message: string, config: {}): Promise<[APIReturn]> {
		return [{
			error: false,
			key: "Twitter",
			message: "Twitter success"
		}];
	}

}
