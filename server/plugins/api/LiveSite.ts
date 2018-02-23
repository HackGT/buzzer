import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

/* Typescript no like
 * interface Config {
 * }
*/

export default class LiveSite implements GenericNotifier<{}> {
	public sendMessage =
		(message: string, config: {}): [Promise<APIReturn>] => {
			console.log("live site");
			return [new Promise(resolve => {
				resolve({
					error: false,
					key: "LiveSite",
					message: "Live site success"
				});
		})];
	}
}
