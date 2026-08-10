import { invalidateCache, invalidateCachePattern } from "@/lib/redis";

export async function invalidateLevelsCache() {
  await invalidateCache("levels");
}

export async function invalidateSubjectsCache(levelId: number) {
  await invalidateCache(`subjects:${levelId}`);
}

export async function invalidateTopicsCache(subjectId: number) {
  await invalidateCache(`topics:${subjectId}`);
}

export async function invalidateNotesCache(topicId: number) {
  await invalidateCache(`notes:${topicId}`);
}

export async function invalidateLabsCache(levelId: number) {
  await invalidateCachePattern(`labs:${levelId}*`);
}

export async function invalidateRoutinesCache() {
  await invalidateCache("routines");
}

export async function invalidateResultsCache() {
  await invalidateCache("results");
}

export async function invalidateQBsCache(levelId: number) {
  await invalidateCache(`qbs:${levelId}`);
}

// the engine caches syllabus:batches, syllabus:depts:<batch> and syllabus:topics:<batch>:<dept>
// — a single edit can change the batch list, the dept list and a topic list, so clear them all
export async function invalidateSyllabusCache() {
  await invalidateCachePattern("syllabus:*");
}

/**
 * The bot's bespoke flows.
 *
 * The engine keeps this list in Redis *and* in a short-lived in-process memo, because every postback
 * consults it — see `bot-flow.service.ts`. Clearing Redis is enough for correctness; the memo
 * expires within a minute, so an edit shows up in the bot almost immediately rather than after the
 * hour-long TTL.
 */
export async function invalidateBotFlowsCache() {
  await invalidateCache("botflows:all");
}
