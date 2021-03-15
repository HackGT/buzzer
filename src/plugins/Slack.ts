/* eslint-disable camelcase */
import { WebClient } from "@slack/web-api";

import { PluginReturn, Plugin, Notifier } from "./Plugin";

interface Config {
  channels: string[];
  at_channel: boolean;
  at_here: boolean;
  user_token: string;
}

class Slack implements Notifier<Config> {
  private web: WebClient;

  constructor() {
    const slackToken = process.env.SLACK_TOKEN || "";

    if (process.env.DEV_MODE !== "True") {
      if (!slackToken) {
        throw new Error("Missing slack env vars. exiting.");
      }
    }

    this.web = new WebClient(slackToken);
  }

  private getWeb(userToken?: string): WebClient {
    // If a user token is provided, use that to send the message, otherwise use the default slack token
    if (userToken) {
      return new WebClient(userToken);
    }
    return this.web;
  }

  private async sendOneMessage(
    message: string,
    channel?: string,
    userToken?: string
  ): Promise<PluginReturn> {
    try {
      const response = await this.getWeb(userToken).chat.postMessage({
        text: message,
        channel: channel ? `#${channel}` : "#announcements",
      });

      return {
        error: response.ok,
        key: channel || "default",
        message: "",
      };
    } catch (error) {
      return {
        error: false,
        key: channel || "default",
        message: error,
      };
    }
  }

  public async sendMessage(message: string, config: Config): Promise<PluginReturn[]> {
    let processedMessage = message;

    if (config.at_here) {
      processedMessage = `<!here> ${message}`;
    } else if (config.at_channel) {
      processedMessage = `<!channel> ${message}`;
    }

    // Slack webhooks have a default channel, add a sentinel
    if (config.channels.length === 0) {
      return [await this.sendOneMessage(processedMessage, undefined, config.user_token)];
    }

    return await Promise.all(
      config.channels.map(channel =>
        this.sendOneMessage(processedMessage, channel, config.user_token)
      )
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public async check(configTest: any): Promise<Config> {
    try {
      const response = await this.getWeb(configTest.user_token).conversations.list({
        exclude_archived: true,
        types: "public_channel,private_channel",
      });

      if (!response.ok) {
        throw new Error(`Error while making slack api call. ${JSON.stringify(response)}`);
      }

      // @ts-ignore
      const allChannels: string[] = response.channels.map(channel => channel.name);
      const invalidChannels = configTest.channels.filter(
        (channel: string) => !allChannels.includes(channel)
      );

      if (invalidChannels.length !== 0) {
        throw new Error(`Invalid slack channels / groups: ${invalidChannels}`);
      }

      return {
        channels: configTest.channels,
        at_channel: !!configTest.at_channel,
        at_here: !!configTest.at_here,
        user_token: configTest.user_token,
      };
    } catch (error) {
      throw new Error(`Could not make slack api call. ${JSON.stringify(error)}`);
    }
  }
}

const SlackPlugin: Plugin<Config> = {
  schema: () => `{
		channels: [String!]!
		at_channel: Boolean!
		at_here: Boolean!
		user_token: String
	}`,
  init: () => new Slack(),
};

export default SlackPlugin;
