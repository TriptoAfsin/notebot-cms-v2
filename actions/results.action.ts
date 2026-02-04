"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as resultService from "@/services/results.service";
import { invalidateResultsCache } from "@/services/cache";

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

  await resultService.createResult(parsed.data);
  await invalidateResultsCache();
  revalidatePath("/results");
  return { success: true };
}

export async function updateResultAction(id: number, formData: FormData) {
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

  await resultService.updateResult(id, parsed.data);
  await invalidateResultsCache();
  revalidatePath("/results");
  return { success: true };
}

export async function deleteResultAction(id: number) {
  await resultService.deleteResult(id);
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
