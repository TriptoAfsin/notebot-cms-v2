CREATE TABLE IF NOT EXISTS "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(255) NOT NULL,
	"email" varchar(255),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"created_by" varchar(255),
	"used_by" varchar(255),
	"used_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "note_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"batch" varchar(50) NOT NULL,
	"department" varchar(50) NOT NULL,
	"level" varchar(50) NOT NULL,
	"subject_name" varchar(255) NOT NULL,
	"topic_name" varchar(255) NOT NULL,
	"note_link" varchar(1000) NOT NULL,
	"contact_info" varchar(500) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(255),
	"reviewed_at" timestamp,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
