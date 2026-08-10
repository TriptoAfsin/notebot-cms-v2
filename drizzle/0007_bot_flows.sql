-- Bespoke Messenger flows: the reply blocks for payloads that are not rows in the content tables.
--
-- Everything addressable (topics, subjects, levels, labs, routines, question banks, syllabuses) is
-- resolved live from those tables by the engine. What remains is editorial -- usage instructions,
-- donation details, top-level menus, partner cards -- and it used to sit in a committed JSON file,
-- so changing the bot's help text needed a deploy. It lives here so the CMS can edit it.
--
-- `blocks` stays jsonb on purpose: these are arbitrary Send API message arrays (text, button
-- templates, generic cards, quick replies) and a schema modelling every variant would have to
-- change whenever Meta adds one.
CREATE TABLE IF NOT EXISTS "bot_flows" (
  "id"         serial PRIMARY KEY NOT NULL,
  "payload"    varchar(200) NOT NULL,
  "label"      varchar(200),
  "kind"       varchar(40)  DEFAULT 'other' NOT NULL,
  "blocks"     jsonb        NOT NULL,
  "enabled"    boolean      DEFAULT true NOT NULL,
  "metadata"   jsonb,
  "created_at" timestamp    DEFAULT now() NOT NULL,
  "updated_at" timestamp    DEFAULT now() NOT NULL,
  CONSTRAINT "bot_flows_payload_unique" UNIQUE("payload")
);
--> statement-breakpoint
-- The bot resolves a postback by lowercased payload on every button tap.
CREATE INDEX IF NOT EXISTS "bot_flows_payload_lower_idx" ON "bot_flows" (lower("payload"));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bot_flows_kind_idx" ON "bot_flows" ("kind");
