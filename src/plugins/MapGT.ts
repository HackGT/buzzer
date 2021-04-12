import { Server } from "socket.io";

import { PluginSetup, Plugin, Status } from "./types";

// MapGT will only forward expected variables
interface MapGTConfig {
  area: string;
  text: string;
  time: string;
}

const SOCKETIO_EVENT = "buzzer_message";

export class MapGTPlugin implements Plugin<MapGTConfig> {
  private socket?: Server;

  public async sendMessage(message: string, config: MapGTConfig): Promise<Status[]> {
    if (!this.socket) {
      return [
        {
          error: true,
          key: "default",
          message: "Socket is not defined",
        },
      ];
    }

    const messageJson: any = {
      message,
      area: config.area,
      text: config.text,
      time: config.time,
    };

    this.socket.emit(SOCKETIO_EVENT, messageJson);
    return [
      {
        error: false,
        key: "default",
        message: "Socket emitted",
      },
    ];
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public async check(configTest: any): Promise<boolean> {
    return true;
  }

  public setSocket(socket: Server) {
    this.socket = socket;
  }
}

// Not a real plugin due to need for socket
export const MapGTSetup: PluginSetup<MapGTConfig> = {
  schema: () => `{
		area: String
		text: String
		time: String
	}`,
  init: () => new MapGTPlugin(),
};
