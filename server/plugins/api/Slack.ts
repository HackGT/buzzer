import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

interface Config {
	channels: string[];
}

export default class Slack implements GenericNotifier<Config> {
	public sendMessage =
		(message: string, config: Config): [Promise<APIReturn>] => {
			if (config.channels !== undefined) {
				console.log(config.channels);
			}
			return [new Promise(resolve => {
				resolve({
					error: false,
					key: "Slack Master",
					message: "Success"
				});
			})];
		}
}
