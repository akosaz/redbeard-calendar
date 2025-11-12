# Redbeard Calendar

Web-based availability calendar built with Next.js (React, TypeScript) on the frontend and a Node.js + Fastify + PostgreSQL with Drizzle ORM backend.

Its purpose is to show visitors which days are open for placing orders, with three simple states:

- **Available** → transparent background
- **Limited** → yellow background
- **Finished** → red background

On the public site, users see a clean, mobile-friendly calendar where each day is displayed as a circle with a status color. The month view is scrollable, with navigation arrows to move between months. A legend under the calendar explains the meaning of each color.

On the management side, authorized staff can access a hidden route where the same calendar becomes interactive: clicking a day cycles its status (available → limited → finished → available). Edits are saved to the backend through a password-protected API.

The backend API stores day states in a PostgreSQL database and provides them to the frontend via JSON. It also supports updates using an upsert strategy (insert or update in one query).

Styling is done with Tailwind CSS, responsive for both desktop and mobile.

---

## Quick Start

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit the .env files with your values

# Start PostgreSQL (via Docker)
docker compose up -d postgres

# Push database schema
npm run db:push

# Start both backend and frontend
npm run dev
```

- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Database Studio**: `npm run db:studio`

### Running Tests

```bash
# Run all backend tests
npm test

# Watch mode for development
npm run test:watch

# With coverage
npm run test:coverage
```

### Docker Deployment

```bash
# Copy environment file
cp .env.example .env
# Edit .env with production values

# Start all services (backend + PostgreSQL)
docker compose up -d

# View logs
docker compose logs -f

# Health check
curl http://localhost:8080/health
```

---

## Project Structure

```
redbeard-calendar/
├── backend/              # Fastify API server
│   ├── src/
│   │   ├── config/       # Environment validation
│   │   ├── db/           # Database schema & connection
│   │   ├── routes/       # API routes (in server.ts)
│   │   └── test/         # Test utilities
│   ├── Dockerfile        # Production container
│   └── vitest.config.ts  # Test configuration
├── frontend/             # Next.js application
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   └── lib/              # Utilities & i18n
├── shared/               # Shared types & utilities
│   ├── types/            # TypeScript type definitions
│   ├── constants/        # Shared constants
│   └── utils/            # Shared utility functions
├── docker-compose.yml    # Docker orchestration
├── DEPLOYMENT.md         # Production deployment guide
└── package.json          # Workspace configuration
```

---

## Tech Stack

**Backend:**
- Fastify (Node 24) - Fast web framework
- Drizzle ORM - Type-safe database toolkit
- PostgreSQL - Relational database
- Zod - Schema validation
- Pino - Structured logging
- Vitest - Unit testing

**Frontend:**
- Next.js 15 (App Router) - React framework
- React 19 - UI library
- Tailwind CSS - Utility-first styling
- TypeScript - Type safety

**Infrastructure:**
- Docker & Docker Compose - Containerization
- npm workspaces - Monorepo management

---

## Available Scripts

### Root Commands

```bash
npm run dev              # Start backend + frontend concurrently
npm run build            # Build all workspaces
npm test                 # Run all tests
npm run lint             # Lint all workspaces

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio GUI
npm run db:generate      # Generate migrations

# Docker
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View logs
```

### Workspace-specific

```bash
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run test:backend     # Test backend only
npm run test:watch       # Watch mode for tests
```

---

## Deployment

Choose your deployment strategy:

### Option 1: 100% FREE Deployment (Recommended) 🎉
See [DEPLOYMENT-FREE.md](DEPLOYMENT-FREE.md) for step-by-step instructions.

- **Database**: Supabase (FREE tier - 500MB)
- **Backend**: Railway or Render (FREE tier)
- **Frontend**: Vercel (FREE tier)
- **Total cost**: **$0/month**

Perfect for hobby projects, MVPs, and small businesses!

### Option 2: VPS Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive instructions.

- **Backend + Database**: VPS with Docker ($5-10/month)
- **Frontend**: Vercel (FREE tier)
- **Total cost**: $5-10/month

Better for high-traffic apps or when you need full control.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database (local or Supabase)
DATABASE_URL=postgresql://user:password@localhost:5432/redbeard_calendar

# Security
ADMIN_PASSWORD=your-secure-password

# Server configuration
PORT=8080
NODE_ENV=development

# Frontend URL for CORS (configurable per deployment)
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
# Backend API URL (matches backend server)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Admin configuration
ADMIN_PASSWORD=your-secure-password
ADMIN_ROUTE_SLUG=your-secret-admin-route
ADMIN_COOKIE=redbeard_admin_session
```

### Production Deployment

When deploying to production, update both frontend and backend URLs to match:

**Backend** (`backend/.env`):
```env
FRONTEND_URL=https://your-vercel-domain.vercel.app
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres
```

**Frontend** (Vercel dashboard):
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

## Contributing

This project follows **SOLID**, **DRY**, **KISS**, and **YAGNI** principles. See [CLAUDE.md](CLAUDE.md) for detailed coding standards.

---

## License

[MIT License](LICENSE)