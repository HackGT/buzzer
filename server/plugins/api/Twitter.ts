import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

export default class Twitter implements GenericNotifier<{}> {
	public sendMessage =
		(message: string, config: {}): [Promise<APIReturn>] => {
			return [new Promise(resolve => {
				resolve({
					error: false,
					key: "Twitter",
					message: "Twitter success"
				});
			})];
		}
}
