import * as Twilio from "twilio";
import fetch from "node-fetch";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	numbers?: string[]; // Well-formed phone numbers
	groups?: string[]; // Groups to message - queried from registration - this will be based on participant type, until registration api clarifies
}

/*
	 Todo: fuzzy search
	 Currently hardcoded group tags: (all lowercased)
	 Participant - fowards to participant with and without travel reimbursement
	 Mentor
	 Volunteer
	 All
*/
export class TwilioNotifier implements Notifier<Config> {
	private sid: string;
	private token: string;
	private serviceSid: string;
	private registrationKey: string;

	// Refactor note: would like to have local client instead of sid, token, ts difficulties
	constructor() {
		const sid = process.env.TWILIO_SID;
		const token = process.env.TWILIO_TOKEN;
		const serviceSid = process.env.TWILIO_SERVICE_SID;
		const registrationKey = process.env.REGISTRATION_KEY;

		if (!sid) {
			console.error("Missing TWILIO_SID!");
		}
		if (!token) {
			console.error("Missing TWILIO_TOKEN!");
		}
		if (!serviceSid) {
			console.error("Missing TWILIO_SERVICE_SID");
		}
		if (!registrationKey) {
			console.error("Missing REGISTRATION_KEY");
		}

		if (!sid || !token || !serviceSid || !registrationKey) {
			throw new Error("Missing twilio env vars. exiting.");
		}

		this.sid = sid;
		this.token = token;
		this.serviceSid = serviceSid;
		this.registrationKey = Buffer.from(registrationKey).toString('base64');
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

	/* Wrapper to query with pagination */
	private async queryRegistration(filterString: string): Promise<any[]> {
		let processedUsers: any[] = []; // Todo: typing
		let page = "";
		const batchSize = 50;
		while (true) {
			const response = await fetch("https://registration.hack.gt/graphql", {
				method: "POST",
				body: JSON.stringify({
					query: `query {
  			    users(n:${batchSize}, pagination_token: "${page}", filter: {
				      applied:true, ${filterString}
			      }) {
				      question(name: "phone-number") {
					      value
				      }
              pagination_token
			      }
		      }`
				}),
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Basic ${this.registrationKey}`
				}
			});

			let json = await response.json(); // TODO: read error code
			if (!json.data || !json.data.users || json.data.users.length === 0) {
				break;
			}
			let users: any[] = json.data.users;
			page = users[users.length - 1].pagination_token;
			users.forEach((u: any) => {
				delete u.pagination_token;
			});
			processedUsers = processedUsers.concat(users);
		}
		return processedUsers;
	}

	public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
		// Best effort policy, send as many messages as possible, don't care about success/fail of individual
		console.log(`Sending message ${message} with config ${config}`);
		if (!config.groups) {
			if (config.numbers) {
				return await Promise.all(config.numbers.map((phoneNumber) => {
					return this.sendOneMessage(message, phoneNumber);
				}));
			} else {
				return [{
					error: true,
					key: "twilio",
					message: "No config provided" // TODO: this should be in check, make a better interface
				}];
			}
		}

		config.groups = config.groups.map(name => name.toLowerCase());

		let queries;
		if (config.groups.includes("all")) {
			queries = [""]; // No filter query
		} else {
			const branchNames: string[] = [];
			config.groups.forEach((g: string) => {
				switch (g) {
					case "participant":
						branchNames.push("Participant - Travel Reimbursement");
						branchNames.push("Participant - No Travel Reimbursement");
						break;
					case "mentor":
					case "volunteer":
						branchNames.push(g[0].toUpperCase() + g.slice(1)); // Capitalize
						break;
				}
			});
			queries = branchNames.map((qs: string) => `application_branch: "${qs}"`);
		}

		const usersLists = await Promise.all(queries.map((q: string) => this.queryRegistration(q)));
		const users = [].concat.apply([], usersLists);

		users.forEach((u: any) => {
			if (!u.question || !u.question.value) return;
			const num = TwilioNotifier.cleanNumber(u.question.value);
			if (!num) return; // Invalid format
			else console.log(num);
			// Temp: this.sendOneMessage(message, num);
		});

		return [{
			error: false,
			key: "twilio",
			message: "Twilio API successfully queried"
		}];

	}

	public async check(configTest: any): Promise<Config> {
		// Check should verify target numbers are registered in HackGT registration/checkin - skipping this step for now.
		return TwilioNotifier.instanceOfConfig(configTest);
	}

	public static instanceOfConfig(object: any): Config {
		const config: Config = {};
		if (object.numbers) {
			if (!Array.isArray(object.numbers)) {
				throw new Error("'numbers' must be an array");
			}
			if (object.numbers.length === 0) {
				throw new Error("Empty 'numbers' arg");
			}
			if (!object.numbers.every((phoneNumber: any) => true)) {
				// TODO: replace 'true' with phone number regex check
				throw new Error("Malformed phone number in config");
			}
			config.numbers = object.numbers;
		}

		if (object.groups) {
			if (!Array.isArray(object.groups)) {
				throw new Error("'groups' must be an array");
			}
			if (object.groups.length === 0) {
				throw new Error("Empty 'groups' arg");
			}
			if (!object.groups.every((phoneNumber: any) => true)) {
				// TODO: replace 'true' with a validity check query call to registration API
				throw new Error("Invalid group tag"); // TODO provide info about which tag is invalid
			}
			config.groups = object.groups;
		}

		return config;
	}

	private static cleanNumber(numRaw: string) {
		// Naive cleanup - trim all non digit numbers, add a plus 1 if it doesn't exist
		if (numRaw.length < 10) return null;
		const hasCountryCode = numRaw.charAt(0) === '+';
		if (hasCountryCode) numRaw = numRaw.substring(1);
		const num = numRaw.replace(/\D/g,'');
		if (!hasCountryCode) return `+1${num}`; // Assume US number
		return `+${num}`;
	}
}

const TwilioPlugin: Plugin<Config> = {
	schema: () => `{
		numbers: [String!]
    groups: [String!]
	}`,
	init: async () => new TwilioNotifier()
};

export default TwilioPlugin;
