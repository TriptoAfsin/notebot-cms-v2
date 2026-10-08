-- Contributors: the students who submit notes through the Google Form, keyed by email.
--
-- Deliberately NOT rows in better-auth's "user" table. That table holds CMS logins, and the CMS
-- authorises by "has a session" (lib/session.ts) rather than by role, so a contributor living there
-- would be one password-reset away from editing content. A contributor is a person we credit and
-- thank, not someone who signs in.
--
-- Idempotent like 0003-0007: applied directly, not through drizzle-kit (whose journal stops at 0002).

CREATE TABLE IF NOT EXISTS "contributors" (
  "id"                   serial PRIMARY KEY NOT NULL,
  -- Always stored lower-cased and typo-corrected by notebot_email(), so the plain UNIQUE is the match.
  "email"                varchar(255) NOT NULL UNIQUE,
  "name"                 varchar(255),
  "batch"                varchar(50),
  "department"           varchar(50),
  -- Form rows from before the pipeline existed (2019 - Jul 2026) never became `submissions` rows,
  -- so they are counted here once by the backfill. Anything later is counted from `submissions`.
  "legacy_submissions"   integer      DEFAULT 0 NOT NULL,
  "first_submitted_at"   timestamptz,
  "last_submitted_at"    timestamptz,
  "last_acknowledged_at" timestamptz,
  "source"               varchar(30)  DEFAULT 'ingest' NOT NULL,
  "created_at"           timestamptz  DEFAULT now() NOT NULL,
  "updated_at"           timestamptz  DEFAULT now() NOT NULL
);

ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "contributor_id"  integer REFERENCES "contributors"("id") ON DELETE SET NULL;
-- NULL = not yet thanked. 'sent' | 'no-email' | 'skipped-preexisting' | 'failed'
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "ack_status"      varchar(30);
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "acknowledged_at" timestamptz;
CREATE INDEX IF NOT EXISTS "submissions_contributor_idx" ON "submissions" ("contributor_id");
CREATE INDEX IF NOT EXISTS "submissions_ack_idx" ON "submissions" ("status", "ack_status");

-- The form's contact field is free text: an address, "address/Name", or (when it was optional) a
-- Facebook name. Returns the first address in it, lower-cased, with the gmail typos the form has
-- actually received corrected - or NULL when there is no address, which is how names are ignored.
CREATE OR REPLACE FUNCTION notebot_email(raw text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(
           rtrim(lower(substring(raw FROM '[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}')), '.'),
           '@(gmai|gamil|gmial|gmil)\.com$', '@gmail.com')
$$;

-- Form timestamps arrive as "M/D/YYYY H:MM:SS" in the form's Dhaka time.
CREATE OR REPLACE FUNCTION notebot_form_ts(raw text) RETURNS timestamptz
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN to_timestamp(raw, 'MM/DD/YYYY HH24:MI:SS')::timestamp AT TIME ZONE 'Asia/Dhaka';
EXCEPTION WHEN others THEN
  RETURN NULL;
END $$;

-- Turns every not-yet-linked submission with an address into a contributor and links it.
-- Safe to call as often as you like; the n8n ingest calls it after staging rows and the
-- acknowledgement step calls it before sending. Returns how many submissions it linked.
CREATE OR REPLACE FUNCTION sync_contributors() RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE linked integer;
BEGIN
  INSERT INTO contributors (email, name, batch, department, first_submitted_at, last_submitted_at, source)
  SELECT DISTINCT ON (notebot_email(s.info))
         notebot_email(s.info), nullif(trim(s.name), ''), nullif(trim(s.batch), ''), nullif(trim(s.department), ''),
         notebot_form_ts(s.submitted_at), notebot_form_ts(s.submitted_at), 'ingest'
    FROM submissions s
   WHERE s.contributor_id IS NULL AND notebot_email(s.info) IS NOT NULL
   ORDER BY notebot_email(s.info), s.id DESC
  ON CONFLICT (email) DO UPDATE SET
     name              = coalesce(excluded.name, contributors.name),
     batch             = coalesce(excluded.batch, contributors.batch),
     department        = coalesce(excluded.department, contributors.department),
     first_submitted_at = least(contributors.first_submitted_at, excluded.first_submitted_at),
     last_submitted_at  = greatest(contributors.last_submitted_at, excluded.last_submitted_at),
     updated_at        = now();

  UPDATE submissions s SET contributor_id = c.id
    FROM contributors c
   WHERE s.contributor_id IS NULL AND c.email = notebot_email(s.info);
  GET DIAGNOSTICS linked = ROW_COUNT;
  RETURN linked;
END $$;
