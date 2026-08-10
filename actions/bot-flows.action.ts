"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { botFlows } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { invalidateBotFlowsCache } from "@/services/cache";
import { validateBlocks } from "@/lib/block-limits";

/**
 * The bot's bespoke flows.
 *
 * These are the replies for payloads that are not rows in the content tables — usage instructions,
 * donation details, top-level menus, partner cards. Everything addressable (topics, subjects,
 * levels, labs, routines, question banks, syllabuses) is resolved live by the engine and must be
 * edited through those tables instead, so nothing here duplicates content.
 *
 * `blocks` is an array of Messenger message objects sent in order. It is edited as JSON because
 * that is genuinely what it is: arbitrary Send API payloads whose shape Meta defines.
 */

const PAGE_SIZE = 20;

export async function getBotFlowsAction(filter: { q?: string; kind?: string; page?: number } = {}) {
  if (!(await requireUser())) return { rows: [], total: 0, page: 1, pageSize: PAGE_SIZE, kinds: [] };

  const page = Math.max(1, filter.page ?? 1);
  const where = and(
    filter.kind ? eq(botFlows.kind, filter.kind) : undefined,
    filter.q
      ? or(ilike(botFlows.payload, `%${filter.q}%`), ilike(botFlows.label, `%${filter.q}%`))
      : undefined
  );

  const [rows, total, kinds] = await Promise.all([
    db.select().from(botFlows).where(where)
      .orderBy(asc(botFlows.kind), asc(botFlows.payload))
      .limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(botFlows).where(where),
    db.select({ kind: botFlows.kind, n: count() }).from(botFlows).groupBy(botFlows.kind).orderBy(asc(botFlows.kind)),
  ]);

  return {
    rows: rows.map((r) => ({ ...r, blockCount: Array.isArray(r.blocks) ? r.blocks.length : 0 })),
    total: Number(total[0]?.n ?? 0),
    page,
    pageSize: PAGE_SIZE,
    kinds: kinds.map((k) => ({ kind: k.kind, count: Number(k.n) })),
  };
}

export async function getBotFlowAction(id: number) {
  if (!(await requireUser())) return null;
  const [row] = await db.select().from(botFlows).where(eq(botFlows.id, id));
  return row ?? null;
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  label: z.string().trim().max(200).optional(),
  kind: z.string().trim().max(40).min(1),
  enabled: z.boolean(),
  blocks: z.string().min(2),
});

export async function updateBotFlowAction(formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    label: formData.get("label") ?? undefined,
    kind: formData.get("kind"),
    enabled: formData.get("enabled") === "on" || formData.get("enabled") === "true",
    blocks: formData.get("blocks"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors, success: undefined };

  let blocks: unknown;
  try {
    blocks = JSON.parse(parsed.data.blocks);
  } catch (err) {
    return { error: { blocks: [`Not valid JSON: ${(err as Error).message}`] }, success: undefined };
  }

  // Refuse to save something Meta would mangle. Truncation is silent at send time, so this is the
  // only place it can be caught while the author is still looking at it.
  const issues = validateBlocks(blocks);
  if (issues.length) {
    return {
      error: { blocks: issues.map((i) => `${i.path}: ${i.problem}`) },
      success: undefined,
    };
  }

  const [before] = await db.select().from(botFlows).where(eq(botFlows.id, parsed.data.id));
  if (!before) return { error: { _form: ["That flow no longer exists"] }, success: undefined };

  const [after] = await db.update(botFlows).set({
    label: parsed.data.label || null,
    kind: parsed.data.kind,
    enabled: parsed.data.enabled,
    blocks: blocks as Record<string, unknown>[],
    updatedAt: new Date(),
  }).where(eq(botFlows.id, parsed.data.id)).returning();

  await logAudit({
    action: "update", entityType: "bot_flow", entityId: after.id, entityLabel: after.payload,
    before: { kind: before.kind, enabled: before.enabled, blocks: before.blocks },
    after: { kind: after.kind, enabled: after.enabled, blocks: after.blocks },
  });

  // The engine caches this list; without busting it the edit waits out the TTL.
  await invalidateBotFlowsCache();
  revalidatePath("/bot-flows");
  return { success: true };
}

export async function toggleBotFlowAction(id: number, enabled: boolean) {
  if (!(await requireUser())) return UNAUTHORIZED;

  const [after] = await db.update(botFlows)
    .set({ enabled, updatedAt: new Date() })
    .where(eq(botFlows.id, id)).returning();
  if (!after) return { error: { _form: ["That flow no longer exists"] }, success: undefined };

  await logAudit({
    action: "update", entityType: "bot_flow", entityId: id, entityLabel: after.payload,
    before: { enabled: !enabled }, after: { enabled },
  });
  await invalidateBotFlowsCache();
  revalidatePath("/bot-flows");
  return { success: true };
}

/** Which payloads the engine could serve from the content tables instead — i.e. safe to retire. */
export async function getRetirableFlowsAction() {
  if (!(await requireUser())) return [];
  // A bespoke flow whose payload also matches a topic or subject slug is redundant: the engine
  // consults bot_flows first, so that row is shadowing live content.
  const { rows } = await db.execute<{ payload: string; kind: string; matched: string }>(sql`
    SELECT f.payload, f.kind,
           COALESCE(
             (SELECT 'topic: ' || t.slug FROM topics t
               WHERE lower(t.slug) = f.payload
                  OR lower(t.metadata->>'v1RouteSlug') = f.payload LIMIT 1),
             (SELECT 'subject: ' || s.slug FROM subjects s
               WHERE lower(s.slug) = regexp_replace(f.payload, '_flow$', '')
                  OR lower(s.metadata->>'v1RouteSlug') = regexp_replace(f.payload, '_flow$', '') LIMIT 1)
           ) AS matched
      FROM bot_flows f
     WHERE f.enabled = true
     ORDER BY f.payload
  `);
  return rows.filter((r) => r.matched);
}
