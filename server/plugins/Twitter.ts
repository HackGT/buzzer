import { PluginReturn, Plugin, Notifier } from "./Plugin";

import * as TwitterAPI from "twit";

class Twitter implements Notifier<{}> {
	private consumerKey: string;
	private consumerSecret: string;
	private accessToken: string;
	private accessTokenSecret: string;
	public needs = "";

	constructor() {
		const consumerKey = process.env.TWITTER_CONSUMER_KEY;
		const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
		const accessToken = process.env.TWITTER_HACKGT_ACCESS_TOKEN;
		const accessTokenSecret = process.env.TWITTER_HACKGT_ACCESS_TOKEN_SECRET;

		if (!consumerKey) {
			console.error("Missing Twitter consumer_key env var");
		}
		if (!consumerSecret) {
			console.error("Missing Twitter consumer_secret env var");
		}
		if (!accessToken) {
			console.error("Missing Twitter access_token env var");
		}
		if (!accessTokenSecret) {
			console.error("Missing Twitter access_token_secret env var");
		}

		if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
			throw new Error("Twitter env vars missing, aborting...");
		}

		this.consumerKey = consumerKey;
		this.consumerSecret = consumerSecret;
		this.accessToken = accessToken;
		this.accessTokenSecret = accessTokenSecret;
	}

	public async check(config: any): Promise<{}> {
		return {}; // No config currently
	}

	public async sendMessage(message: string, config: {}, target: any[] = []): Promise<PluginReturn[]> {
		const client = new TwitterAPI({
			consumer_key: this.consumerKey,
			consumer_secret: this.consumerSecret,
			access_token: this.accessToken,
			access_token_secret: this.accessTokenSecret
		});
		const params = { status: message };
		const res: Promise<PluginReturn> = new Promise((resolve, reject) => {
			client.post('statuses/update', params, (error, data: { user?: { screen_name?: string }; id_str?: string }, response) => {
				if (!error) {
					if (data.user && data.user.screen_name && data.id_str) {
						const url = `https://twitter.com/${data.user.screen_name}/status/${data.id_str}`;
						resolve({
							error: false,
							key: "twitter",
							message: `Successful tweet, view at ${url}`
						});
					} else {
						resolve({
							error: false,
							key: "twitter",
							message: "Successful tweet, but error loading url"
						});
					}
				} else {
					resolve({
						error: true,
						key: "twitter",
						message: `${error.message}`
					});
				}
			});
		});
		return [await res];
	}

}

const TwitterPlugin: Plugin<{}> = {
	schema: () => `{
		_: Boolean
	}`,
	init: async () => new Twitter()
};

export default TwitterPlugin;
