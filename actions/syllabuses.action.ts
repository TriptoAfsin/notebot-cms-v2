"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as syllabusService from "@/services/syllabuses.service";
import { invalidateSyllabusCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

const syllabusSchema = z.object({
  batch: z.string().min(1).max(20),
  // this is the url slug the bot routes on (/app/syllabus/45/ae) — keep it slug-safe
  department: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/, "Lowercase letters, numbers, - and _ only"),
  departmentName: z.string().min(1).max(100),
  departmentSort: z.coerce.number().int().default(0),
  topic: z.string().min(1).max(200),
  url: z.string().url().max(1000),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

const readForm = (formData: FormData) => ({
  batch: formData.get("batch"),
  department: String(formData.get("department") ?? "").toLowerCase(),
  departmentName: formData.get("departmentName"),
  departmentSort: formData.get("departmentSort"),
  topic: formData.get("topic"),
  url: formData.get("url"),
  sortOrder: formData.get("sortOrder"),
  metadata: formData.get("metadata"),
});

export async function createSyllabusAction(formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = syllabusSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const created = await syllabusService.createSyllabus(parsed.data);

  await logAudit({ action: "create", entityType: "syllabus", entityId: created?.id, entityLabel: created?.topic, after: auditable(created) });
  await invalidateSyllabusCache();
  revalidatePath("/syllabuses");
  return { success: true };
}

export async function updateSyllabusAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = syllabusSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const prev = await syllabusService.getSyllabusById(id);

  const updated = await syllabusService.updateSyllabus(id, parsed.data);

  await logAudit({ action: "update", entityType: "syllabus", entityId: id, entityLabel: updated?.topic ?? prev?.topic, before: auditable(prev), after: auditable(updated) });
  await invalidateSyllabusCache();
  revalidatePath("/syllabuses");
  return { success: true };
}

export async function deleteSyllabusAction(id: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await syllabusService.getSyllabusById(id);
  await syllabusService.deleteSyllabus(id);
  await logAudit({ action: "delete", entityType: "syllabus", entityId: id, entityLabel: removed?.topic, before: auditable(removed) });
  await invalidateSyllabusCache();
  revalidatePath("/syllabuses");
  return { success: true };
}

export async function getSyllabusesAction(batch?: string) {
  return syllabusService.getSyllabuses(batch);
}

export async function getSyllabusBatchesAction() {
  return syllabusService.getSyllabusBatches();
}

export async function getSyllabusByIdAction(id: number) {
  return syllabusService.getSyllabusById(id);
}
