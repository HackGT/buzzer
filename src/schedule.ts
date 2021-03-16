/* eslint-disable camelcase */
import * as schedule from "node-schedule";
import fetch from "node-fetch";
import { DateTime } from "luxon";

import { resolvers } from "./graphql";
import { flatten } from "./util";
import { Status } from "./plugins/types";

const CMS_EVENTS_QUERY = (startDate_gte: string, startDate_lte: string) => `{
	allEvents(where: {
		hackathon: {
			name: "${process.env.SCHEDULE_CMS_CURRENT_HACKATHON}"
		},
    startDate_gte: "${startDate_gte}",
    startDate_lte: "${startDate_lte}"
	}) {
		id
		name
		startDate
		type {
      id
			name
		}
		tags {
      id
			name
		}
		url
	}
}`;

type CMSEvent = {
  id: string;
  name: string;
  startDate: string;
  type?: {
    id?: string;
    name?: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
  url?: string;
};

// Keep track of already sent notifications
const sentNotifications: any = {};

async function scheduleCMS() {
  const CMS_URL = process.env.SCHEDULE_CMS_URL || "https://keystone.dev.hack.gt/admin/api";

  const currentTime = DateTime.now();
  const currentTimeAhead = currentTime.plus({ minutes: 15 });

  const response = await fetch(CMS_URL, {
    method: "POST",
    headers: {
      "Content-Type": `application/json`,
      "Accept": `application/json`,
    },
    body: JSON.stringify({
      query: CMS_EVENTS_QUERY(currentTime.toISO(), currentTimeAhead.toISO()),
    }),
  });

  const json = await response.json();
  const { allEvents } = json.data;

  allEvents.forEach(async (event: CMSEvent) => {
    // Ensure notifications dont get sent out multiple times
    if (event.id in sentNotifications) return;
    sentNotifications[event.id] = true;

    const startTime = DateTime.fromISO(event.startDate, {
      zone: "America/New_York",
    }).toLocaleString(DateTime.TIME_SIMPLE);

    // TODO: Allow events to have custom notifications through CMS
    const message = event.url
      ? `${event.name} starts at ${startTime} ET. Click here to join: https://calls.healthtech.hack.gt/${event.id}!`
      : `${event.name} starts at ${startTime}!`;

    const pluginJson: any = {
      live_site: {
        title: event.name,
      },
      f_c_m: {
        header: event.name,
        id: event.type?.name === "important" ? "all" : event.id,
      },
      slack: {
        channels: [process.env.SCHEDULE_SLACK_ANNOUNCEMENTS_CHANNEL || "bot-spam"],
        at_channel: false,
        at_here: false,
      },
    };

    const pluginReturn = await resolvers.Query.sendMessage(null, {
      plugins: pluginJson,
      message,
    });

    const results = flatten(pluginReturn.map(plugin => plugin.results)) as Status[];
    console.error(results.filter(result => result.error)); // Log messages to console when error is true
  });
}

export async function scheduleAll() {
  await scheduleCMS();

  // Execute this job every minute
  schedule.scheduleJob("*/1 * * * *", async () => {
    await scheduleCMS();
  });
}
