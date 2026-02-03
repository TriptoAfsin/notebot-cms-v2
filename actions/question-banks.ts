"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as qbService from "@/services/question-banks";
import { invalidateQBsCache } from "@/services/cache";

const qbSchema = z.object({
  levelId: z.coerce.number().int(),
  subjectSlug: z.string().min(1).max(50),
  title: z.string().min(1).max(500),
  url: z.string().url().max(1000),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createQuestionBankAction(formData: FormData) {
  const parsed = qbSchema.safeParse({
    levelId: formData.get("levelId"),
    subjectSlug: formData.get("subjectSlug"),
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await qbService.createQuestionBank(parsed.data);
  await invalidateQBsCache(parsed.data.levelId);
  revalidatePath("/question-banks");
  return { success: true };
}

export async function updateQuestionBankAction(id: number, formData: FormData) {
  const parsed = qbSchema.safeParse({
    levelId: formData.get("levelId"),
    subjectSlug: formData.get("subjectSlug"),
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await qbService.updateQuestionBank(id, parsed.data);
  await invalidateQBsCache(parsed.data.levelId);
  revalidatePath("/question-banks");
  return { success: true };
}

export async function deleteQuestionBankAction(id: number, levelId: number) {
  await qbService.deleteQuestionBank(id);
  await invalidateQBsCache(levelId);
  revalidatePath("/question-banks");
  return { success: true };
}
