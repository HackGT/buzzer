export interface NotifierPluginReturn {
	error: boolean;
	key: string;
	message: string;
}

export interface NotifierPlugin<T> { // Separate schema and notifier
	init(): Promise<Notifier<T>>;
	schema(): string;
}

export interface Notifier<T> {
	sendMessage(message: string, config: T, target?: any[]): Promise<NotifierPluginReturn[]>;
	check(config: any): Promise<T>;
	needs: string; // Will type this eventually
}
