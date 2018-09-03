import * as Twilio from "twilio";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	numbers: string[]; // Well-formed phone numbers
}

export class TwilioNotifier implements Notifier<Config> {
	private sid: string;
	private token: string;
	// Refactor note: would like to have local client instead of sid, token, ts difficulties
	constructor() {
		const sid = process.env.TWILIO_SID;
		const token = process.env.TWILIO_TOKEN;

		if (!sid) {
			console.error("Missing TWILIO_SID!");
		}
		if (!token) {
			console.error("Missing TWILIO_TOKEN!");
		}

		if (!sid || !token) {
			throw new Error("Missing twilio env vars. exiting.");
		}

		this.sid = sid;
		this.token = token;
	}

	private async sendOneMessage(message: string, recipient: string): Promise<PluginReturn> {
		const client = Twilio(this.sid, this.token);
		return client.messages.create({
			body: message,
			to: recipient,
			from: '+14702602302' // From a valid Twilio number
		})
		.then((msg) => {
			return {
				error: false,
				key: recipient,
				message: `Identifier: ${msg.sid}`
			};
		})
		.catch((err) => {
			return {
				error: true,
				key: recipient,
				message: `${err}`
			};
		});
	}

	public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
		// Should use copilot to manage sending of messages - WIP
		console.log(`sending message ${message} with config ${config.numbers}`);
		return await Promise.all(config.numbers.map((phoneNumber) => {
			return this.sendOneMessage(message, phoneNumber);
		}));
	}

	public async check(configTest: any): Promise<Config> {
		// Check should verify target numbers are registered in HackGT registration/checkin - skipping this step for now.
		return TwilioNotifier.instanceOfConfig(configTest);
	}

	public static instanceOfConfig(object: any): Config {
		if (!Array.isArray(object.numbers)) {
			throw new Error("'numbers' must be an array");
		}
		if (!object.numbers.every((phoneNumber: any) => true)) {
			// TODO: replace 'true' with phone number regex check
			throw new Error("Malformed phone number in config");
		}

		return {
			numbers: object.numbers
		};
	}

}

const TwilioPlugin: Plugin<Config> = {
	schema: () => `{
		numbers: [String!]!
	}`,
	init: async () => new TwilioNotifier()
};

export default TwilioPlugin;
