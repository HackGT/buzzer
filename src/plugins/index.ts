import dotenv from "dotenv";
import { Server } from "socket.io";

import { PluginSetup, Plugin } from "./types";
import { LiveSiteSetup } from "./LiveSite";
import { SlackSetup } from "./Slack";
import { TwilioSetup } from "./Twilio";
import { TwitterSetup } from "./Twitter";
import { FCMSetup } from "./FCM";
import { MapGTPlugin, MapGTSetup } from "./MapGT";

dotenv.config();

// Setup plugins
export const pluginSetup: {
  [key: string]: PluginSetup<any>;
} = {
  liveSite: LiveSiteSetup,
  slack: SlackSetup,
  twilio: TwilioSetup,
  twitter: TwitterSetup,
  fcm: FCMSetup,
  mapGT: MapGTSetup,
};

export const plugins: {
  [key: string]: Plugin<any>;
} = {};

export function setupPlugins(socket: Server) {
  for (const [key, value] of Object.entries(pluginSetup)) {
    plugins[key] = value.init();
  }

  if (plugins.mapGT instanceof MapGTPlugin) {
    plugins.mapGT.setSocket(socket);
  }
}
