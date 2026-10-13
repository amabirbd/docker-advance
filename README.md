# Learn Fullstack: Next.js + Express + TypeScript + PostgreSQL + Redis

A small task-list app intended for learning. The Next.js frontend calls an Express REST API. Express stores tasks in PostgreSQL and caches the task list in Redis.

## Requirements
- Node.js 20+
- Docker Desktop (for PostgreSQL and Redis)

## 1. Start databases
From this project folder:
```bash
docker compose up -d
```

## 2. Start the backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
API: `http://localhost:4000` — health check: `http://localhost:4000/health`

## 3. Start the frontend (new terminal)
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Open `http://localhost:3000`.

## API endpoints
- `GET /health` — API and dependency status
- `GET /api/tasks` — list tasks (Redis-cached)
- `POST /api/tasks` — create task; invalidates task-list cache
- `PATCH /api/tasks/:id` — toggle task completion; invalidates cache
- `DELETE /api/tasks/:id` — delete task; invalidates cache

## What to learn, in order
1. `docker-compose.yml`: local infrastructure and ports.
2. `backend/src/db.ts`: PostgreSQL connection pool and table initialization.
3. `backend/src/redis.ts`: Redis connection.
4. `backend/src/server.ts`: Express middleware, REST routes, SQL queries, and cache invalidation.
5. `frontend/app/page.tsx`: client-side state and calls to the API.
6. Change the app: add task descriptions, due dates, validation, and tests.

## Architecture
Browser → Next.js (3000) → Express API (4000) → PostgreSQL (5432)
                                      ↘ Redis (6379)

This is a learning starter, not production-hardened. It uses a simple startup table creation for convenience; later, learn migrations, schema validation, authentication, logging, tests, and environment-specific configuration.
