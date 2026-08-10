CREATE TABLE IF NOT EXISTS "webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"secret" varchar(128) NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"disabled_reason" varchar(300),
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"webhook_id" integer NOT NULL,
	"event" varchar(50) NOT NULL,
	"response_status" integer,
	"response_body" text,
	"error" varchar(300),
	"attempts" integer DEFAULT 1 NOT NULL,
	"duration_ms" integer,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhooks_enabled_idx" ON "webhooks" ("enabled");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_deliveries_hook_idx" ON "webhook_deliveries" ("webhook_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_deliveries_created_idx" ON "webhook_deliveries" ("created_at");
