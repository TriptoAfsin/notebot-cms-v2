"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as subjectService from "@/services/subjects.service";
import { invalidateSubjectsCache } from "@/services/cache";

const subjectSchema = z.object({
  levelId: z.coerce.number().int(),
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  slug: z.string().min(1).max(50),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createSubjectAction(formData: FormData) {
  const parsed = subjectSchema.safeParse({
    levelId: formData.get("levelId"),
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await subjectService.createSubject(parsed.data);
  await invalidateSubjectsCache(parsed.data.levelId);
  revalidatePath("/subjects");
  return { success: true };
}

export async function updateSubjectAction(id: number, formData: FormData) {
  const parsed = subjectSchema.safeParse({
    levelId: formData.get("levelId"),
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await subjectService.updateSubject(id, parsed.data);
  await invalidateSubjectsCache(parsed.data.levelId);
  revalidatePath("/subjects");
  return { success: true };
}

export async function deleteSubjectAction(id: number, levelId: number) {
  await subjectService.deleteSubject(id);
  await invalidateSubjectsCache(levelId);
  revalidatePath("/subjects");
  return { success: true };
}

export async function getSubjectsAction(levelId?: number) {
  return subjectService.getSubjects(levelId);
}

export async function getSubjectByIdAction(id: number) {
  return subjectService.getSubjectById(id);
}
