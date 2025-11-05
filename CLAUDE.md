- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## Project Context

This repository contains a simple full-stack application built with:
- **Backend:** Fastify (Node 24), Drizzle ORM, PostgreSQL, Zod, Pino, dotenv  
- **Frontend:** Next.js (App Router), React, Tailwind, shadcn/ui, TanStack Query, simple i18n provider  
- **Shared:** Strict TypeScript types, ESLint + Prettier configuration  

The goal is a clean, maintainable baseline that applies **SOLID**, **DRY**, **KISS**, and **YAGNI** principles.  
All contributors and AI assistants should follow these standards.

---

## Principles

- **SOLID**: small, composable modules; single responsibility per function.  
- **DRY**: centralize utilities; prefer shared abstractions over duplication.  
- **KISS**: default to simple patterns; no over-engineering.  
- **YAGNI**: add complexity only when a real requirement demands it.  
- **Type safety first**: strict TypeScript, no implicit `any`.  
- **Predictable structure**: consistent imports, naming, and error handling.

---

## Directory Layout

/backend  
├─ src/  
│ ├─ server.ts  
│ ├─ routes/  
│ ├─ db/  
│ │ ├─ schema.ts  
│ │ └─ index.ts  
│ ├─ config/  
│ │ └─ env.ts  
│ ├─ utils/  
│ └─ plugins/  
├─ .env  
├─ drizzle.config.ts  
└─ tsconfig.json

/frontend  
├─ app/  
├─ components/  
├─ hooks/  
├─ lib/  
├─ styles/  
└─ tsconfig.json

/shared  
├─ types/  
├─ constants/  
└─ utils/

.eslintrc.cjs  
.prettierrc  

**Note:** This project uses npm workspaces (not pnpm). Shared code is imported via relative paths.


---

## Backend Standards

**Server:**
- Fastify instance configured in `server.ts`
- Register routes with schema validation (Zod)
- Pino logger with pretty-printing in development
- Global error handler with structured logging

**Database:**
- Drizzle ORM with postgres.js client
- Schemas in `/db/schema.ts`; database connection in `/db/index.ts`
- No raw SQL unless absolutely required
- Use Drizzle Kit for migrations: `npm run db:generate`, `npm run db:push`

**Configuration:**
- `.env` loaded with `dotenv/config`
- Environment variables validated with Zod on startup (`config/env.ts`)
- Never commit secrets
- Required vars: `DATABASE_URL`, `ADMIN_PASSWORD` (min 8 chars), optional: `PORT`, `NODE_ENV`

**Validation:**
- Use Zod for request/response typing and validation
- Combine schema inference with TypeScript types
- Validate on route handler entry

**Logging:**
- Pino for structured logs
- Pretty-printing in development mode
- Log minimal context: timestamp, level, message, request ID

**CORS:**
- `@fastify/cors` registered
- Currently allowing all origins (development)
- **TODO:** Restrict to specific frontend domain(s) in production

**Rate Limiting:**
- `@fastify/rate-limit` middleware applied globally
- Default: 100 requests/minute per IP

**Testing:**  
- Lightweight tests via `vitest`.  
- Mock external services.

---

## Frontend Standards

**Next.js App Router:**  
- Use server components by default; client components only when needed.  
- Place pages in `/app/`; isolate UI in `/components/`.  
- Centralize data fetching in `/lib/api.ts` using TanStack Query.

**Styling:**  
- TailwindCSS for layout.  
- shadcn/ui for UI primitives.  
- Avoid inline styles unless dynamic.

**State & Data:**  
- TanStack Query for server state.  
- Minimal local state; prefer derived data.

**Internationalization:**  
- Simple `i18n` provider with translation files in `/lib/i18n/`.  
- Avoid runtime string concatenation.

**Performance:**  
- Static generation where possible.  
- Use React Suspense and lazy loading for large components.

---

## Shared Code

**Types:**  
- Define shared domain types in `/shared/types`.  
- Re-export from a central index for discoverability.

**Utilities:**  
- Place generic helpers in `/shared/utils`.  
- Avoid business logic in utilities.

**Constants:**  
- Store app-wide constants in `/shared/constants`.

---

## Tooling & Quality

**TypeScript:**  
- `"strict": true` in all `tsconfig.json` files.  
- No implicit `any`, `@ts-ignore`, or non-null assertions without reason.

**Linting:**  
- ESLint (recommended config + TypeScript + React).  
- Prettier integrated.  
- Run `pnpm lint` in CI.

**Commits:**  
- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, etc.).  
- Keep messages concise.

**Code Reviews:**  
- Ensure small, testable PRs.  
- No commented-out code or dead files.

---

## Deployment & Ops

**Environment separation:**  
- `.env.development`, `.env.production`.  
- Use environment variables for all secrets.

**Logging & Monitoring:**  
- Pino logs pipe to standard output.  
- Integrate external log collection if deployed to cloud.

**Build:**
- Backend: `npm run build` (TypeScript compilation), `npm run dev` (watch mode)
- Frontend: `npm run build`, `npm run dev`
- Database: `npm run db:push` (push schema), `npm run db:studio` (Drizzle Studio GUI)

---

## When Extending

Before adding dependencies or complexity:
1. Ask if it’s required by a current feature.  
2. Check if it can be solved with existing utilities.  
3. Ensure type coverage and minimal cognitive overhead.  

Keep the project simple, fast, and predictable.

## Additional notes

Propose to remove unused libraries/packages.  
