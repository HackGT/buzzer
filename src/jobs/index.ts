import * as schedule from "node-schedule";

import { scheduleCMS } from "./schedule";

export async function scheduleJobs() {
  await scheduleCMS();

  // Execute jobs every minute
  schedule.scheduleJob("*/1 * * * *", async () => {
    await scheduleCMS();
  });
}
