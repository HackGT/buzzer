import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

/* Typescript no like
 * interface Config {
 * }
**/

export default class Facebook implements GenericNotifier<{}> {
	public sendMessage =
		(message: string, config: {}): [Promise<APIReturn>] => {
			return [new Promise(resolve => {
				resolve({
					error: false,
					key: "Facebook",
					message: "Facebook success"
				});
			})];
		}
}
