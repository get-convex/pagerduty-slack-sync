import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  configs: defineTable({
    channel: v.string(),
    schedules: v.array(v.object({ schedule: v.string(), name: v.string() })),
  }),
});
