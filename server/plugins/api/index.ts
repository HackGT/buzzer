import { GenericNotifier } from "./GenericNotifier";
import Facebook from "./Facebook";
import LiveSite from "./LiveSite";
import Slack from "./Slack";
import Twitter from "./Twitter";

export const mediaAPI: {
	[key: string]: GenericNotifier<any>;
} = {
	"FACEBOOK": new Facebook(),
	"LIVE_SITE": new LiveSite(),
	"SLACK": new Slack(),
	"TWITTER": new Twitter()
};
