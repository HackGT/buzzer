import { APIReturn } from "./APIReturn";

export interface Plugin<T> { // Separate schema and notifier
	init(): Promise<GenericNotifier<T>>;
	schema(): string;
}

export interface GenericNotifier<T> {
	sendMessage(message: string, config: T): Promise<[APIReturn]>;
	check(config: any): Promise<T>;
}
