import { headers } from "next/headers";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

/**
 * Records a content mutation.
 *
 * Never throws: an audit failure must not roll back or fail the write the editor just made.
 * A dropped log line is bad; losing the user's content because logging broke is worse.
 */
export type AuditAction = "create" | "update" | "delete";

type Row = Record<string, unknown> | null | undefined;

export async function logAudit(input: {
  action: AuditAction;
  entityType: string;
  entityId?: number | null;
  entityLabel?: string | null;
  before?: Row;
  after?: Row;
}) {
  try {
    const session = await getSession();
    const h = await headers();

    // behind a proxy the first x-forwarded-for entry is the client
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null;

    await db.insert(auditLogs).values({
      actorId: session?.user?.id ?? null,
      actorEmail: session?.user?.email ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityLabel: input.entityLabel?.slice(0, 500) ?? null,
      before: (input.before as Record<string, unknown>) ?? null,
      after: (input.after as Record<string, unknown>) ?? null,
      ip: ip?.slice(0, 64) ?? null,
      userAgent: h.get("user-agent")?.slice(0, 500) ?? null,
    });
  } catch (err) {
    console.error("[audit] failed to record", input.entityType, input.action, err);
  }
}

/** Trims the noisy columns so a diff shows the fields a human cares about. */
const NOISE = new Set(["createdAt", "updatedAt"]);
export function auditable<T extends Record<string, unknown>>(row: T | null | undefined) {
  if (!row) return null;
  return Object.fromEntries(
    Object.entries(row).filter(([k]) => !NOISE.has(k))
  ) as Record<string, unknown>;
}
