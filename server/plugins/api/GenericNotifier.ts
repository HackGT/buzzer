import { APIReturn } from "./APIReturn";

export interface GenericNotifier<T> {
	sendMessage(message: string, config: T): Promise<APIReturn>;
}
