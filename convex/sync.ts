import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

const getOncallUser = async function (schedule: string): Promise<string> {
  const token = process.env.PAGERDUTY_API_KEY;
  if (token === undefined || token == "") {
    throw "PagerDuty API Key not set";
  }
  const headers = {
    Accept: "application/vnd.pagerduty+json;version=2",
    Authorization: `Token token=${token}`,
  };

  const normal_url = `https://api.pagerduty.com/schedules/${schedule}/users`;
  const override_url = `https://api.pagerduty.com/schedules/${schedule}/overrides`;
  const now = new Date();
  let since = new Date(now);
  // The PagerDuty API gets all users on-call for a schedule within a time bound. The easiest way to get the current on-call is to set a tight 5 second time bound.
  since.setSeconds(since.getSeconds() - 5);
  let payload: Record<string, string> = {};
  payload["since"] = since.toISOString();
  payload["until"] = now.toISOString();
  let parameters = new URLSearchParams(payload);
  let query_string = `?${parameters.toString()}`;

  let normal_schedule = await fetch(normal_url + query_string, {
    headers: headers,
  });
  if (normal_schedule.status == 404) {
    throw `Invalid schedule ${schedule}`;
  }
  const response = await normal_schedule.json();
  const users = response["users"];
  const user = users[0];
  if (!user) {
    return "No one :panic:";
  }
  let username = user["name"];
  if (!username) {
    return "Deactivated user :panic:";
  }
  let override_schedule = await fetch(override_url + query_string, {
    headers: headers,
  });
  if ((await override_schedule.json())["overrides"].length > 0) {
    username += " (Override)";
  }
  return username;
};

const getSlackTopic = async function (channel: string): Promise<string> {
  const token = process.env.SLACK_API_KEY;
  if (token === undefined || token == "") {
    throw "Slack API Key not set";
  }
  const payload = {
    token: token,
    channel: channel,
  };
  let response = await fetch("https://slack.com/api/conversations.info", {
    method: "POST",
    body: new URLSearchParams(payload).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
  }).then((r) => r.json());
  try {
    const topic = response["channel"]["topic"]["value"];
    return topic;
  } catch (e) {
    console.error(e);
    console.info(response);
    throw `Could not find channel ${channel} on Slack; ensure the bot is in this channel`;
  }
};

const updateSlackTopic = async function (
  channel: string,
  proposed_update: string
): Promise<void> {
  const token = process.env.SLACK_API_KEY;
  if (token === undefined || token == "") {
    throw "Slack API Key not set";
  }
  let payload: Record<string, string> = {
    token: token,
    channel: channel,
  };

  let current_topic = await getSlackTopic(channel);
  if (current_topic == "") {
    current_topic = ".";
  }
  const pipe = current_topic.indexOf("|");
  if (pipe !== undefined) {
    let oncall_message = current_topic.substring(0, pipe).trimEnd();
    current_topic = current_topic.substring(pipe + 1).trimStart();
    if (oncall_message == proposed_update) {
      console.log("No topic update required");
      return;
    }
  }
  proposed_update = proposed_update + " | " + current_topic;
  payload["topic"] = proposed_update;
  if (process.env.DRY_RUN !== undefined) {
    console.log("Would update topic with request", payload);
    console.log("Exiting without sending request");
    return;
  }
  const response = await fetch("https://slack.com/api/conversations.setTopic", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    body: new URLSearchParams(payload).toString(),
  });
  if (response.status > 299) {
    const error = await response.text();
    throw `Failed to update topic: ${error}`;
  }
};

export const getConfig = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("configs").fullTableScan().collect();
  },
});

const performUpdate = async function (config: Doc<"configs">) {
  console.log("Updating for config:", config);
  let topic = "";
  for (const schedule of config.schedules) {
    const oncall = await getOncallUser(schedule.schedule);
    if (topic != "") {
      topic += ", ";
    }
    topic += `${schedule.name}: ${oncall}`;
  }
  return updateSlackTopic(config.channel, topic);
};

export default action({
  handler: async (ctx) => {
    const configs = await ctx.runQuery(internal.sync.getConfig);
    await Promise.all(configs.map(performUpdate));
  },
});
