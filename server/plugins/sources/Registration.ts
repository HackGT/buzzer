import { Source, SourceOptions, SourceReturn } from "./Plugin";
import fetch from "node-fetch";

const registrationApi = "dummy";

export class Registration implements Source {
	private token: string;

	constructor() {
		const token = process.env.REGISTRATION_TOKEN;
		if (!token) {
			console.error("Missing SLACK_TOKEN!");
		}
		if (!token) {
			throw new Error("Missing registration env vars. exiting.");
		}
		this.token = token;
	}

	public async options(): Promise<SourceOptions> {
		const dummyRet = Promise.resolve({
			"grade": ["9, 10, 11, 12"]
		});
		return dummyRet;
	}

	public async filter(filterDict: SourceOptions): Promise<SourceReturn> {
		const body = await fetch(registrationApi, {
			method: "POST",
			body: JSON.stringify({
				options: filterDict,
				token: this.token
			}),
			headers: {
				"Content-Type": "application/json"
			}
		}).then(res => res.json()); // Does json return arrays?

		return {
			error: body && body.length !== 0 ? "ok" : "Error or no matches", // Should give warning if body empty
			targets: body
		};
	}
}
