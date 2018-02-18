import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";
import { GenericConfig } from "./GenericConfig";

interface Config extends GenericConfig {
	message: string;
}

export default class Facebook implements GenericNotifier {
	public sendMessage = (config: Config): APIReturn => {
		return {
			error: 0,
			debugInfo: {
			}
		};
	}

	public TAG = "FACEBOOK";
}
