import fetch from "node-fetch";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	header: string;
	id: string;
}

class FCM implements Notifier<Config> {
	private token: string;

	constructor() {
		const token = process.env.FIREBASE_TOKEN || "";
		const devMode = process.env.DEV_MODE;
		if (devMode !== "True") {
			if (!token) {
				console.error("FIREBASE_TOKEN not specified");
			}

			this.token = token;
		}

	}

	public static instanceOfConfig(object: any): Config {
		if (typeof object.header !== "string") {
			throw new Error("Header must be a string");
		}

		if (typeof object.id !== "string") {
			throw new Error("Id must be a string");
		}

		return {
			header: object.header,
			id: object.id
		};
	}

	public async check(configTest: any): Promise<Config> {
		const config = FCM.instanceOfConfig(configTest);

		return config;
	}

	public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
		const response = await fetch("https://fcm.googleapis.com/fcm/send", {
			method: "POST",
			body: JSON.stringify({
				notification: {
					body: message,
					title: config.header
				},
				to: `/topics/${(!!config.id || config.id.length < 5 ? config.id : "all")}`
			}),
			headers: {
				"Content-Type": "application/json",
				"Authorization": `key=${this.token}`
			}
		});

		const json = await response.text();
		const error = response.status !== 200;

		return [{
			error,
			key: "fcm",
			message: json.toString()
		}];
	}
}

const FCMPlugin: Plugin<Config> = {
	schema: () => `{
		header: String,
		id: String,
	}`,
	init: async () => new FCM()
};

export default FCMPlugin;
