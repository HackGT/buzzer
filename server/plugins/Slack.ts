import * as querystring from "querystring";
import fetch from "node-fetch";
import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	channels: string[];
	at_channel: boolean;
	at_here: boolean;
}

export class Slack implements Notifier<Config> {
	private url: string;
	private token: string;

	constructor() {
		const url = process.env.SLACK_WEBHOOK_URL || "sample";
		const token = process.env.SLACK_TOKEN || "sample";

		if (!url) {
			console.error("Missing SLACK_WEBHOOK_URL!");
		}
		if (!token) {
			console.error("Missing SLACK_TOKEN!");
		}

		if (!url || !token) {
			throw new Error("Missing slack env vars. exiting.");
		}

		this.url = url;
		this.token = token;
	}

	private async sendOneMessage(message: string, channel?: string): Promise<PluginReturn> {
		const body = await fetch(this.url, {
			method: "POST",
			body: JSON.stringify({
				text: message,
				channel: channel? `#${channel}` : undefined
			}),
			headers: {
				"Content-Type": "application/json"
			}
		}).then(res => res.text());

		return {
			error: body !== "ok",
			key: channel || "default",
			message: body
		};
	}

	public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
		// Slack webhooks have a default channel, add a sentinel
		if (config.channels.length === 0) {
			return [
				await this.sendOneMessage(Slack.processMessage(config, message))
			];
		}

		return await Promise.all(config.channels.map(chan => {
			return this.sendOneMessage(Slack.processMessage(config, message), chan);
		}));
	}

	public async check(configTest: any): Promise<Config> {
		const config = Slack.instanceOfConfig(configTest);

		// If there no channels we don't have to make a request to check them
		if (config.channels.length === 0) {
			return config;
		}

		const qs = querystring.stringify({
			token: this.token,
			exclude_archived: true,
			exclude_members: true
		});

		const destinations = await Promise.all([
			fetch(`https://slack.com/api/channels.list?${qs}`)
				.then(r => r.json())
				.then((json: { channels?: { name: string }[] }) => {
					return json.channels? json.channels.map(c => c.name) : json;
				}),
			fetch(`https://slack.com/api/groups.list?${qs}`)
				.then(r => r.json())
				.then((json: { groups?: { name: string }[] }) => {
					return json.groups? json.groups.map(c => c.name) : json;
				})
		]);

		for (const dest of destinations) {
			if (!Array.isArray(dest)) {
				throw new Error(`Could not retrieve channels / groups: ${JSON.stringify(dest)}`);
			}
		}

		const everything = [].concat.apply([], destinations);
		const invalid = config.channels.filter(c => !everything.includes(c));

		if (invalid.length !== 0) {
			throw new Error(`Invalid slack channels / groups: ${invalid}`);
		}
		return config;
	}

	public static instanceOfConfig(object: any): Config {
		// Check channels
		if (!Array.isArray(object.channels)) {
			throw new Error("'channels' must be an array");
		}
		if (!object.channels.every((channel: any) => typeof channel === "string")) {
			throw new Error("Slack config should have a channels variable which is an array of strings.");
		}

		return {
			channels: object.channels,
			at_channel: !!object.at_channel,
			at_here: !!object.at_here
		};
	}

	public static processMessage(config: Config, msg: string): string {
		if (config.at_here) {
			msg = `<!here> ${msg}`;
		}
		if (config.at_channel) {
			msg = `<!channel> ${msg}`;
		}
		return msg;
	}
}

const SlackPlugin: Plugin<Config> = {
	schema: () => `{
		channels: [String!]!
		at_channel: Boolean!
		at_here: Boolean!
	}`,
	init: async () => new Slack()
};

export default SlackPlugin;
