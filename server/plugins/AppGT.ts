import fetch from "node-fetch";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	header: string;
	tags: string;
}

class AppGT implements Notifier<Config> {
	private token: string;

	constructor() {
		const token = process.env.FIREBASE_TOKEN || "";
		const devMode = process.env.DEV_MODE;
		if (devMode !== "True") {
			if (!token) {
				console.error("FIREBASE_token not specified");
			}

			this.token = token;
		}

	}

	public static instanceOfConfig(object: any): Config {
		if (typeof object.header !== "string") {
			throw new Error("Header must be a string");
		}

		if (typeof object.tags !== "string") {
			throw new Error("Tags must be a string");
		}

		return {
			header: object.header,
			tags: object.tags
		};
	}

	public async check(configTest: any): Promise<Config> {
		const config = AppGT.instanceOfConfig(configTest);

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
				data: {
					tags: config.tags
				},
				to: "/topics/all"
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
			key: "app_gt",
			message: json.toString()
		}];
	}
}

const AppGTPlugin: Plugin<Config> = {
	schema: () => `{
		header: String,
		tags: String
	}`,
	init: async () => new AppGT()
};

export default AppGTPlugin;
