import fetch from "node-fetch";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	title?: string;
	icon?: string;
}

class LiveSite implements Notifier<Config> {
	private appId: string;
	private apiKey: string;
	private title: string | undefined;

	constructor() {
		const appId = process.env.ONESIGNAL_APP_ID;
		const apiKey = process.env.ONESIGNAL_API_KEY;
		this.title = process.env.ONESIGNAL_DEFAULT_TITLE;

		if (!appId) {
			console.error("ONESIGNAL_APP_ID not specified");
		}
		if (!apiKey) {
			console.error("ONESIGNAL_API_KEY key not specified");
		}

		if (!appId || !apiKey) {
			throw new Error("Some live site env vars not specified");
		}

		this.appId = appId;
		this.apiKey = apiKey;
	}

	public async check(config: any): Promise<Config> {
		if (config.title && typeof config.title !== "string") {
			throw new Error("title must be a string!");
		}
		if (config.icon && typeof config.icon !== "string") {
			throw new Error("icon must be a string!");
		}
		return{
			title: config.title,
			icon: config.icon
		};
	}

	public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
		const response = await fetch("https://onesignal.com/api/v1/notifications", {
			method: "POST",
			body: JSON.stringify({
				app_id: this.appId,
				contents: {
					en: message
				},
				headings: {
					en: config.title || this.title
				},
				chrom_web_icon: config.icon,
				included_segments: ["All"]
			}),
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Basic ${this.apiKey}`
			}
		});

		const json = await response.json();
		const error = response.status !== 200;

		return [{
			error,
			key: "live_site",
			message: error? json.errors.toString() : null
		}];
	}
}

const LiveSitePlugin: Plugin<Config> = {
	schema: () => `{
		title: String
		icon: String
	}`,
	init: async () => new LiveSite()
};

export default LiveSitePlugin;
