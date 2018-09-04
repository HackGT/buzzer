import * as Twilio from "twilio";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	numbers: string[]; // Well-formed phone numbers
}

export class TwilioNotifier implements Notifier<Config> {
	private sid: string;
	private token: string;
	private serviceSid: string;

	// Refactor note: would like to have local client instead of sid, token, ts difficulties
	constructor() {
		const sid = process.env.TWILIO_SID;
		const token = process.env.TWILIO_TOKEN;
		const serviceSid = process.env.TWILIO_SERVICE_SID;
		if (!sid) {
			console.error("Missing TWILIO_SID!");
		}
		if (!token) {
			console.error("Missing TWILIO_TOKEN!");
		}
		if (!serviceSid) {
			console.error("Missing TWILIO_SERVICE_SID");
		}

		if (!sid || !token || !serviceSid) {
			throw new Error("Missing twilio env vars. exiting.");
		}

		this.sid = sid;
		this.token = token;
		this.serviceSid = serviceSid;
		console.log(serviceSid);
	}

	// Should provide a programmatic way of setting up service and numbers that runs once
	// For now phone number setup done on Twilio dashboard https://www.twilio.com/console/sms/services
	public async setupService() {
		console.log("Twilio programmatic setup not implemented");
	}

	private async sendOneMessage(message: string, recipient: string): Promise<PluginReturn> {
		const client = Twilio(this.sid, this.token);
		return client
			.messages
			.create({
				body: message,
				messagingServiceSid: this.serviceSid,
				to: recipient
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
		console.log(`Sending message ${message} with config ${config.numbers}`);
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
