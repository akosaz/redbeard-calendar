import express from "express";
import dotenv from "dotenv";
import { z } from "zod";
import { query } from "./db";

dotenv.config();

type DayStatus = "available" | "limited" | "finished";

const app = express();
app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoYMD(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

// GET month
app.get("/api/availability", async (req, res) => {
  console.log(`GET from ${req.hostname}`);

  const y = Number(req.query.year);
  const m = Number(req.query.month);
  if (!y || !m)
    return res.status(400).json({ error: "year and month required" });

  try {
    // compute [start, nextMonthStart)
    const start = new Date(Date.UTC(y, m - 1, 1));
    const next = new Date(Date.UTC(y, m, 1));

    const r = await query<{ date: string; status: DayStatus }>(
      `select to_char(date, 'YYYY-MM-DD') as date, status
         from day_status
        where date >= $1::date and date < $2::date
        order by date`,
      [iso(start), iso(next)]
    );

    // build full month map with default 'available'
    const days: Record<string, DayStatus> = {};
    const daysInMonth = new Date(y, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      days[isoYMD(y, m, d)] = 'available';
    }

    for (const row of r.rows as { date: string; status: DayStatus }[]) {
      days[row.date] = row.status;
    }

    res.json({ days });
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' });
  }
});

// PUT day
app.put("/api/availability", async (req, res) => {
  console.log(`PUT from ${req.hostname} ${req.body.date} ${req.body.status}`);

  const schema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(["available", "limited", "finished"]),
    password: z.string()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "invalid body" });

  if (parsed.data.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    await query(
      `insert into day_status(date, status)
       values ($1::date, $2)
       on conflict (date) do update
         set status = excluded.status,
             updated_at = now()`,
      [parsed.data.date, parsed.data.status]
    );
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db error' });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
