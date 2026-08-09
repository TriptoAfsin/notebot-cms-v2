"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as routineService from "@/services/routines.service";
import { invalidateRoutinesCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

const routineSchema = z.object({
  levelId: z.coerce.number().int(),
  term: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  title: z.string().min(1).max(500),
  url: z.string().url().max(1000),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createRoutineAction(formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = routineSchema.safeParse({
    levelId: formData.get("levelId"),
    term: formData.get("term") || undefined,
    department: formData.get("department") || undefined,
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const created = await routineService.createRoutine(parsed.data);

  await logAudit({ action: "create", entityType: "routine", entityId: created?.id, entityLabel: created?.title, after: auditable(created) });
  await invalidateRoutinesCache();
  revalidatePath("/routines");
  return { success: true };
}

export async function updateRoutineAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = routineSchema.safeParse({
    levelId: formData.get("levelId"),
    term: formData.get("term") || undefined,
    department: formData.get("department") || undefined,
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const prev = await routineService.getRoutineById(id);

  const updated = await routineService.updateRoutine(id, parsed.data);

  await logAudit({ action: "update", entityType: "routine", entityId: id, entityLabel: updated?.title ?? prev?.title, before: auditable(prev), after: auditable(updated) });
  await invalidateRoutinesCache();
  revalidatePath("/routines");
  return { success: true };
}

export async function deleteRoutineAction(id: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await routineService.getRoutineById(id);
  await routineService.deleteRoutine(id);
  await logAudit({ action: "delete", entityType: "routine", entityId: id, entityLabel: removed?.title, before: auditable(removed) });
  await invalidateRoutinesCache();
  revalidatePath("/routines");
  return { success: true };
}

export async function getRoutinesAction() {
  return routineService.getRoutines();
}

export async function getRoutineByIdAction(id: number) {
  return routineService.getRoutineById(id);
}
