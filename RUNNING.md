# Running SehatHub

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| Docker Desktop | any | https://docker.com |

---

## First-time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env
# Fill in JWT_SECRET, JWT_REFRESH_SECRET, RESEND_API_KEY (see below)

# 3. Start database and Redis
docker compose up -d

# 4. Push schema and seed the database
pnpm db:push
pnpm db:seed
```

After seeding, a Super Admin account is created:
- **Email:** `superadmin@sehathub.id`
- **Password:** `SuperAdmin123!`

---

## Daily Dev Workflow

```bash
# Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# Start all apps (API + Web) in parallel
pnpm dev
```

The `pnpm dev` command runs via Turborepo — it starts all packages that have a `dev` script.

| Service | URL |
|---------|-----|
| Web (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:3001 |
| API base path | http://localhost:3001/api/v1 |

---

## Required Environment Variables

These must be set in `.env` before starting:

```env
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=
JWT_REFRESH_SECRET=

# Get from https://resend.com (free tier works for dev)
RESEND_API_KEY=
```

Everything else in `.env` works as-is for local development.

---

## Database Commands

```bash
# Open Prisma Studio (visual DB browser)
pnpm db:studio

# Push schema changes (no migration file — use during active development)
pnpm db:push

# Create a migration file (use when schema is stable)
pnpm db:migrate

# Re-run seed (resets super admin account)
pnpm db:seed

# Regenerate Prisma client after schema changes
pnpm db:generate
```

---

## Docker Commands

```bash
# Start containers
docker compose up -d

# Stop containers (keeps data)
docker compose stop

# Stop and wipe all data (full reset)
docker compose down -v

# View logs
docker compose logs -f postgres
docker compose logs -f redis
```

Container names: `sehathub_postgres` (port 5433), `sehathub_redis` (port 6379)

> **Note:** PostgreSQL runs on port **5433** (not 5432) because a local PostgreSQL instance occupies 5432 on this machine.

---

## Troubleshooting

**`pnpm` not found**
```bash
npm install -g pnpm
```

**Database connection refused**
```bash
docker compose up -d
# Wait ~5s then retry
```

**Prisma client out of sync after schema change**
```bash
pnpm db:push      # applies schema
pnpm db:generate  # regenerates client
```

**Port 3000 or 3001 already in use**
```bash
# Find and kill the process
lsof -ti :3000 | xargs kill
lsof -ti :3001 | xargs kill
```
