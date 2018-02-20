/** Erors:
    - lines 5+6: says cannot find modules for http and querystring
    - line 9: says cannot find name process
    - line 29: don't know type of request
    - line 37: says can't find Buffer*/

import * as Slack from "slack";
import * as http from "http";
import * as querystring from "querystring";

const tkn = process.env.SLACK_TOKEN;

function slackChat(slackDomain : string, slackChannel : string, slackMessage : string) {
    var message = {
        token: tkn,
        channel: slackChannel,
        as_user: false,
        username: "HackGT",
        text: slackMessage
    };

    var qs = querystring.stringify(message);

    var options = {
        "method": "GET",
        "hostname": slackDomain + "slack.com",
        "path": "api/chat.postMessage?" + qs
    };

    var req = http.request(options, function(res) {
        var chunks : String[] = [];

        res.on("data", function(chunk : String) {
            chunks.push(chunk);
        });

        res.on("end", function() {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });
    });
}
