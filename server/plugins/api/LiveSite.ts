import { APIReturn } from "./APIReturn"
import { GenericNotifier } from "./GenericNotifier"
import { GenericConfig } from "./GenericConfig"

interface Config extends GenericConfig {
    groups?: string[],
    message: string
}

export class LiveSite implements GenericNotifier {
    sendMessage = (config : Config) : APIReturn => {
        // plugin code here
        console.log(config.message);
        if (config.groups !== undefined) {
            console.log(config.groups);
        }
        return {
            error: 0,
            debugInfo: "ye"
        }
    }

    TAG = "LIVESITE"
}