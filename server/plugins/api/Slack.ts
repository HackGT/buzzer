import { APIReturn } from "./APIReturn"
import { GenericNotifier } from "./GenericNotifier"
import { GenericConfig } from "./GenericConfig"

interface Config extends GenericConfig {
    groups?: string[],
    channel?: string,
    message: string
}

export class Slack implements GenericNotifier {
    sendMessage = (config : Config) : APIReturn => {
        // plugin code here
        console.log(config.message);
        if (config.groups !== undefined) {
            console.log(config.groups);
        }
        if (config.channel !== undefined) {
            console.log(config.channel);
        }
        return {
            error: 0,
        }
    }

    TAG = "SLACK"
}