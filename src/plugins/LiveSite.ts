import fetch from "node-fetch";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
  title?: string;
  icon?: string;
}

class LiveSite implements Notifier<Config> {
  private appId: string;
  private apiKey: string;
  private title: string | undefined;

  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID || "";
    this.apiKey = process.env.ONESIGNAL_API_KEY || "";
    this.title = process.env.ONESIGNAL_DEFAULT_TITLE;

    if (process.env.DEV_MODE !== "True") {
      if (!this.appId || !this.apiKey) {
        throw new Error("Some live site env vars not specified");
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async check(config: any): Promise<Config> {
    return {
      title: config.title,
      icon: config.icon,
    };
  }

  public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      body: JSON.stringify({
        app_id: this.appId,
        contents: {
          en: message,
        },
        headings: {
          en: config.title || this.title,
        },
        chrom_web_icon: config.icon,
        included_segments: ["All"],
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${this.apiKey}`,
      },
    });

    const json = await response.json();
    const error = response.status !== 200;

    return [
      {
        error,
        key: "live_site",
        message: error ? json.errors.toString() : null,
      },
    ];
  }
}

const LiveSitePlugin: Plugin<Config> = {
  schema: () => `{
		title: String
		icon: String
	}`,
  init: () => new LiveSite(),
};

export default LiveSitePlugin;
