import * as Twilio from "twilio";
import fetch from "node-fetch";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
	numbers: string[]; // Well-formed phone numbers
	groups: string[]; // Groups to message - queried from registration - this will be based on participant type, until registration api clarifies
}

interface UserQuestionData {
	question: {
		value: string;
	};
}

/*
	 Todo: fuzzy search
 */
export class TwilioNotifier implements Notifier<Config> {
	private sid: string;
	private token: string;
	private serviceSid: string;
	private registrationKey: string;
	private registrationUrl: string;
	// Refactor note: would like to have local client instead of sid, token, ts difficulties
	constructor() {
		const sid = process.env.TWILIO_SID;
		const token = process.env.TWILIO_TOKEN;
		const serviceSid = process.env.TWILIO_SERVICE_SID;
		const registrationKey = process.env.REGISTRATION_KEY;
		const registrationUrl = process.env.REGISTRATION_GRAPHQL;

		// TODO: replace legalTags with a query call to registration API
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
		if (!registrationUrl) {
			console.error("Missing REGISTRATION_GRAPHQL");
		}

		if (!sid || !token || !serviceSid || !registrationKey || !registrationUrl) {
			throw new Error("Missing twilio env vars. exiting.");
		}

		this.sid = sid;
		this.token = token;
		this.serviceSid = serviceSid;
		this.registrationKey = Buffer.from(registrationKey).toString('base64');
		this.registrationUrl = registrationUrl;
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
	private async queryRegistration(filterString: string): Promise<UserQuestionData[]> {
		let processedUsers: UserQuestionData[] = [];
		let page = "";
		const batchSize = 50;
		while (true) {
			const response = await fetch(this.registrationUrl, {
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

			let json;
			try {
				json = await response.json();
				if (!json.data || !json.data.users || json.data.users.length === 0) {
					break;
				}
			} catch (err) {
				console.log(err);
				break; // Failed
			}
			let users: any[] = json.data.users;
			page = users[users.length - 1].pagination_token;
			const cleanUsers: UserQuestionData[] = [];
			users.forEach((u: any) => {
				delete u.pagination_token;
				if (u.question && u.question.value) {
					cleanUsers.push(u as UserQuestionData);
				}
			});
			processedUsers = processedUsers.concat(cleanUsers);
		}
		return processedUsers;
	}

	public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
		// Best effort policy, send as many messages as possible, don't care about success/fail of individual (Don't wait for returns)
		console.log(`Sending message ${message} with config ${config}`);
		config.numbers.map((phoneNumber) => this.sendOneMessage(message, phoneNumber)); // Explicit number sending

		const groupNames = config.groups.map(name => name.toLowerCase());

		let queries;
		if (config.groups.includes("all")) {
			queries = [""]; // No filter query
		} else {
			const branchNames: string[] = [];
			groupNames.forEach((g: string, index: number) => {
				switch (g) {
					case "participant":
						branchNames.push("Participant - Travel Reimbursement");
						branchNames.push("Participant - No Travel Reimbursement");
						break;
					case "mentor":
					case "volunteer":
						branchNames.push(g[0].toUpperCase() + g.slice(1)); // Capitalize
						break;
					default:
						if (index < config.groups.length) {
							branchNames.push(config.groups[index]);
						}
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
			this.sendOneMessage(message, num).catch((err) => {
				console.log(err);
			}); // Do nothing with error - satisfy lint
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
		const config: Config = {
			numbers: [],
			groups: []
		};

		if (object.numbers) {
			if (!Array.isArray(object.numbers)) {
				throw new Error("'numbers' must be an array");
			}
			if (object.numbers.length === 0) {
				throw new Error("Empty 'numbers' arg");
			}
			if (!object.numbers.every((phoneNumber: any) => typeof phoneNumber === "string")) {
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
			const legalTagString = process.env.REGISTRATION_LEGAL_TAGS; // Static method, this can't be a class attr.
			if (!legalTagString) {
				throw new Error("No registration tags provided");
			}
			const legalTags = legalTagString.split(",");
			if (!object.groups.every((tag: any) => (typeof tag === "string" && legalTags.includes(tag.toLowerCase())))) {
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
