CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"prefix" varchar(12) NOT NULL,
	"scopes" jsonb DEFAULT '["ingest:write"]'::jsonb NOT NULL,
	"created_by" varchar(255),
	"last_used_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_keys_hash_idx" ON "api_keys" ("key_hash");
