import { GenericNotifier } from "./GenericNotifier";
import Facebook from "./Facebook";
import LiveSite from "./LiveSite";
import Slack from "./Slack";
import Twitter from "./Twitter";

export const mediaAPI: {
	[key: string]: GenericNotifier<any>;
} = {
	"Facebook": new Facebook(),
	"LiveSite": new LiveSite(),
	"Slack": new Slack(),
	"Twitter": new Twitter()
};
