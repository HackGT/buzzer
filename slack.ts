/** Error20:
    - line 21: don't know how to declare call signature in tsc*/

import * as querystring from "querystring";
import * as fetch from "node-fetch";

const tkn = process.env.SLACK_TOKEN;

export async function slackChat(slackDomain : string, slackChannel : string, slackMessage : string) {
    const message = {
        token: tkn,
        channel: slackChannel,
        as_user: false,
        username: "HackGT",
        text: slackMessage
    };

    const qs = querystring.stringify(message);

    const res = await
        fetch(`https://${slackDomain}.slack.com/api/chat.postMessage?${qs}`);
    const json = await res.json();
    console.log(json);
}
