import Twilio from "twilio";
import fetch from "node-fetch";

import { PluginSetup, Plugin, Status } from "./types";
import { flatten } from "../util";

interface Config {
  numbers: string[]; // Well-formed phone numbers
  groups: string[]; // Groups to message - queried from registration - this will be based on participant type, until registration api clarifies
}

const MAX_USERS_BATCH = 2000;
const REGISTRATION_QUERY = (filterString: string) => `
query {
  users(n:${MAX_USERS_BATCH}, filter: { applied:true, ${filterString} }) {
    question(name: "phone-number") {
      value
    }
  }
}
`;

/*
	 Todo: fuzzy search
 */
export class TwilioPlugin implements Plugin<Config> {
  private client: Twilio.Twilio;
  private serviceSid: string;
  private registrationKey: string;
  private registrationUrl: string;

  constructor() {
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID || "AC",
      process.env.TWILIO_AUTH_TOKEN || " "
    );
    this.serviceSid = process.env.TWILIO_SERVICE_SID || "";
    this.registrationKey = Buffer.from(process.env.REGISTRATION_KEY || "").toString("base64");
    this.registrationUrl = process.env.REGISTRATION_GRAPHQL || "";

    if (process.env.DEV_MODE !== "True") {
      if (!this.client || !this.serviceSid || !this.registrationKey || !this.registrationUrl) {
        throw new Error("Missing twilio env vars. exiting.");
      }
    }
  }

  private async sendOneMessage(message: string, recipient: string): Promise<Status> {
    try {
      const msg = await this.client.messages.create({
        body: message,
        messagingServiceSid: this.serviceSid,
        to: recipient,
      });

      return {
        error: false,
        key: recipient,
        message: `Identifier: ${msg.sid}`,
      };
    } catch (error) {
      return {
        error: true,
        key: recipient,
        message: `${error}`,
      };
    }
  }

  private async getUserNumbers(filterString: string): Promise<string[]> {
    const response = await fetch(this.registrationUrl, {
      method: "POST",
      body: JSON.stringify({
        query: REGISTRATION_QUERY(filterString),
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${this.registrationKey}`,
      },
    });

    try {
      const json = await response.json();
      const { users } = json.data;

      return users
        .filter((user: any) => user.question?.value)
        .map((user: any) => user.question.value);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async sendMessage(message: string, config: Config): Promise<Status[]> {
    let allNumbers = config.numbers;

    if (config.groups.length > 0) {
      const groupNames = config.groups.map(name => name.toLowerCase().trim());
      let queries: string[];

      if (groupNames.includes("all")) {
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

      const registrationNumbers: string[] = flatten(
        await Promise.all(queries.map(query => this.getUserNumbers(query)))
      );

      allNumbers = allNumbers.concat(registrationNumbers);
    }

    return await Promise.all(
      allNumbers.map(number => {
        const cleanedNumber = TwilioPlugin.cleanNumber(number);
        if (!cleanedNumber) {
          return Promise.resolve({
            error: true,
            key: number,
            message: "Invalid number provided",
          });
        }

        return this.sendOneMessage(message, cleanedNumber);
      })
    );
  }

  // TODO: Check should verify target numbers are registered in HackGT registration/checkin - skipping this step for now.
  // eslint-disable-next-line class-methods-use-this
  public async check(configTest: any): Promise<boolean> {
    if (configTest.numbers.length > 0) {
      const phoneNumberTest = (phoneNumber: string) =>
        /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phoneNumber);

      if (!configTest.numbers.every(phoneNumberTest)) {
        throw new Error("Malformed phone number in config");
      }
    }

    // TODO: replace legalTags with a query call to registration API
    if (configTest.groups.length > 0) {
      const legalTagString = process.env.REGISTRATION_LEGAL_TAGS; // Static method, this can't be a class attr.
      if (!legalTagString) {
        throw new Error("No registration tags provided");
      }
      const legalTags = legalTagString.split(",");
      if (
        !configTest.groups.every(
          (tag: any) => typeof tag === "string" && legalTags.includes(tag.toLowerCase())
        )
      ) {
        throw new Error("Invalid group tag"); // TODO provide info about which tag is invalid
      }
    }

    return true;
  }

  // Naive cleanup - trim all non digit numbers, add a plus 1 if it doesn't exist
  private static cleanNumber(numRaw: string) {
    if (numRaw.length < 10) {
      return null;
    }

    const hasCountryCode = numRaw.charAt(0) === "+";
    if (hasCountryCode) {
      const num = numRaw.substring(1).replace(/\D/g, "");
      return `+${num}`;
    }

    const num = numRaw.replace(/\D/g, "");
    return `+1${num}`; // Assume US number
  }
}

export const TwilioSetup: PluginSetup<Config> = {
  schema: () => `{
		numbers: [String!]!
    groups: [String!]!
	}`,
  init: () => new TwilioPlugin(),
};
