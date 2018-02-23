import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

import * as TwitterAPI from "twit";

export default class Twitter implements GenericNotifier<{}> {
	public sendMessage =
		(message: string, config: {}): [Promise<APIReturn>] => {
			const client = new TwitterAPI({
				consumer_key: (process.env.TWITTER_CONSUMER_KEY as string),
				consumer_secret: (process.env.TWITTER_CONSUMER_SECRET as string),
				access_token: (process.env.TWITTER_HACKGT_ACCESS_TOKEN as string),
				access_token_secret: (process.env.TWITTER_HACKGT_ACCESS_TOKEN_SECRET as string)
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
