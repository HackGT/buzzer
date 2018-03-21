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
	sendMessage(message: string, config: T, target?: any[]): Promise<PluginReturn[]>;
	check(config: any): Promise<T>;
	needs: string; // Will type this eventually
}
