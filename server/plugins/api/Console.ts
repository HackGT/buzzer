import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

interface Config {
	groups: string[];
}

export default class Console implements GenericNotifier<Config> {
	public sendMessage =
		(message: string, config: Config): Promise<APIReturn> => {
			if (config.groups !== undefined && config.groups.length > 0) {
				config.groups.forEach(group => {
					console.log(message, group);
				});
			} else {
				console.log(message);
			}
			console.log("\n\n");
			return new Promise(resolve => {
				resolve({
					error: false,
					key: "Console Master",
					message: "Success"
				});
			});
		}
}
