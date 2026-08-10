import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyApiKey } from "@/lib/api-key";
import { logAudit } from "@/lib/audit";
import { IngestError, ingestNote } from "@/lib/ingest";

/**
 * POST /api/v1/ingest/note
 *
 * Machine entry point for adding content — for n8n, a script, or the scheduled agent. Addressed
 * by slug rather than id, because a caller knows "level 1, subject fpc", not that fpc is id 203.
 *
 * Auth is an `x-api-key` header holding a key minted in the CMS. Note that proxy.ts must list
 * /api/v1 as public or Next redirects this to /login before the handler ever runs.
 *
 * Idempotent: re-posting the same Drive file under the same topic returns the existing note with
 * `duplicate: true` rather than creating a second row, so a retrying caller is safe.
 */

const bodySchema = z.object({
  level: z.union([z.string(), z.number()]).transform(String),
  subject: z.object({ slug: z.string().min(1), displayName: z.string().optional() }),
  topic: z.object({ slug: z.string().min(1), displayName: z.string().optional() }).nullish(),
  title: z.string().min(1).max(500),
  url: z.string().url().max(1000),
  source: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const key = await verifyApiKey(req.headers.get("x-api-key"));
  if (!key) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const result = await ingestNote({ ...parsed.data, topic: parsed.data.topic ?? null });

    // The audit trail records the key that acted, since there is no signed-in user here.
    if (!result.duplicate) {
      await logAudit({
        action: "create",
        entityType: result.noteId ? "note" : "topic",
        entityId: result.noteId ?? result.topicId,
        entityLabel: parsed.data.title,
        after: {
          via: "ingest-api",
          apiKey: key.label,
          level: parsed.data.level,
          subject: parsed.data.subject.slug,
          topic: parsed.data.topic?.slug ?? null,
          title: parsed.data.title,
          url: parsed.data.url,
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        duplicate: result.duplicate,
        created: result.created,
        note: result.noteId ? { id: result.noteId } : null,
        topic: { id: result.topicId },
        subject: { id: result.subjectId, slug: result.subjectSlug },
        // where this now lives, so the caller can verify it rather than trust the 200
        route: `app/notes/${result.levelSlug}/${result.subjectSlug}`,
      },
      { status: result.duplicate ? 200 : 201 }
    );
  } catch (err: unknown) {
    if (err instanceof IngestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[ingest] failed", err);
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
  }
}
