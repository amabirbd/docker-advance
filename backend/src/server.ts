import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { pool, initializeDatabase } from "./db";
import { redis, TASKS_CACHE_KEY, TASKS_CACHE_TTL_SECONDS } from "./redis";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    const redisReady = redis.isReady;
    res.json({
      status: "ok",
      postgres: "connected",
      redis: redisReady ? "connected" : "not-ready",
    });
  } catch {
    res.status(503).json({
      status: "error",
      postgres: "unavailable",
      redis: redis.isReady ? "connected" : "not-ready",
    });
  }
});

app.get("/api/title", (_req, res) => {
  res.json({ title: "TASK APP(1)" });
});

app.get("/api/tasks", async (_req, res, next) => {
  try {
    const cached = await redis.get(TASKS_CACHE_KEY);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cached));
    }
    const result = await pool.query(
      "SELECT id, title, completed, created_at FROM tasks ORDER BY id DESC",
    );
    await redis.set(TASKS_CACHE_KEY, JSON.stringify(result.rows), {
      EX: TASKS_CACHE_TTL_SECONDS,
    });
    res.setHeader("X-Cache", "MISS");
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title || title.length > 200) {
      return res
        .status(400)
        .json({ error: "Title must contain 1–200 characters." });
    }
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed, created_at",
      [title],
    );
    await redis.del(TASKS_CACHE_KEY);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/tasks/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ error: "Invalid task id." });
    const result = await pool.query(
      "UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING id, title, completed, created_at",
      [id],
    );
    if (!result.rowCount)
      return res.status(404).json({ error: "Task not found." });
    await redis.del(TASKS_CACHE_KEY);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return res.status(400).json({ error: "Invalid task id." });
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING id",
      [id],
    );
    if (!result.rowCount)
      return res.status(404).json({ error: "Task not found." });
    await redis.del(TASKS_CACHE_KEY);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

async function start(): Promise<void> {
  await initializeDatabase();
  await redis.connect();
  app.listen(port, () =>
    console.log(`API listening on http://localhost:${port}`),
  );
}

start().catch((error) => {
  console.error("Could not start API:", error);
  process.exit(1);
});
