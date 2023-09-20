# Pagerduty Slack Sync
Syncs one or more PagerDuty on-call schedules to a Slack channel topic using a Convex backend.

## Initial Setup

Run `npx convex init` to initialize a Convex project for this code. 

Open the dashboard with `npx convex init` to access your dev deployment.

Under "Settings" -> "Environment Variables", set `PAGERDUTY_API_KEY` with an [API v2 Key](https://support.pagerduty.com/docs/using-the-api#section-generating-an-api-key) and `SLACK_API_KEY` with an [Integrated Bot](https://github.com/PagerDuty/pd-oncall-chat-topic#:~:text=https%3A//my.slack.com/services/new/bot) key. 
Ensure the bot has been invited to the channel(s) whose topic you'd like to update.

Optionally, set the `DRY_RUN` variable to a non-empty value to prevent an actual update of the topic; the proposed update will be logged instead. Note that you will need to repeat this process for your production deployment with the appropriate values.

Run `npx convex dev` or `npx convex deploy` as appropriate to push your code to development or production respectively.

## Adding schedules and channels

The sync function should be running once per minute now, but without any channels or schedules configured, it will have no work to do.

To add a new configuration entry, go to the data tab on your deployment's dashboard and add a new document to the `configs` table. See [convex/schema.ts](convex/schema.ts) for the document schema.

For example, one could add the following document:
```
{
  channel: "<slack channel ID>",
  schedules: [
    { name: "Primary", schedule: "<PagerDuty Schedule ID>" },
    { name: "Secondary", schedule: "<PagerDuty Schedule ID>" },
  ],
}
```
The channel topic will be updated to match the format `Primary: <Primary Oncall>, Secondary: <Secondary Oncall> | <Previous topic content>`. 

----
### Getting Slack and PagerDuty IDs
To get a Slack channel ID, right click on the channel name and copy a link to the channel. It will be of the format `https://<workspace>.slack.com/archives/<Channel ID>`.

To get a PagerDuty Schedule ID, go to the on-call schedule and look for the URL to be in the format `https://<organization>.pagerduty.com/schedules/<Schedule ID>`
