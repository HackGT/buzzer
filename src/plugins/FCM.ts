import fetch from "node-fetch";

import { PluginSetup, Plugin, Status } from "./types";

interface Config {
  header: string;
  id: string;
}

export class FCMPlugin implements Plugin<Config> {
  private token: string;

  constructor() {
    this.token = process.env.FIREBASE_TOKEN || "";
    if (process.env.DEV_MODE !== "true") {
      if (!this.token) {
        console.error("FIREBASE_TOKEN not specified");
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public async check(configTest: any): Promise<boolean> {
    return true;
  }

  public async sendMessage(message: string, config: Config): Promise<Status[]> {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      body: JSON.stringify({
        notification: {
          body: message,
          title: config.header,
        },
        to: `/topics/${!!config.id && config.id.length >= 5 ? config.id : "all"}`,
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${this.token}`,
      },
    });

    const json = await response.text();
    const error = response.status !== 200;

    return [
      {
        error,
        key: "fcm",
        message: json.toString(),
      },
    ];
  }
}

export const FCMSetup: PluginSetup<Config> = {
  schema: () => `{
		header: String,
		id: String,
	}`,
  init: () => new FCMPlugin(),
};
