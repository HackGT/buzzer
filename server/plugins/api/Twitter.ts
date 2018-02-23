import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

import * as TwitterAPI from "twitter";

export default class Twitter implements GenericNotifier<{}> {
	public sendMessage =
		(message: string, config: {}): [Promise<APIReturn>] => {
			const client = new TwitterAPI({
				consumer_key: 'U5dlVnBUGN9jXx9AhR8zjPiEn',
				consumer_secret: 'Vq3RzZbi3q7lD6JqfF4IJC3YdZPYeBJXAsnveBDKY5pmaPTRBg',
				access_token_key: '4455137243-9GCu6236kMaje8HLYjZoK3dXSq9CuEJbGA2HujK',
				access_token_secret: '9XYxvm3SzkDFh02YaUrI59PN70b4u3DsQ6RN1LXeGQUbl'
			});
			const params = { screen_name: 'nodejs' };
			client.get('statuses/user_timeline', params, (error: any, tweets: any, response: any) => {
				if (!error) {
					console.log(tweets);
				}
			});
			return [new Promise(resolve => {
				resolve({
					error: false,
					key: "Twitter",
					message: "Twitter success"
				});
			})];
		}
}
