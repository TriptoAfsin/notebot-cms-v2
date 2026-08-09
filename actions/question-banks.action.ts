"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as qbService from "@/services/question-banks.service";
import { invalidateQBsCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

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
  if (!(await requireUser())) return UNAUTHORIZED;
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

  const created = await qbService.createQuestionBank(parsed.data);

  await logAudit({ action: "create", entityType: "question_bank", entityId: created?.id, entityLabel: created?.title, after: auditable(created) });
  await invalidateQBsCache(parsed.data.levelId);
  revalidatePath("/question-banks");
  return { success: true };
}

export async function updateQuestionBankAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
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

  const prev = await qbService.getQuestionBankById(id);

  const updated = await qbService.updateQuestionBank(id, parsed.data);

  await logAudit({ action: "update", entityType: "question_bank", entityId: id, entityLabel: updated?.title ?? prev?.title, before: auditable(prev), after: auditable(updated) });
  await invalidateQBsCache(parsed.data.levelId);
  revalidatePath("/question-banks");
  return { success: true };
}

export async function deleteQuestionBankAction(id: number, levelId: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await qbService.getQuestionBankById(id);
  await qbService.deleteQuestionBank(id);
  await logAudit({ action: "delete", entityType: "question_bank", entityId: id, entityLabel: removed?.title, before: auditable(removed) });
  await invalidateQBsCache(levelId);
  revalidatePath("/question-banks");
  return { success: true };
}

export async function getQuestionBanksAction(levelId?: number) {
  return qbService.getQuestionBanks(levelId);
}

export async function getQuestionBankByIdAction(id: number) {
  return qbService.getQuestionBankById(id);
}
