"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as levelService from "@/services/levels";
import { invalidateLevelsCache } from "@/services/cache";

const levelSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  slug: z.string().min(1).max(50),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createLevelAction(formData: FormData) {
  const parsed = levelSchema.safeParse({
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await levelService.createLevel(parsed.data);
  await invalidateLevelsCache();
  revalidatePath("/levels");
  return { success: true };
}

export async function updateLevelAction(id: number, formData: FormData) {
  const parsed = levelSchema.safeParse({
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await levelService.updateLevel(id, parsed.data);
  await invalidateLevelsCache();
  revalidatePath("/levels");
  return { success: true };
}

export async function deleteLevelAction(id: number) {
  await levelService.deleteLevel(id);
  await invalidateLevelsCache();
  revalidatePath("/levels");
  return { success: true };
}

export async function getLevelsAction() {
  return levelService.getLevels();
}

export async function getLevelByIdAction(id: number) {
  return levelService.getLevelById(id);
}
