import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

interface Config {
	groups: string[];
}

export default class Console implements GenericNotifier<Config> {
	public sendMessage =
		(message: string, config: Config): Promise<APIReturn> => {
			if (config.groups !== undefined) {
				config.groups.forEach(group => {
					console.log("Hello", group, "welcome to HackGT");
				});
			}
			return new Promise(resolve => {
				resolve({
					error: false,
					key: "Console Master",
					message: "Success"
				});
			});
		}
}
