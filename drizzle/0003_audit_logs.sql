CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" varchar(255),
	"actor_email" varchar(255),
	"action" varchar(20) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer,
	"entity_label" varchar(500),
	"before" jsonb,
	"after" jsonb,
	"ip" varchar(64),
	"user_agent" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_entity_idx" ON "audit_logs" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_actor_idx" ON "audit_logs" ("actor_id");
