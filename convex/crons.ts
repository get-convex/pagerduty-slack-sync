import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();
crons.interval("Update Slack topic", {minutes: 1}, api.sync.default);

export default crons;