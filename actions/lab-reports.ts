"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as labReportService from "@/services/labReports";
import { invalidateLabsCache } from "@/services/cache";

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

  await labReportService.createLabReport(parsed.data);
  await invalidateLabsCache(parsed.data.levelId);
  revalidatePath("/lab-reports");
  return { success: true };
}

export async function updateLabReportAction(id: number, formData: FormData) {
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

  await labReportService.updateLabReport(id, parsed.data);
  await invalidateLabsCache(parsed.data.levelId);
  revalidatePath("/lab-reports");
  return { success: true };
}

export async function deleteLabReportAction(id: number, levelId: number) {
  await labReportService.deleteLabReport(id);
  await invalidateLabsCache(levelId);
  revalidatePath("/lab-reports");
  return { success: true };
}
