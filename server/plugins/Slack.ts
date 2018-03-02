import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";

interface Config {
	channels: string[];
}

export default class Slack implements GenericNotifier<Config> {

	public schema: string = `{
		channels: [String!]
	}`;

	public async setup(): Promise<void> {
		return;
	}

	public async check(config: any): Promise<Config> {
		const channelsCheck: boolean =
			Array.isArray(config.channels) &&
			(config.channels as any[]).every(channel =>
				typeof channel === "string"
			);
		if (channelsCheck) {
			return (config as Config);
		} else {
			throw new Error("Slack config incorrect.");
		}
	}

	public async sendMessage(message: string, config: Config): Promise<[APIReturn]> {
		if (config.channels !== undefined) {
			console.log(config.channels);
		}
		return [{
			error: false,
			key: "Slack Master",
			message: "Success"
		}];
	}

}
