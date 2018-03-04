import * as querystring from "querystring";
import fetch from "node-fetch";

const tkn = process.env.SLACK_TOKEN;
const domain = process.env.SLACK_DOMAIN;

interface Config {
    channels: string[];
}

async function sendMessage(message : string, config : any) : Promise<void> {
    for (var i = 0; i < config.channels.length; i++) {
        const msg = {
            token: tkn,
            channel: config.channels[i],
            as_user: false,
            username: "HackGT",
            text: message
        };

        const qs = querystring.stringify(msg);

        const res = await fetch(`https://${domain}.slack.com/api/chat.postMessage?${qs}`);
        const json = await res.json();
        console.log(json);
    }

}

async function setup(): Promise<void> {
    return;
}

async function check(config : any): Promise<string> {
    var params = {
        token: tkn,
        exclude_archived: true,
        exclude_members: true
    };

    const qs = querystring.stringify(params);

    if (instanceOfConfig(config)) {
        const res = await fetch(`https://${domain}.slack.com/api/channels.list?${qs}`);
        const channels = await res.json();

        const res2 = await fetch(`https://${domain}.slack.com/api/groups.list?${qs}`);
        const groups = await res2.json();

        for (var i = 0; i < config.channels.length; i++) {
            var searchValue = config.channels[i];
            if (channels.map(c => c.name).includes(searchValue)) {
                return searchValue;
            }
            else if (groups.map(c => c.name).includes(searchValue)) {
                return searchValue;
            }

        }
        return "Channel does not exist!";
    } else {
        return "Error with configuration"
    }

}

function instanceOfConfig(object : any) {
    return 'channels' in object;
}
