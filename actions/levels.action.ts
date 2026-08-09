"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as levelService from "@/services/levels.service";
import { invalidateLevelsCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

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
  if (!(await requireUser())) return UNAUTHORIZED;
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

  const created = await levelService.createLevel(parsed.data);

  await logAudit({ action: "create", entityType: "level", entityId: created?.id, entityLabel: created?.displayName, after: auditable(created) });
  await invalidateLevelsCache();
  revalidatePath("/levels");
  return { success: true };
}

export async function updateLevelAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
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

  const prev = await levelService.getLevelById(id);

  const updated = await levelService.updateLevel(id, parsed.data);

  await logAudit({ action: "update", entityType: "level", entityId: id, entityLabel: updated?.displayName ?? prev?.displayName, before: auditable(prev), after: auditable(updated) });
  await invalidateLevelsCache();
  revalidatePath("/levels");
  return { success: true };
}

export async function deleteLevelAction(id: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await levelService.getLevelById(id);
  await levelService.deleteLevel(id);
  await logAudit({ action: "delete", entityType: "level", entityId: id, entityLabel: removed?.displayName, before: auditable(removed) });
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
