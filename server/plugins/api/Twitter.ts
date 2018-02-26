import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

import * as TwitterAPI from "twit";

export default class Twitter implements GenericNotifier<{}> {

	public async setup(): Promise<void> {
		const consumerKey = process.env.TWITTER_CONSUMER_KEY;
		const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
		const accessToken = process.env.TWITTER_HACKGT_ACCESS_TOKEN;
		const accessTokenSecret = process.env.TWITTER_HACKGT_ACCESS_TOKEN_SECRET;
		let envFlag: boolean = false;
		if (!consumerKey) {
			console.log("Missing Twitter consumer_key env var");
			envFlag = true;
		}
		if (!consumerSecret) {
			console.log("Missing Twitter consumer_secret env var");
			envFlag = true;
		}
		if (!accessToken) {
			console.log("Missing Twitter access_token env var");
			envFlag = true;
		}
		if (!accessTokenSecret) {
			console.log("Missing Twitter access_token_secret env var");
			envFlag = true;
		}

		if ( envFlag ) {
			throw new Error("Twitter env vars missing, aborting...");
		}

		return; // No setup currently
	}

	public async check(config: any): Promise<{}> {
		return {}; // No config currently
	}

	public async sendMessage(message: string, config: {}): Promise<[APIReturn]> {
		const client = new TwitterAPI({
			consumer_key: (process.env.TWITTER_CONSUMER_KEY as string),
			consumer_secret: (process.env.TWITTER_CONSUMER_SECRET as string),
			access_token: (process.env.TWITTER_HACKGT_ACCESS_TOKEN as string),
			access_token_secret: (process.env.TWITTER_HACKGT_ACCESS_TOKEN_SECRET as string)
		});
		const params = { status: message };
		const res = await new Promise((resolve, reject) => {
			client.post('statuses/update', params, (error: any, data: any, response: any) => {
				if (!error) {
					const url = `https:\/\/twitter.com\/${data.user.screen_name}\/status\/${data.id_str}`;
					resolve({
						error: false,
						key: "Twitter",
						message: `Successful tweet, view at ${url}`
					});
				} else {
					resolve({
						error: true,
						key: "Twitter",
						message: `${error.message}`
					});
				}
			});
		});
		return [(res as APIReturn)];
	}

}
