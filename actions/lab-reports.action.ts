"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as labReportService from "@/services/lab-reports.service";
import { invalidateLabsCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

const labReportSchema = z.object({
  levelId: z.coerce.number().int(),
  subjectSlug: z.string().min(1).max(50),
  topicName: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  url: z.string().url().max(1000),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createLabReportAction(formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = labReportSchema.safeParse({
    levelId: formData.get("levelId"),
    subjectSlug: formData.get("subjectSlug"),
    topicName: formData.get("topicName"),
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const created = await labReportService.createLabReport(parsed.data);

  await logAudit({ action: "create", entityType: "lab_report", entityId: created?.id, entityLabel: created?.title, after: auditable(created) });
  await invalidateLabsCache(parsed.data.levelId);
  revalidatePath("/lab-reports");
  return { success: true };
}

export async function updateLabReportAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = labReportSchema.safeParse({
    levelId: formData.get("levelId"),
    subjectSlug: formData.get("subjectSlug"),
    topicName: formData.get("topicName"),
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const prev = await labReportService.getLabReportById(id);

  const updated = await labReportService.updateLabReport(id, parsed.data);

  await logAudit({ action: "update", entityType: "lab_report", entityId: id, entityLabel: updated?.title ?? prev?.title, before: auditable(prev), after: auditable(updated) });
  await invalidateLabsCache(parsed.data.levelId);
  revalidatePath("/lab-reports");
  return { success: true };
}

export async function deleteLabReportAction(id: number, levelId: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await labReportService.getLabReportById(id);
  await labReportService.deleteLabReport(id);
  await logAudit({ action: "delete", entityType: "lab_report", entityId: id, entityLabel: removed?.title, before: auditable(removed) });
  await invalidateLabsCache(levelId);
  revalidatePath("/lab-reports");
  return { success: true };
}

export async function getLabReportsAction(levelId?: number) {
  return labReportService.getLabReports(levelId);
}

export async function getLabReportByIdAction(id: number) {
  return labReportService.getLabReportById(id);
}
