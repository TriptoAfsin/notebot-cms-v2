"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as routineService from "@/services/routines.service";
import { invalidateRoutinesCache } from "@/services/cache";

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

  await routineService.createRoutine(parsed.data);
  await invalidateRoutinesCache();
  revalidatePath("/routines");
  return { success: true };
}

export async function updateRoutineAction(id: number, formData: FormData) {
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

  await routineService.updateRoutine(id, parsed.data);
  await invalidateRoutinesCache();
  revalidatePath("/routines");
  return { success: true };
}

export async function deleteRoutineAction(id: number) {
  await routineService.deleteRoutine(id);
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
