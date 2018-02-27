/** Error20:
    - line 21: don't know how to declare call signature in tsc*/

import * as querystring from "querystring";
import fetch from "node-fetch";

const tkn = process.env.SLACK_TOKEN;
const domain = process.env.DOMAIN;

async function sendMessage(message : string, config : string) : Promise<void> {
    const msg = {
        token: tkn,
        channel: config,
        as_user: false,
        username: "HackGT",
        text: message
    };

    const qs = querystring.stringify(msg);

    const res = await
        fetch(`https://${domain}.slack.com/api/chat.postMessage?${qs}`);
    const json = await res.json();
    console.log(json);
}

async function check(config : any): Promise<string> {
    const res = await
        fetch(`https://${domain}.slack.com/api/channels.list`);
    const channels = await res.json();

    const res2 = await
        fetch(`https://${domain}.slack.com/api/groups.list`);
    const groups = await res2.json();

    var resultsChannels : string[] = [];
    var resultsGroups : string[] = [];
    var searchField = 'name';
    var searchValue = config;

    for (var i = 0; i < channels.length; i++) {
        if (channels[i][searchField] == searchValue) {
            resultsChannels.push(channels[i]);
            return config;
        }
    }
    for (var i = 0; i < groups.length; i++) {
        if (channels[i][searchField] == searchValue) {
            resultsGroups.push(groups[i]);
            return config;
        }
    }
    return "Channel does not exist!";
}
