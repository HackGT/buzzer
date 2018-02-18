import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";
import { GenericConfig } from "./GenericConfig";

interface Config extends GenericConfig {
	message: string;
}

export default class LiveSite implements GenericNotifier {
	public sendMessage = (config: Config): APIReturn => {
		console.log(config.message);
		return {
			error: 0,
			debugInfo: "ye"
		};
	}

	public TAG = "LIVESITE";
}
