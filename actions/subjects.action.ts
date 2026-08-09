"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as subjectService from "@/services/subjects.service";
import { invalidateSubjectsCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

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
  if (!(await requireUser())) return UNAUTHORIZED;
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

  const created = await subjectService.createSubject(parsed.data);

  await logAudit({ action: "create", entityType: "subject", entityId: created?.id, entityLabel: created?.displayName, after: auditable(created) });
  await invalidateSubjectsCache(parsed.data.levelId);
  revalidatePath("/subjects");
  return { success: true };
}

export async function updateSubjectAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
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

  // Read the current level BEFORE the write: moving a subject to another level has to bust the
  // OLD level's cache too, or notebot:subjects:<oldLevelId> serves the subject for up to an hour
  // after it has left.
  const before = await subjectService.getSubjectById(id);

  const updated = await subjectService.updateSubject(id, parsed.data);

  await logAudit({ action: "update", entityType: "subject", entityId: id, entityLabel: updated?.displayName ?? before?.displayName, before: auditable(before), after: auditable(updated) });
  await invalidateSubjectsCache(parsed.data.levelId);
  if (before && before.levelId !== parsed.data.levelId) {
    await invalidateSubjectsCache(before.levelId);
  }
  revalidatePath("/subjects");
  return { success: true };
}

export async function deleteSubjectAction(id: number, levelId: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await subjectService.getSubjectById(id);
  await subjectService.deleteSubject(id);
  await logAudit({ action: "delete", entityType: "subject", entityId: id, entityLabel: removed?.displayName, before: auditable(removed) });
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
