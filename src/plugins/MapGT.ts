import { PluginReturn, Notifier } from "./Plugin";

// MapGT will only forward expected variables
interface Config {
  area: string;
  title: string;
  time: string;
}

const SOCKETIO_EVENT = "buzzer_message";

export class MapGT implements Notifier<Config> {
  private socket: any;

  constructor(socket: any) {
    this.socket = socket;
  }

  public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
    const messageJson: any = {
      message,
      area: config.area,
      title: config.title,
      time: config.time,
    };

    this.socket.emit(SOCKETIO_EVENT, messageJson);
    return Promise.resolve([
      {
        error: false,
        key: "default",
        message: "Socket emitted",
      },
    ]);
  }

  // eslint-disable-next-line class-methods-use-this
  public async check(configTest: any): Promise<Config> {
    return {
      area: configTest.area,
      title: configTest.title,
      time: configTest.time,
    };
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
  init: (socket: any) => new MapGT(socket),
};

export default MapGTPlugin;
