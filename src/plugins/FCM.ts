import fetch from "node-fetch";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
  header: string;
  id: string;
}

class FCM implements Notifier<Config> {
  private token: string;

  constructor() {
    this.token = process.env.FIREBASE_TOKEN || "";
    if (process.env.DEV_MODE !== "True") {
      if (!this.token) {
        console.error("FIREBASE_TOKEN not specified");
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async check(configTest: any): Promise<Config> {
    if (typeof configTest.header !== "string") {
      throw new Error("Header must be a string");
    }

    return {
      header: configTest.header,
      id: configTest.id,
    };
  }

  public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
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

const FCMPlugin: Plugin<Config> = {
  schema: () => `{
		header: String,
		id: String,
	}`,
  init: () => new FCM(),
};

export default FCMPlugin;
