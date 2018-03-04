import * as querystring from "querystring";
import fetch from "node-fetch";
import {Plugin, GenericNotifier} from "./GenericNotifer";
import APIReturn from "./APIReturn";

interface Config {
	channels: string[];
}

class Slack implements GenericNotifier<Config> {
    private token: string;
    private domain: string;

    constructor() {
        const token = process.env.SLACK_TOKEN;
        const domain = process.env.SLACK_DOMAIN;

        if (!token) {
            console.error("Missing Slack token env var");
        }
        if (!domain) {
            console.error("Missing Slack domain env var");
        }

        if (!token || !domain) {
			throw new Error("Slack env vars missing, aborting...");
		}

        this.token = token;
        this.domain = domain;
    }

    public async sendMessage(message : string, config : any) : Promise<APIReturn> {
        await Promise.all(config.channels.map(chan => (async () => {
            const msg = {
                token: this.token,
                channel: chan,
                as_user: false,
                username: "HackGT",
                text: message
            };

            const qs = querystring.stringify(msg);

            const res = await fetch(`https://${this.domain}.slack.com/api/chat.postMessage?${qs}`);
            const json = await res.json();
            let js = JSON.parse(json);
            for (var a in js) {
                if (!js.hasOwnProperty(a)) continue;
                if (a == 'ok') {
                    if (js[a] == false) {
                        return [{
                            error: true,
                            key: "Slack Master",
                            message: js[a + 1]
                        }];
                    }
                }
            }
            return [{
                error: false,
                key: "Slack Master",
                message: "Message posted at channel: " + chan
            }];
        })));
    }

    public async setup(): Promise<void> {
        return;
    }

    public async check(config : any): Promise<Config> {
        var params = {
            token: this.token,
            exclude_archived: true,
            exclude_members: true
        };

        const qs = querystring.stringify(params);

        this.instanceOfConfig(config);
            const res = await fetch(`https://${this.domain}.slack.com/api/channels.list?${qs}`);
            const channels = await res.json();

            const res2 = await fetch(`https://${this.domain}.slack.com/api/groups.list?${qs}`);
            const groups = await res2.json();

            var isFound = false;
            for (var i = 0; i < config.channels.length; i++) {
                var searchValue = config.channels[i];
                if (!(channels.map(c => c.name).includes(searchValue)) && !(groups.map(c => c.name).includes(searchValue))) {
                    isFound = false;
                    throw new Error("One of the channels' names is invalid");
                } else {
                    isFound = true;
                }
            }

            if (isFound) {
                return (config as Config);
            } else {
                throw new Error("One of the channels' names is invalid");
            }
    }

    instanceOfConfig(object : any) {
        const channelsCheck: boolean =
			Array.isArray(object.channels) &&
			(object.channels as any[]).every(channel =>
				typeof channel === "string"
			);
		if (channelsCheck) {
			return (true);
		} else {
			throw new Error("Slack config incorrect.");
        }
    }

}

function instanceOfConfig(object : any) {
    return 'channels' in object;
}

const SlackPlugin: Plugin<{}> = {
	schema: () => `{
		channels: [String!]
	}`,
	init: async () => new Slack()
};

export default SlackPlugin
