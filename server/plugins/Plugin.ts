export interface PluginReturn {
	error: boolean;
	key: string;
	message: string;
}

export interface Plugin<T> { // Separate schema and notifier
	init(): Promise<Notifier<T>>;
	schema(): string;
}

export interface Notifier<T> {
	sendMessage(message: string, config: T): Promise<PluginReturn[]>;
	check(config: any): Promise<T>;
}
