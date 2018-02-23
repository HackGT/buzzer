import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

import * as TwitterAPI from "twit";

export default class Twitter implements GenericNotifier<{}> {
	public sendMessage =
		(message: string, config: {}): [Promise<APIReturn>] => {

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

			const client = new TwitterAPI({
				consumer_key: (consumerKey as string),
				consumer_secret: (consumerSecret as string),
				access_token: (accessToken as string),
				access_token_secret: (accessTokenSecret as string)
			});
			const params = { status: message };
			return [new Promise((resolve, reject) => {
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
			})];
		}
}
