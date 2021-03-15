import * as schedule from "node-schedule";
import moment from "moment-timezone";
import fetch from "node-fetch";

import { resolvers } from "./graphql";

const eventQuery = `{
	allEvents(where: {
		hackathon: {
			name: "HealthTech 2021"
		}
	}) {
		id
		name
		startDate
		type {
			name
		}
		tags {
			name
		}
		url
	}
}`;

const events: any = {};

function scheduleCMS() {
  const cmsUrl = process.env.CMS_URL || "https://keystone.dev.hack.gt/admin/api";
  const slackAnnouncementsChannel = process.env.SLACK_ANNOUNCEMENTS_CHANNEL || "bot-spam";

  fetch(cmsUrl, {
    method: "POST",
    headers: {
      "Content-Type": `application/json`,
      "Accept": `application/json`,
    },
    body: JSON.stringify({
      query: eventQuery,
    }),
  })
    .then(async (r: any) => {
      const resp = await r.json();
      return resp;
    })
    .then((result: any) => {
      const info = result.data.allEvents;
      info.forEach((e: any) => {
        const startTime = moment(e.startDate).tz("America/New_York");
        const startTimeFormatted = startTime.local().format("hh:mm A");
        const { url, id, notification, name: title } = e;
        const type = e.type ? e.type.name : "";

        const now = moment.utc().tz("America/New_York");
        const difference = startTime.diff(now, "minutes");
        // Check if event is 15min. away
        if (difference < 0 || difference >= 16) return;
        // Ensure notifications dont get sent out multiple times
        if (id in events) return;
        events[id] = true;

        const msg = url
          ? `${title} starts at ${startTimeFormatted} EDT. Click here to join: https://calls.healthtech.hack.gt/${id}!`
          : `${title} starts at ${startTimeFormatted}!`;
        const topic = type === "important" ? "all" : id;

        const pluginJson: any = {
          live_site: {
            title,
          },
          f_c_m: {
            header: title,
            id: topic,
          },
          slack: {
            channels: [slackAnnouncementsChannel],
            at_channel: false,
            at_here: false,
          },
        };

        resolvers.Query.send_message(null, {
          plugins: pluginJson,
          message: notification || msg,
        })
          .then((msgOut: any) => msgOut)
          .catch((err: any) => {
            console.log(err);
          });
      });
    })
    .then((output: any) => output)
    .catch((err: any) => {
      console.log(err);
    });
}

export async function scheduleAll() {
  scheduleCMS();
  schedule.scheduleJob("*/1 * * * *", () => {
    scheduleCMS();
  });
}
