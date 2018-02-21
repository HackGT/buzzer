import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";
import { GenericConfig } from "./GenericConfig";

interface Config extends GenericConfig {
	channels: string[];
	message: string;
}

export default class Slack implements GenericNotifier {
	public sendMessage = (config: Config): APIReturn => {
		console.log(config.message);
		if (config.channels !== undefined) {
			console.log(config.channels);
		}
		return {
			error: 0,
			debugInfo: {
				"Channels" : config.channels
			}
		};
	}

	public TAG = "SLACK";
}
