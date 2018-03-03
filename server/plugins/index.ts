import { Plugin } from "./GenericNotifier";
import Facebook from "./Facebook"; // Note that this is plugin, not notifier
import LiveSite from "./LiveSite";
import Slack from "./Slack";
import Twitter from "./Twitter";

export const mediaAPI: {
	[key: string]: Plugin<any>;
} = {
	"Facebook": Facebook,
	"LiveSite": LiveSite,
	"Slack": Slack,
	"Twitter": Twitter
};
