-- The note-submission form gained a required "Content type" question in Oct 2026:
--   Notes / Sheets/ Slides/ Books | Lab Report | Question Bank | Question Solve | Other: <free text>
-- The n8n ingest stores the answer as given and derives `kind` from it (Notes and Question Solve ->
-- 'note', Lab Report -> 'lab', Question Bank -> 'question'). Rows submitted before the question existed,
-- and "Other" answers, have no usable value: for those `kind` is still guessed from the subject/topic
-- text, so this column is NULL for every older row and nothing may depend on it being set.
--
-- Idempotent like 0003-0009: applied directly, not through drizzle-kit.
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "content_type" varchar(120);

-- Same function as 0008, plus the ".con" ending the renamed "Your Email" field has already received.
CREATE OR REPLACE FUNCTION notebot_email(raw text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(regexp_replace(
           rtrim(lower(substring(raw FROM '[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}')), '.'),
           '@(gmai|gamil|gmial|gmil)\.com$', '@gmail.com'),
           '@gmail\.con$', '@gmail.com')
$$;
