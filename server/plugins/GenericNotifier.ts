import { APIReturn } from "./APIReturn";

export interface GenericNotifier<T> {
	schema: string;
	sendMessage(message: string, config: T): Promise<[APIReturn]>;
	setup(): Promise<void>;
	check(config: any): Promise<T>;
}
