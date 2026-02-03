# NoteBot CMS V2

Content management system for BUTEX NoteBot. Manage academic notes, lab reports, question banks, routines, and results through a web dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Drizzle ORM)
- **Cache:** Redis (via ioredis) for cache invalidation
- **Auth:** Better Auth (email/password)
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Forms:** React Hook Form + Zod validation

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Run database migrations
npx drizzle-kit push

# Seed admin user
npx tsx scripts/seed-admin.ts

# Start development server
npm run dev
```

The CMS runs on `http://localhost:3000` by default.

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_PUBLIC_URL` - PostgreSQL connection string (shared with engine)
- `REDIS_URL` - Redis connection string (shared with engine)
- `BETTER_AUTH_SECRET` - Auth encryption secret
- `BETTER_AUTH_URL` - CMS base URL
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Initial admin credentials for seeding

## Features

- CRUD for all content types: levels, subjects, topics, notes, lab reports, question banks, routines, results
- Hierarchical navigation (level > subject > topic > notes)
- Redis cache invalidation on content changes
- Protected dashboard with session-based auth
- Data tables with search and filtering

## Project Structure

```
app/
  (dashboard)/    # Protected routes
    levels/       # Levels CRUD
    subjects/     # Subjects CRUD
    topics/       # Topics CRUD
    notes/        # Notes CRUD
    lab-reports/  # Lab reports CRUD
    question-banks/
    routines/
    results/
  login/          # Login page
  api/auth/       # Auth API routes
lib/
  db/schema/      # Drizzle ORM schema (shared with engine)
  auth.ts         # Better Auth config
actions/          # Server actions for CRUD
services/         # DB queries + cache invalidation
components/
  ui/             # shadcn/ui components
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```
