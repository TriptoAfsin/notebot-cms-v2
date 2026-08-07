-- The table was first created directly against the DB by the automation seed script
-- (notebot-automation/scripts/seed-syllabuses.js), so this migration is written to be safe to
-- run on a database that already has it.
CREATE TABLE IF NOT EXISTS "syllabuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch" varchar(20) NOT NULL,
	"department" varchar(50) NOT NULL,
	"department_name" varchar(100) NOT NULL,
	"department_sort" integer DEFAULT 0 NOT NULL,
	"topic" varchar(200) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "syllabuses_batch_dept_idx" ON "syllabuses" ("batch","department");
