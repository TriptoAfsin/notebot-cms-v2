import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { levels, notes, subjects, topics } from "@/lib/db/schema";
import { invalidateNotesCache, invalidateSubjectsCache, invalidateTopicsCache } from "@/services/cache";

/**
 * Resolve-or-create a level → subject → topic → note chain, in one transaction.
 *
 * Shared by the CMS content form and the ingest API. Machine callers address content by slug,
 * not by id — n8n or a script knows "level 1, subject fpc", not that fpc happens to be id 203 —
 * so everything here is slug-addressed and case-insensitive, because v2 stores some slugs
 * upper-case (`IAE`) and a case-sensitive lookup is what created a duplicate `iae` subject
 * during an earlier backfill.
 */

export type IngestInput = {
  /** level slug as the engine uses it: "1".."4" */
  level: string;
  subject: { slug: string; displayName?: string };
  /** omit for a subject-level link, which is stored as a topic carrying metadata.directUrl */
  topic?: { slug: string; displayName?: string } | null;
  title: string;
  url: string;
  /** free-form provenance, merged into the note's metadata */
  source?: Record<string, unknown>;
};

export type IngestResult = {
  levelId: number;
  subjectId: number;
  topicId: number;
  noteId: number | null;
  created: { subject: boolean; topic: boolean; note: boolean };
  duplicate: boolean;
  subjectSlug: string;
  levelSlug: string;
};

const slugify = (s: string, max: number) =>
  String(s || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, max);

/** Drive links are the same file whether or not they carry ?usp=sharing. */
const driveId = (u: string) => {
  const m = String(u).match(/\/d\/([\w-]{10,})/) || String(u).match(/[?&]id=([\w-]{10,})/) || String(u).match(/\/folders\/([\w-]{10,})/);
  return m ? m[1] : null;
};

export class IngestError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function ingestNote(input: IngestInput): Promise<IngestResult> {
  const subjectSlug = slugify(input.subject.slug, 50);
  if (!subjectSlug) throw new IngestError("subject.slug is required");
  const topicSlug = input.topic ? slugify(input.topic.slug, 100) : null;
  if (input.topic && !topicSlug) throw new IngestError("topic.slug is required when topic is given");
  if (!input.title?.trim()) throw new IngestError("title is required");
  if (!/^https?:\/\//i.test(input.url ?? "")) throw new IngestError("url must start with http:// or https://");

  const result = await db.transaction(async (tx) => {
    const [level] = await tx.select().from(levels).where(eq(levels.slug, String(input.level)));
    if (!level) throw new IngestError(`unknown level "${input.level}"`, 404);

    // case-insensitive on purpose — see the note at the top of this file
    let [subject] = await tx
      .select()
      .from(subjects)
      .where(and(eq(subjects.levelId, level.id), sql`lower(${subjects.slug}) = ${subjectSlug}`));

    let createdSubject = false;
    if (!subject) {
      [subject] = await tx
        .insert(subjects)
        .values({
          levelId: level.id,
          name: subjectSlug,
          displayName: input.subject.displayName || subjectSlug.toUpperCase(),
          slug: subjectSlug,
          sortOrder: 999,
          metadata: { source: "ingest-api" },
        })
        .returning();
      createdSubject = true;
    }

    let topicId: number;
    let createdTopic = false;

    if (topicSlug) {
      let [topic] = await tx
        .select()
        .from(topics)
        .where(and(eq(topics.subjectId, subject.id), sql`lower(${topics.slug}) = ${topicSlug}`));
      if (!topic) {
        [topic] = await tx
          .insert(topics)
          .values({
            subjectId: subject.id,
            name: topicSlug,
            displayName: input.topic!.displayName || topicSlug,
            slug: topicSlug,
            sortOrder: 999,
            metadata: { source: "ingest-api" },
          })
          .returning();
        createdTopic = true;
      }
      topicId = topic.id;
    } else {
      // Subject-level link: a topic carrying metadata.directUrl, which the engine's compat layer
      // returns as {topic, url}. Same convention as the 677 such topics already in the tree.
      const linkSlug = slugify(input.title, 90) || `link_${Date.now()}`;
      const [topic] = await tx
        .insert(topics)
        .values({
          subjectId: subject.id,
          name: linkSlug,
          displayName: input.title,
          slug: linkSlug,
          sortOrder: 999,
          metadata: { source: "ingest-api", directUrl: input.url },
        })
        .returning();
      return {
        levelId: level.id, subjectId: subject.id, topicId: topic.id, noteId: null,
        created: { subject: createdSubject, topic: true, note: false },
        duplicate: false, subjectSlug: subject.slug, levelSlug: level.slug,
      };
    }

    // Idempotency: the same Drive file under the same topic is not inserted twice, so a retrying
    // caller (n8n, a re-run script) cannot create duplicates.
    const id = driveId(input.url);
    if (id) {
      const existing = await tx.select({ id: notes.id, url: notes.url }).from(notes).where(eq(notes.topicId, topicId));
      const hit = existing.find((n) => driveId(n.url) === id);
      if (hit) {
        return {
          levelId: level.id, subjectId: subject.id, topicId, noteId: hit.id,
          created: { subject: createdSubject, topic: createdTopic, note: false },
          duplicate: true, subjectSlug: subject.slug, levelSlug: level.slug,
        };
      }
    }

    const [note] = await tx
      .insert(notes)
      .values({
        topicId,
        title: input.title.slice(0, 500),
        url: input.url.slice(0, 1000),
        sortOrder: 999,
        metadata: { source: "ingest-api", ...(input.source ?? {}) },
      })
      .returning();

    return {
      levelId: level.id, subjectId: subject.id, topicId, noteId: note.id,
      created: { subject: createdSubject, topic: createdTopic, note: true },
      duplicate: false, subjectSlug: subject.slug, levelSlug: level.slug,
    };
  });

  // Invalidate exactly what changed. Without this the engine keeps serving its cached tree for
  // up to an hour and the ingest looks like it silently failed.
  if (result.created.subject) await invalidateSubjectsCache(result.levelId);
  if (result.created.topic) await invalidateTopicsCache(result.subjectId);
  if (result.created.note) await invalidateNotesCache(result.topicId);

  return result;
}
