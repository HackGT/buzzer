import { WebClient } from "@slack/web-api";

import { PluginSetup, Plugin, Status } from "./types";

interface SlackConfig {
  channels: string[];
  atChannel: boolean;
  atHere: boolean;
  userToken: string;
}

export class SlackPlugin implements Plugin<SlackConfig> {
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
    channel: string,
    userToken?: string
  ): Promise<Status> {
    try {
      const response = await this.getWeb(userToken).chat.postMessage({
        text: message,
        channel: `#${channel}`,
      });

      return {
        error: !response.ok,
        key: channel,
        message: "Slack message sent successfully",
      };
    } catch (error) {
      return {
        error: true,
        key: channel,
        message: error,
      };
    }
  }

  public async sendMessage(message: string, config: SlackConfig): Promise<Status[]> {
    let processedMessage = message;

    if (config.atHere) {
      processedMessage = `<!here> ${message}`;
    } else if (config.atChannel) {
      processedMessage = `<!channel> ${message}`;
    }

    return await Promise.all(
      config.channels.map(channel =>
        this.sendOneMessage(processedMessage, channel, config.userToken)
      )
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public async check(configTest: any): Promise<boolean> {
    if (configTest.channels.length === 0) {
      throw new Error("You must include at least one channel");
    }

    let response;
    try {
      response = await this.getWeb(configTest.userToken).conversations.list({
        exclude_archived: true,
        types: "public_channel,private_channel",
        limit: 300,
      });
    } catch (error) {
      throw new Error(`Could not make slack api call. ${JSON.stringify(error)}`);
    }

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

    return true;
  }
}

export const SlackSetup: PluginSetup<SlackConfig> = {
  schema: () => `{
		channels: [String!]!
		atChannel: Boolean!
		atHere: Boolean!
		userToken: String
	}`,
  init: () => new SlackPlugin(),
};
