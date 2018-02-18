import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";
import { GenericConfig } from "./GenericConfig";

interface Config extends GenericConfig {
  groups?: string[];
  message: string;
}

export default class LiveSite implements GenericNotifier {
  public sendMessage = (config: Config): APIReturn => {
        console.log(config.message);
        if (config.groups !== undefined) {
            console.log(config.groups);
        }
        return {
            error: 0,
            debugInfo: "ye"
        };
    }

  public TAG = "LIVESITE";
}
