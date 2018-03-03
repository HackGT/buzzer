import { APIReturn } from "./APIReturn";
import { Plugin, GenericNotifier } from "./GenericNotifier";

interface Config {
	channels: string[];
}

class Slack implements GenericNotifier<Config> {

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

const SlackPlugin: Plugin<{}> = {
	schema: () => `{
		channels: [String!]
	}`,
	init: async () => new Slack()
};

export default SlackPlugin;
