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
