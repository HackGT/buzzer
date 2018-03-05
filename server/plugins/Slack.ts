import * as querystring from "querystring";
import fetch from "node-fetch";
import {Plugin, GenericNotifier} from "./GenericNotifier";
import {APIReturn} from "./APIReturn";

interface Config {
	channels: string[];
}

class Slack implements GenericNotifier<Config> {
	private token: string;
	private domain: string;
	private username: string;

	constructor() {
		const token = process.env.SLACK_TOKEN;
		const domain = process.env.SLACK_DOMAIN;
		const username = process.env.SLACK_USERNAME;

		if (!token) {
			console.error("Missing Slack token env var");
		}
		if (!domain) {
			console.error("Missing Slack domain env var");
		}
		if (!username) {
			console.error("Missing Slack username env var");
		}

		if (!token || !domain || !username) {
			throw new Error("Slack env vars missing, aborting...");
		}

		this.token = token;
		this.domain = domain;
	}

	public async sendMessage(message: string, config: Config): Promise<APIReturn[]> {
		return await Promise.all(config.channels.map(chan => (async () => {
			const msg = {
				token: this.token,
				channel: chan,
				as_user: false,
				username: this.username,
				text: message
			};

			const qs = querystring.stringify(msg);

			const res = await fetch(`https://${this.domain}.slack.com/api/chat.postMessage?${qs}`);
			const json = await res.json();

			return {
				error: !json.ok,
				key: chan,
				message: json.ok? "Message posted at channel: " + chan : json.error
			};
		})()));
	}

	public async check(configTest: any): Promise<Config> {

		const qs = querystring.stringify({
			token: this.token,
			exclude_archived: true,
			exclude_members: true
		});

		const config = this.instanceOfConfig(configTest);

		if (config.channels.length === 0) {
			throw new Error('Must specify at least one slack channel');
		}

		const res = await fetch(`https://${this.domain}.slack.com/api/channels.list?${qs}`);
		const channels: { channels?: { name: string }[] } = await res.json();

		const res2 = await fetch(`https://${this.domain}.slack.com/api/groups.list?${qs}`);
		const groups: { groups?: { name: string }[] } = await res2.json();

		if (!groups.groups || !channels.channels) {
			throw new Error("Could not verify slack channels.");
		}

		const everything = channels.channels
			.map(c => c.name)
			.concat(groups.groups.map(c => c.name));

		const invalid = config.channels.filter(c => !everything.includes(c));

		if (invalid.length !== 0) {
			throw new Error(`Invalid slack channels / groups: ${invalid}`);
		}
		return config;
	}

	private instanceOfConfig(object: any): Config {
		const channelsCheck: boolean =
			Array.isArray(object.channels) &&
			(object.channels as any[]).every(channel =>
				typeof channel === "string"
			);
		if (!channelsCheck) {
			throw new Error("Slack config should have a channels variable which is an array of strings.");
		}
		return object as Config;
	}
}

const SlackPlugin: Plugin<Config> = {
	schema: () => `{
		channels: [String!]!
	}`,
	init: async () => new Slack()
};

export default SlackPlugin;
