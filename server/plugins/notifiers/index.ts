import { NotifierPlugin as Plugin } from "./Plugin";
import LiveSite from "./LiveSite";
import Slack from "./Slack";
import Twitter from "./Twitter";

export const mediaAPI: {
	[key: string]: Plugin<any>;
} = {
	"LiveSite": LiveSite,
	"Slack": Slack,
	"Twitter": Twitter
};
