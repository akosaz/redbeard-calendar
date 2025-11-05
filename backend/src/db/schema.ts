import { date, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { DayStatus } from "../../../shared/types";

export const dayStatus = pgTable("day_status", {
  date: date("date").primaryKey(),
  status: text("status", {
    enum: ["available", "limited", "finished"]
  }).notNull().$type<DayStatus>(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DayStatusRow = typeof dayStatus.$inferSelect;
export type DayStatusInsert = typeof dayStatus.$inferInsert;
