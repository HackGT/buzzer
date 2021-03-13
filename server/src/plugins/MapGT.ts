import { PluginReturn, Notifier } from "./Plugin";

// MapGT will only forward expected variables
interface Config {
	area: string;
	title: string;
	time: string;
}

export class MapGTNotifier implements Notifier<Config> {
	private socket: any;
	public SOCKETIO_EVENT: string;

	constructor(socket: any) {
		this.socket = socket;
		this.SOCKETIO_EVENT = 'buzzer_message';
	}

	public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
		const msgJson: any = {
			message,
			area: config.area,
			title: config.title,
			time: config.time
		};
		this.socket.emit(this.SOCKETIO_EVENT, msgJson);
		return Promise.resolve([{
			error: false,
			key: "default",
			message: "Socket emitted"
		}]);
	}

	public async check(configTest: any): Promise<Config> {
		if (configTest.area) {
			if (typeof configTest.area !== "string") {
				throw new Error("'area' on MapGT plugin must be string");
			}
		}
		if (configTest.title) {
			if (typeof configTest.time !== "string") {
				throw new Error("'area' on MapGT plugin must be string");
			}
		}
		if (configTest.time) {
			if (typeof configTest.title !== "string") {
				throw new Error("'area' on MapGT plugin must be string");
			}
		}
		return configTest;
	}
}

// Not a real plugin due to need for socket
// TODO split schema and init
const MapGTPlugin = {
	schema: () => `{
		area: String
		title: String
		time: String
	}`,
	init: async (socket: any) => new MapGTNotifier(socket)
};

export default MapGTPlugin;
