import { Plugin } from "./Plugin";
import LiveSite from "./LiveSite";
import Slack from "./Slack";
import Twilio from "./Twilio";
import Twitter from "./Twitter";
import FCM from "./FCM";

export const mediaAPI: {
	[key: string]: Plugin<any>;
} = {
	"LiveSite": LiveSite,
	"Slack": Slack,
	"Twilio": Twilio,
	"Twitter": Twitter,
	"FCM": FCM
};
