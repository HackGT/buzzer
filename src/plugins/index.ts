import Datastore from "nedb";
import dotenv from "dotenv";

import { Notifier, Plugin } from "./Plugin";
import LiveSite from "./LiveSite";
import Slack from "./Slack";
import Twilio from "./Twilio";
import Twitter from "./Twitter";
import FCM from "./FCM";
import MapGTPlugin from "./MapGT";

dotenv.config();

export const mediaAPI: {
  [key: string]: Plugin<any>;
} = {
  LiveSite,
  Slack,
  Twilio,
  Twitter,
  FCM,
};

// Setup plugins
export const plugins: {
  [name: string]: Notifier<any>;
} = {};

export function setupPlugins(socket: any) {
  Object.keys(mediaAPI).forEach(pluginKey => {
    plugins[pluginKey] = mediaAPI[pluginKey].init();
  });

  plugins.mapgt = MapGTPlugin.init(socket);
}

// Setup database logs
export const logs: any = {};

Object.keys(mediaAPI).forEach(key => {
  const file = `./logs/${key.toLowerCase()}_log.db`;
  logs[key] = new Datastore({
    filename: file,
    autoload: true,
    timestampData: true,
  });
});

// Hack for mapgt
const fileMapgt = `./logs/mapgt_log.db`;
logs.mapgt = new Datastore({
  filename: fileMapgt,
  autoload: true,
  timestampData: true,
});
