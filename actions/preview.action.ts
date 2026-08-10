"use server";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { levels, subjects, topics } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";

/**
 * Resolves the ancestry a preview needs.
 *
 * The Messenger/API preview has to know the level and subject slugs to build the route a button
 * navigates to, but the notes and topics forms only hold a parent id. Rather than shipping the
 * whole tree to the client to look it up, each form asks for the one chain it needs.
 */

export type PreviewContext = {
  levelSlug: string;
  subjectSlug: string;
  subjectDisplay: string;
  topicSlug?: string;
  topicDisplay?: string;
};

/** For the topics forms: a topic's parent subject and its level. */
export async function getSubjectContextAction(subjectId: number): Promise<PreviewContext | null> {
  if (!(await requireUser())) return null;
  const [row] = await db
    .select({
      subjectSlug: subjects.slug,
      subjectDisplay: subjects.displayName,
      levelSlug: levels.slug,
    })
    .from(subjects)
    .innerJoin(levels, eq(levels.id, subjects.levelId))
    .where(eq(subjects.id, subjectId));
  return row ?? null;
}

/** For the notes forms: a note's topic, its subject and its level. */
export async function getTopicContextAction(topicId: number): Promise<PreviewContext | null> {
  if (!(await requireUser())) return null;
  const [row] = await db
    .select({
      topicSlug: topics.slug,
      topicDisplay: topics.displayName,
      subjectSlug: subjects.slug,
      subjectDisplay: subjects.displayName,
      levelSlug: levels.slug,
    })
    .from(topics)
    .innerJoin(subjects, eq(subjects.id, topics.subjectId))
    .innerJoin(levels, eq(levels.id, subjects.levelId))
    .where(eq(topics.id, topicId));
  return row ?? null;
}
