"use server";

import { requireUser, UNAUTHORIZED } from "@/lib/session";

/**
 * Flushes the v2 engine's Redis cache.
 *
 * The CMS's own writes already invalidate the exact keys the engine reads, so this is for the
 * cases they cannot cover: content written by a script, a migration or a direct SQL edit, which
 * otherwise stays stale for up to the engine's 1 h TTL.
 *
 * It reaches the SERVER cache only. notebot-web-v2 persists its React Query cache to
 * localStorage for 24 h with refetchOnMount disabled, so returning visitors keep their copy
 * regardless — that layer is cleared by bumping CACHE_VERSION in that app.
 */

export type CacheScope =
  | "all" | "level" | "subject" | "topic" | "labs" | "syllabus" | "routines" | "results";

export async function flushEngineCacheAction(scope: CacheScope, id?: number) {
  if (!(await requireUser())) return UNAUTHORIZED;

  const base = process.env.ENGINE_ADMIN_URL;
  const key = process.env.ENGINE_ADMIN_API_KEY;
  if (!base || !key) {
    return { error: "ENGINE_ADMIN_URL / ENGINE_ADMIN_API_KEY are not configured", success: undefined };
  }

  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/admin/cache/flush`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify({ scope, id }),
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      // surface the engine's own message — 401 means the two keys have drifted apart,
      // 503 means ADMIN_API_KEY is unset on the engine
      return { error: body?.error || `Engine returned ${res.status}`, success: undefined };
    }
    return { success: true, cleared: (body?.cleared as string[]) ?? [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Could not reach the engine";
    return { error: message, success: undefined };
  }
}
