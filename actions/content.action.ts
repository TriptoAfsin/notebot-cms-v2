"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { levels, notes, subjects, topics } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { uniqueSlug } from "@/lib/slug";
import { invalidateNotesCache, invalidateSubjectsCache, invalidateTopicsCache } from "@/services/cache";

/**
 * One-submit content creation.
 *
 * Adding a note to a course that does not exist yet used to mean four pages, four navigations
 * and inventing nine identifier fields by hand. This resolves or creates the whole
 * level → subject → topic → note chain in a single transaction, so a half-finished chain can
 * never be left behind if a later step fails.
 */

const slugRe = /^[a-z0-9_-]+$/;

const schema = z.object({
  levelId: z.coerce.number().int().positive("Pick a level"),

  subjectMode: z.enum(["existing", "new"]),
  subjectId: z.coerce.number().int().optional(),
  subjectName: z.string().trim().max(100).optional(),
  subjectSlug: z.string().trim().max(50).regex(slugRe, "Lowercase letters, numbers, - and _ only").optional(),

  // "none" places the link on the subject page itself, the way a v1 subject-flow web link does
  topicMode: z.enum(["existing", "new", "none"]),
  topicId: z.coerce.number().int().optional(),
  topicName: z.string().trim().max(200).optional(),
  topicSlug: z.string().trim().max(100).regex(slugRe, "Lowercase letters, numbers, - and _ only").optional(),

  title: z.string().trim().min(1, "Title is required").max(500),
  url: z.string().trim().url("Must be a valid URL").max(1000),
})
  .refine((d) => d.subjectMode !== "existing" || !!d.subjectId, {
    message: "Pick a subject", path: ["subjectId"],
  })
  .refine((d) => d.subjectMode !== "new" || (!!d.subjectName && !!d.subjectSlug), {
    message: "New subjects need a name and a slug", path: ["subjectName"],
  })
  .refine((d) => d.topicMode !== "existing" || !!d.topicId, {
    message: "Pick a topic", path: ["topicId"],
  })
  .refine((d) => d.topicMode !== "new" || (!!d.topicName && !!d.topicSlug), {
    message: "New topics need a name and a slug", path: ["topicName"],
  });

const num = (v: FormDataEntryValue | null) => (v === null || v === "" ? undefined : v);

export async function createContentAction(formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;

  const parsed = schema.safeParse({
    levelId: formData.get("levelId"),
    subjectMode: formData.get("subjectMode"),
    subjectId: num(formData.get("subjectId")),
    subjectName: formData.get("subjectName") ?? undefined,
    subjectSlug: formData.get("subjectSlug") ?? undefined,
    topicMode: formData.get("topicMode"),
    topicId: num(formData.get("topicId")),
    topicName: formData.get("topicName") ?? undefined,
    topicSlug: formData.get("topicSlug") ?? undefined,
    title: formData.get("title"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, success: undefined };
  }
  const d = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      const [level] = await tx.select().from(levels).where(eq(levels.id, d.levelId));
      if (!level) throw new Error("That level no longer exists");

      // ---- subject ----
      let subjectId = d.subjectId!;
      let subjectSlug = "";
      let subjectDisplay = "";
      let createdSubject = false;

      if (d.subjectMode === "new") {
        // Slugs are derived, and `subjects.slug` has no unique constraint — two rows sharing one
        // makes the engine resolve them nondeterministically. Rather than rejecting the save
        // (the editor cannot know what is already taken), suffix until it is free. Compared
        // case-insensitively because the engine's lookup is.
        const siblings = await tx.select({ slug: subjects.slug }).from(subjects)
          .where(eq(subjects.levelId, d.levelId));
        const slug = uniqueSlug(d.subjectSlug!, siblings.map((s) => s.slug), 50);

        const [row] = await tx.insert(subjects).values({
          levelId: d.levelId,
          name: slug,
          displayName: d.subjectName!,
          slug,
          sortOrder: 999,
          metadata: { source: "cms-content-form" },
        }).returning();
        subjectId = row.id; subjectSlug = row.slug; subjectDisplay = row.displayName; createdSubject = true;
      } else {
        const [row] = await tx.select().from(subjects).where(eq(subjects.id, subjectId));
        if (!row) throw new Error("That subject no longer exists");
        if (row.levelId !== d.levelId) throw new Error("That subject belongs to a different level");
        subjectSlug = row.slug; subjectDisplay = row.displayName;
      }

      // ---- topic ----
      let topicId: number | null = null;
      let createdTopic = false;

      if (d.topicMode === "new") {
        const siblings = await tx.select({ slug: topics.slug }).from(topics)
          .where(eq(topics.subjectId, subjectId));
        const slug = uniqueSlug(d.topicSlug!, siblings.map((t) => t.slug), 100);

        const [row] = await tx.insert(topics).values({
          subjectId,
          name: slug,
          displayName: d.topicName!,
          slug,
          sortOrder: 999,
          metadata: { source: "cms-content-form" },
        }).returning();
        topicId = row.id; createdTopic = true;
      } else if (d.topicMode === "existing") {
        const [row] = await tx.select().from(topics).where(eq(topics.id, d.topicId!));
        if (!row) throw new Error("That topic no longer exists");
        if (row.subjectId !== subjectId) throw new Error("That topic belongs to a different subject");
        topicId = row.id;
      }

      if (topicId === null) {
        // subject-level link: modelled as a topic carrying metadata.directUrl, which is what
        // compat.routes.ts turns into a {topic, url} entry — the same shape v1 emits for a
        // webBtnBlockGen sitting directly in <subject>_flow.js
        const linkSiblings = await tx.select({ slug: topics.slug }).from(topics)
          .where(eq(topics.subjectId, subjectId));
        const linkSlug = uniqueSlug(d.title, linkSiblings.map((t) => t.slug), 100);
        const [row] = await tx.insert(topics).values({
          subjectId,
          name: linkSlug,
          displayName: d.title,
          slug: linkSlug,
          sortOrder: 999,
          metadata: { source: "cms-content-form", directUrl: d.url },
        }).returning();
        return { subjectId, topicId: row.id, noteId: null, createdSubject, createdTopic: true, directLink: true, subjectSlug, subjectDisplay, levelSlug: level.slug };
      }

      const [note] = await tx.insert(notes).values({
        topicId, title: d.title, url: d.url, sortOrder: 999,
        metadata: { source: "cms-content-form" },
      }).returning();

      return { subjectId, topicId, noteId: note.id, createdSubject, createdTopic, directLink: false, subjectSlug, subjectDisplay, levelSlug: level.slug };
    });

    // one entry per row created, so the trail matches what the per-entity forms record
    if (result.createdSubject) {
      await logAudit({ action: "create", entityType: "subject", entityId: result.subjectId, entityLabel: result.subjectDisplay, after: { levelId: d.levelId, displayName: d.subjectName, slug: d.subjectSlug } });
    }
    if (result.createdTopic) {
      await logAudit({ action: "create", entityType: "topic", entityId: result.topicId, entityLabel: result.directLink ? d.title : d.topicName, after: { subjectId: result.subjectId, displayName: result.directLink ? d.title : d.topicName, directUrl: result.directLink ? d.url : undefined } });
    }
    if (result.noteId) {
      await logAudit({ action: "create", entityType: "note", entityId: result.noteId, entityLabel: d.title, after: { topicId: result.topicId, title: d.title, url: d.url } });
    }

    // invalidate only what actually changed; the engine reads these exact keys
    if (result.createdSubject) await invalidateSubjectsCache(d.levelId);
    if (result.createdTopic) await invalidateTopicsCache(result.subjectId);
    if (result.noteId) await invalidateNotesCache(result.topicId);

    revalidatePath("/notes");
    revalidatePath("/topics");
    revalidatePath("/subjects");
    return { success: true, ...result };
  } catch (err: unknown) {
    // surfaced as a field error so the form shows it inline instead of a generic toast
    const message = err instanceof Error ? err.message : "Could not save this content";
    return { error: { _form: [message] }, success: undefined };
  }
}

/** Subjects for one level — scoped, so the picker stops shipping every subject to the client. */
export async function getSubjectsForLevelAction(levelId: number) {
  if (!(await requireUser())) return [];
  return db.select({ id: subjects.id, displayName: subjects.displayName, slug: subjects.slug })
    .from(subjects).where(eq(subjects.levelId, levelId)).orderBy(subjects.sortOrder, subjects.displayName);
}

/** Topics for one subject — same reason. */
export async function getTopicsForSubjectAction(subjectId: number) {
  if (!(await requireUser())) return [];
  return db.select({ id: topics.id, displayName: topics.displayName, slug: topics.slug, metadata: topics.metadata })
    .from(topics).where(eq(topics.subjectId, subjectId)).orderBy(topics.sortOrder, topics.displayName);
}
