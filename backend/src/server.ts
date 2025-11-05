import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { validateEnv, getEnv } from "./config/env";
import { getDb } from "./db";
import { dayStatus } from "./db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { z } from "zod";
import type { DayStatus, MonthAvailabilityResponse, UpdateDayRequest } from "../../shared/types";
import { isoYMD, isoDate } from "../../shared/utils";
import { DEFAULT_STATUS } from "../../shared/constants";

// Validate environment variables on startup
validateEnv();
const env = getEnv();

// Initialize Fastify with Pino logger
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport: env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  },
});

// Register CORS
// NOTE: Currently allowing all origins for development
// TODO: In production, restrict to specific frontend domain(s)
fastify.register(cors, {
  origin: true, // Allow all origins - CHANGE THIS IN PRODUCTION
});

// Register rate limiting
fastify.register(rateLimit, {
  max: 100, // 100 requests
  timeWindow: "1 minute", // per minute
  errorResponseBuilder: () => ({
    error: "Too many requests. Please try again later.",
  }),
});

// Request validation schemas
const monthQuerySchema = z.object({
  year: z.string().transform(Number),
  month: z.string().transform(Number),
});

const updateDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["available", "limited", "finished"]),
  password: z.string(),
});

// Health check endpoint (for Docker/monitoring)
fastify.get("/health", async (_request, reply) => {
  try {
    // Check database connection
    const db = getDb();
    await db.execute("SELECT 1" as any);

    return reply.status(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (err) {
    return reply.status(503).send({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// GET /api/availability - Get month availability
fastify.get<{
  Querystring: { year: string; month: string };
}>("/api/availability", async (request, reply) => {
  const parsed = monthQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    return reply.status(400).send({ error: "year and month required" });
  }

  const { year, month } = parsed.data;

  try {
    // Compute date range [start, nextMonthStart)
    const start = new Date(Date.UTC(year, month - 1, 1));
    const next = new Date(Date.UTC(year, month, 1));

    const db = getDb();
    const results = await db
      .select()
      .from(dayStatus)
      .where(
        and(
          gte(dayStatus.date, isoDate(start)),
          lt(dayStatus.date, isoDate(next))
        )
      )
      .execute();

    // Build full month map with default status
    const days: Record<string, DayStatus> = {};
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      days[isoYMD(year, month, d)] = DEFAULT_STATUS;
    }

    // Override with database values
    for (const row of results) {
      days[row.date] = row.status;
    }

    const response: MonthAvailabilityResponse = { days };
    return reply.send(response);
  } catch (err) {
    request.log.error(err, "Database error fetching availability");
    return reply.status(500).send({ error: "Database error" });
  }
});

// PUT /api/availability - Update day status
fastify.put<{
  Body: UpdateDayRequest;
}>("/api/availability", async (request, reply) => {
  const parsed = updateDaySchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request body" });
  }

  const { date, status, password } = parsed.data;

  // Validate admin password
  if (password !== env.ADMIN_PASSWORD) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    const db = getDb();

    // Upsert: insert or update
    await db
      .insert(dayStatus)
      .values({ date, status })
      .onConflictDoUpdate({
        target: dayStatus.date,
        set: { status, updatedAt: new Date() },
      })
      .execute();

    return reply.status(204).send();
  } catch (err) {
    request.log.error(err, "Database error updating availability");
    return reply.status(500).send({ error: "Database error" });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
    fastify.log.info(`Server listening on http://localhost:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  fastify.log.info("Shutting down gracefully...");
  await fastify.close();
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

start();
