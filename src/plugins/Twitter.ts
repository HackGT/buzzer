/* eslint-disable camelcase, @typescript-eslint/ban-types */
import TwitterAPI from "twit";

import { PluginSetup, Plugin, Status } from "./types";

type TwitterResponse = {
  data: {
    user?: {
      screen_name?: string;
    };
    id_str?: string;
  };
};

class TwitterPlugin implements Plugin<{}> {
  private client: TwitterAPI;

  constructor() {
    const consumerKey = process.env.TWITTER_CONSUMER_KEY || " ";
    const consumerSecret = process.env.TWITTER_CONSUMER_SECRET || " ";
    const accessToken = process.env.TWITTER_HACKGT_ACCESS_TOKEN || " ";
    const accessTokenSecret = process.env.TWITTER_HACKGT_ACCESS_TOKEN_SECRET || " ";
    if (process.env.DEV_MODE !== "true") {
      if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
        throw new Error("Twitter env vars missing, aborting...");
      }
    }

    this.client = new TwitterAPI({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token: accessToken,
      access_token_secret: accessTokenSecret,
    });
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public async check(configTest: any): Promise<boolean> {
    return true;
  }

  public async sendMessage(message: string): Promise<Status[]> {
    const params = { status: message };
    try {
      const { data }: TwitterResponse = await this.client.post("statuses/update", params);

      let url;
      if (data.user && data.user.screen_name && data.id_str) {
        url = `https://twitter.com/${data.user.screen_name}/status/${data.id_str}`;
      }

      return [
        {
          error: false,
          key: "twitter",
          message: url
            ? `Successful tweet, view at ${url}`
            : "Successful tweet, but error loading url",
        },
      ];
    } catch (error) {
      return [
        {
          error: true,
          key: "twitter",
          message: `${error.message}`,
        },
      ];
    }
  }
}

export const TwitterSetup: PluginSetup<{}> = {
  schema: () => `{
		_: Boolean
	}`,
  init: () => new TwitterPlugin(),
};
