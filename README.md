# Pagerduty Slack Sync
Syncs one or more PagerDuty on-call schedules to a Slack channel topic using a Convex backend.  

<img width="514" alt="image" src="https://github.com/get-convex/pagerduty-slack-sync/assets/3837919/4e66f744-9fd2-405e-8e84-27cdee8c7b37">


## Initial Setup

Run `npx convex dev --once` to initialize a [Convex](https://convex.dev) project for this code.

Open the dashboard with `npx convex dashboard` to access your dev deployment.

Under "Settings" -> "Environment Variables", set `PAGERDUTY_API_KEY` with an [API v2 Key](https://support.pagerduty.com/docs/using-the-api#section-generating-an-api-key) and `SLACK_API_KEY` with an [Integrated Bot](https://github.com/PagerDuty/pd-oncall-chat-topic#:~:text=https%3A//my.slack.com/services/new/bot) key.
Ensure the bot has been invited to the channel(s) whose topic you'd like to update.

Optionally, set the `DRY_RUN` variable to a non-empty value to prevent an actual update of the topic; the proposed update will be logged instead. Note that you will need to repeat this process for your production deployment with the appropriate values.

Run `npx convex dev` to continuously deploy your code as you change it.

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
The channel topic will be updated to match the following format:
```
Primary: <Primary On-call>, Secondary: <Secondary On-call>, [<Schedule Name>: <Scheduled On-call>, ...] | <Previous topic content>
```

----
### Getting Slack and PagerDuty IDs
To get a Slack channel ID, right click on the channel name and copy a link to the channel. It will be of the format `https://<workspace>.slack.com/archives/<Channel ID>`.

To get a PagerDuty Schedule ID, go to the on-call schedule and look for the URL to be in the format `https://<organization>.pagerduty.com/schedules/<Schedule ID>`

## Prod vs. Dev

In Convex, a project has one Prod backend, and a Dev backend per developer.

If you want multiple teammates to be able to edit the code or environment variables, you can use the Prod instance.

To do this, run `npx convex deploy`, and set the environment variables there as in dev.

**Note:** Your dev instance will continue to sync changes as well, unless you stop it.
You can stop it by:

- Pausing your deployment: https://docs.convex.dev/production/pause-deployment
- Removing the environment variables from Dev.
- Pushing code without the cron.

# What is Convex?

[Convex](https://convex.dev) is a hosted backend platform with a
built-in database that lets you write your
[database schema](https://docs.convex.dev/database/schemas) and
[server functions](https://docs.convex.dev/functions) in
[TypeScript](https://docs.convex.dev/typescript). Server-side database
[queries](https://docs.convex.dev/functions/query-functions) automatically
[cache](https://docs.convex.dev/functions/query-functions#caching--reactivity) and
[subscribe](https://docs.convex.dev/client/react#reactivity) to data, powering a
[realtime `useQuery` hook](https://docs.convex.dev/client/react#fetching-data) in our
[React client](https://docs.convex.dev/client/react). There are also
[Python](https://docs.convex.dev/client/python),
[Rust](https://docs.convex.dev/client/rust),
[ReactNative](https://docs.convex.dev/client/react-native), and
[Node](https://docs.convex.dev/client/javascript) clients, as well as a straightforward
[HTTP API](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L40).

The database supports
[NoSQL-style documents](https://docs.convex.dev/database/document-storage) with
[relationships](https://docs.convex.dev/database/document-ids),
[custom indexes](https://docs.convex.dev/database/indexes/)
(including on fields in nested objects) and
[vector search](https://docs.convex.dev/vector-search).

The
[`query`](https://docs.convex.dev/functions/query-functions) and
[`mutation`](https://docs.convex.dev/functions/mutation-functions) server functions have transactional,
low latency access to the database and leverage our
[`v8` runtime](https://docs.convex.dev/functions/runtimes) with
[determinism guardrails](https://docs.convex.dev/functions/runtimes#using-randomness-and-time-in-queries-and-mutations)
to provide the strongest ACID guarantees on the market:
immediate consistency,
serializable isolation, and
automatic conflict resolution via
[optimistic multi-version concurrency control](https://docs.convex.dev/database/advanced/occ) (OCC / MVCC).

The [`action` server functions](https://docs.convex.dev/functions/actions) have
access to external APIs and enable other side-effects and non-determinism in
either our
[optimized `v8` runtime](https://docs.convex.dev/functions/runtimes) or a more
[flexible `node` runtime](https://docs.convex.dev/functions/runtimes#nodejs-runtime).

Functions can run in the background via
[scheduling](https://docs.convex.dev/scheduling/scheduled-functions) and
[cron jobs](https://docs.convex.dev/scheduling/cron-jobs).

Development is cloud-first, with
[hot reloads for server function](https://docs.convex.dev/cli#run-the-convex-dev-server) editing via the
[CLI](https://docs.convex.dev/cli). There is a
[dashbord UI](https://docs.convex.dev/dashboard) to
[browse and edit data](https://docs.convex.dev/dashboard/deployments/data),
[edit environment variables](https://docs.convex.dev/production/environment-variables),
[view logs](https://docs.convex.dev/dashboard/deployments/logs),
[run server functions](https://docs.convex.dev/dashboard/deployments/functions), and more.

There are built-in features for
[reactive pagination](https://docs.convex.dev/database/pagination),
[file storage](https://docs.convex.dev/file-storage),
[reactive search](https://docs.convex.dev/text-search),
[https endpoints](https://docs.convex.dev/functions/http-actions) (for webhooks),
[streaming import/export](https://docs.convex.dev/database/import-export/), and
[runtime data validation](https://docs.convex.dev/database/schemas#validators) for
[function arguments](https://docs.convex.dev/functions/args-validation) and
[database data](https://docs.convex.dev/database/schemas#schema-validation).

Everything scales automatically, and it’s [free to start](https://www.convex.dev/plans).
