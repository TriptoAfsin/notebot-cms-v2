# NoteBot CMS V2

Content management system for BUTEX NoteBot. Manage academic notes, lab reports, question banks, routines, and results through a web dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Drizzle ORM)
- **Cache:** Redis for cache invalidation
- **Auth:** Better Auth (email/password)
- **Email:** Resend (transactional emails)
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Forms:** React Hook Form + Zod validation

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Seed admin user (or use /setup in browser)
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
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` - CMS base URL
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Initial admin credentials for seeding
- `RESEND_API_KEY` - Resend API key for transactional emails
- `RESEND_FROM_EMAIL` - Sender address (e.g. `NoteBot <admin@yourdomain.com>`)
- `CONTACT_TO_EMAIL` - Admin contact email

## Features

- CRUD for all content types: levels, subjects, topics, notes, lab reports, question banks, routines, results
- Hierarchical navigation (level > subject > topic > notes)
- Redis cache invalidation on content changes
- Protected dashboard with session-based auth
- **User management** - view and delete users
- **Invitation system** - create invite links, optional email delivery, role assignment
- **Note submissions** - public form for community note contributions
- **Submission tracking** - public status tracker for submitters
- **Submission review** - admin approve/reject workflow with optional notes
- **Email notifications** via Resend:
  - Invitation emails with registration link
  - Submission acknowledgement on form submit
  - Review notification when admin approves/rejects

## Database Migrations

Schema is managed with Drizzle ORM. When you change or add schema files in `lib/db/schema/`:

```bash
# 1. Edit schema files in lib/db/schema/
# 2. Generate migration SQL (diffs your schema against the last snapshot)
npm run db:generate

# 3. Review the generated .sql file in drizzle/

# 4. Apply migration to your database
npm run db:migrate
```

These commands load env vars from `.env.local` automatically via `dotenv-cli`.

To browse your database visually:

```bash
npm run db:studio
```

## Project Structure

```
app/
  (dashboard)/        # Protected routes (require login)
    levels/           # Levels CRUD
    subjects/         # Subjects CRUD
    topics/           # Topics CRUD
    notes/            # Notes CRUD
    lab-reports/      # Lab reports CRUD
    question-banks/   # Question banks CRUD
    routines/         # Routines CRUD
    results/          # Results CRUD
    users/            # User management
    invitations/      # Invitation management + create
    submissions/      # Submission review + detail
  invite/[token]/     # Public - invitation registration
  submit/             # Public - note submission form
  submit/track/       # Public - submission status tracker
  login/              # Login page
  setup/              # First-time admin setup
  api/auth/           # Auth API routes
lib/
  db/schema/          # Drizzle ORM schema
  auth.ts             # Better Auth config
  auth-client.ts      # Client-side auth
  email.ts            # Resend email functions
actions/              # Server actions (form handling + Zod validation)
services/             # DB queries + cache invalidation
components/
  ui/                 # shadcn/ui components
  layout/             # Sidebar, layout components
drizzle/              # Generated migration SQL files
```

## Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run db:generate   # Generate migration from schema changes
npm run db:migrate    # Apply migrations to database
npm run db:studio     # Open Drizzle Studio (DB browser)
```
