import { NextResponse } from "next/server";

/**
 * GET /skill.md — the agent skill, served as plain text.
 *
 * Public and unauthenticated on purpose: an agent has to be able to fetch it *before* it has a
 * key, and it contains no secrets. Mirrors the copy committed at
 * notebot-engine-v1/.claude/skills/notebot-content/SKILL.md; this is the fetchable one so the
 * setup prompt on /api-keys is a single curl rather than "find this file in a repo".
 */

const BASE = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://cms.butexnotebot.com";

const SKILL = `---
name: notebot-content
description: >
  Add or correct NoteBot academic content — notes, lab reports, topics, subjects — via the
  NoteBot CMS ingest API. Use when placing a submitted note, adding content in bulk, or checking
  why content is not appearing for students. Encodes the placement rules, the Messenger limits
  that silently truncate titles, and the cache layers that make a successful write look like a
  failure.
---

# NoteBot content

Two engines serve one library. **v1** is the JS flow files the Messenger bot and web app read
today. **v2** is Postgres, fronted by this CMS and \`https://api.butexnotebot.com\`. This skill
covers adding content through the API.

## Authenticate

Mint a key at \`${BASE}/api-keys\`. Send it as \`x-api-key\`. Keys expire — 90 days by default —
and a revoked or expired key returns 401 without saying which.

Keep the key in an environment variable. Do not write it into a file that gets committed.

## Add a note

\`\`\`bash
curl -X POST "${BASE}/api/v1/ingest/note" \\
  -H "x-api-key: $NOTEBOT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "1",
    "subject": { "slug": "fpc", "displayName": "Fundamental of Polymer Chemistry" },
    "topic":   { "slug": "fpcDegradation", "displayName": "Polymer Degradation" },
    "title": "Hand Note(Jeba Fariha, TME-51, 2026)",
    "url": "https://drive.google.com/file/d/FILE_ID/view"
  }'
\`\`\`

- Addressed by **slug**, not id, and matched case-insensitively.
- Missing subject or topic is **created**; pass \`displayName\` so it is not named after its slug.
- Omit \`topic\` entirely for a subject-level link (a "Full Notes" style button).
- **Idempotent** by Drive file id within a topic: re-posting the same file returns
  \`{"duplicate": true}\` with 200 instead of a second row, so retries are safe.
- \`201\` on create, \`200\` on duplicate, \`401\` bad key, \`404\` unknown level, \`400\` validation.

## Title format

\`Kind(Author, DEPT-BATCH, Year)\` — parts omitted when unknown:

\`\`\`
Hand Note(Jeba Fariha, TME-51, 2026)
Hand Note(Akib, 2018)
Sheet(2019)
Slide
\`\`\`

Kinds in use: Hand Note, Sheet, Slide, Class Lecture, Book, Book Scanned, QB Solve, Suggestion,
Part-A, Part-B, Full Notes.

## Messenger limits — these fail silently

| | Limit | On exceeding |
|---|---|---|
| Button title | **20 chars** | cut, by UTF-16 code unit |
| Buttons per group | **3** | the 4th is discarded |

**Subject** and **topic** display names become button titles, so both are cut at 20. A **note
title under a topic** is a text bubble, not a button, and is not cut — long note titles are fine.

## After writing directly to the database

The API invalidates the cache for you. A script or SQL edit does not, and the change will look
like it failed for up to an hour:

\`\`\`bash
curl -X POST "https://api.butexnotebot.com/admin/cache/flush" \\
  -H "x-api-key: $ADMIN_API_KEY" -H "Content-Type: application/json" \\
  -d '{"scope":"all"}'
\`\`\`

A server flush cannot reach a student's browser — the web app keeps its own copy for 6 hours.
After a large correction, bump \`CACHE_VERSION\` in \`notebot-web-v2/src/lib/query-client.ts\`.

## Gotchas

- v1 and v2 slugs differ: \`tc1\`→\`tc_i\`, \`econo\`→\`economics\`, \`weaving2\`→\`weave2\`.
- Some v2 slugs are upper-case (\`IAE\`). Always compare case-insensitively.
- A **lab report** belongs in \`lab_reports\`, never in \`notes\` — filing one as a note creates a
  bogus subject in the notes tree.
- Content for an existing subject goes inside that subject, never into \`level_N_flow.js\`.
`;

export function GET() {
  return new NextResponse(SKILL, {
    status: 200,
    headers: {
      // text/markdown so a browser shows it instead of downloading it
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
