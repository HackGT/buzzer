"use strict";
/** Erors:
    - lines 5+6: says cannot find modules for http and querystring
    - line 9: says cannot find name process
    - line 29: don't know type of request
    - line 37: says can't find Buffer*/
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const querystring = require("querystring");
const tkn = process.env.SLACK_TOKEN;
function slackChat(slackDomain, slackChannel, slackMessage) {
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
    var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });
    });
}
//# sourceMappingURL=slack.js.map