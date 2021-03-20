import fetch from "node-fetch";

import { PluginSetup, Plugin, Status } from "./types";

interface LiveSiteConfig {
  title?: string;
  icon?: string;
}

export class LiveSitePlugin implements Plugin<LiveSiteConfig> {
  private appId: string;
  private apiKey: string;
  private title: string | undefined;

  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID || "";
    this.apiKey = process.env.ONESIGNAL_API_KEY || "";
    this.title = process.env.ONESIGNAL_DEFAULT_TITLE;

    if (process.env.DEV_MODE !== "true") {
      if (!this.appId || !this.apiKey) {
        throw new Error("Some live site env vars not specified");
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public async check(configTest: any): Promise<boolean> {
    return true;
  }

  public async sendMessage(message: string, config: LiveSiteConfig): Promise<Status[]> {
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

export const LiveSiteSetup: PluginSetup<LiveSiteConfig> = {
  schema: () => `{
		title: String
		icon: String
	}`,
  init: () => new LiveSitePlugin(),
};
