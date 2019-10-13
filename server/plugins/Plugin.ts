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

export interface LiveSiteConfigType {
	title: string;
	icon: string;
}

export interface SlackConfigType {
	channels: [string];
	at_channel: boolean;
	at_here: boolean;
}

export interface TwilioConfigType {
	numbers: [string];
	groups: [string];
}

export interface TwitterConfigType {
	_: boolean;
}

export interface FCMConfigType {
	header: string;
	tags: string;
}

export interface MetaDataType {
	title: string;
	icon: string;
	channels: [string];
	at_channel: boolean;
	at_here: boolean;
	numbers: [string];
	groups: [string];
	_: boolean;
	header: string;
	tags: string;
}
