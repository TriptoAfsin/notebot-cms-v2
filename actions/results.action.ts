"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as resultService from "@/services/results.service";
import { invalidateResultsCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

const resultSchema = z.object({
  title: z.string().min(1).max(500),
  url: z.string().url().max(1000),
  category: z.string().max(100).optional(),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createResultAction(formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = resultSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    category: formData.get("category") || undefined,
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const created = await resultService.createResult(parsed.data);

  await logAudit({ action: "create", entityType: "result", entityId: created?.id, entityLabel: created?.title, after: auditable(created) });
  await invalidateResultsCache();
  revalidatePath("/results");
  return { success: true };
}

export async function updateResultAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = resultSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    category: formData.get("category") || undefined,
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const prev = await resultService.getResultById(id);

  const updated = await resultService.updateResult(id, parsed.data);

  await logAudit({ action: "update", entityType: "result", entityId: id, entityLabel: updated?.title ?? prev?.title, before: auditable(prev), after: auditable(updated) });
  await invalidateResultsCache();
  revalidatePath("/results");
  return { success: true };
}

export async function deleteResultAction(id: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await resultService.getResultById(id);
  await resultService.deleteResult(id);
  await logAudit({ action: "delete", entityType: "result", entityId: id, entityLabel: removed?.title, before: auditable(removed) });
  await invalidateResultsCache();
  revalidatePath("/results");
  return { success: true };
}

export async function getResultsAction() {
  return resultService.getResults();
}

export async function getResultByIdAction(id: number) {
  return resultService.getResultById(id);
}
