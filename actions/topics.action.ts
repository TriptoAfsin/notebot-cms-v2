"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as topicService from "@/services/topics.service";
import { invalidateTopicsCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { logAudit, auditable } from "@/lib/audit";

const topicSchema = z.object({
  subjectId: z.coerce.number().int(),
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createTopicAction(formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = topicSchema.safeParse({
    subjectId: formData.get("subjectId"),
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const created = await topicService.createTopic(parsed.data);

  await logAudit({ action: "create", entityType: "topic", entityId: created?.id, entityLabel: created?.displayName, after: auditable(created) });
  await invalidateTopicsCache(parsed.data.subjectId);
  revalidatePath("/topics");
  return { success: true };
}

export async function updateTopicAction(id: number, formData: FormData) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const parsed = topicSchema.safeParse({
    subjectId: formData.get("subjectId"),
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // one read serves both purposes: the audit "before" snapshot, and detecting a move so the
  // subject the topic left also gets its cache busted
  const before = await topicService.getTopicById(id);

  const updated = await topicService.updateTopic(id, parsed.data);

  await logAudit({ action: "update", entityType: "topic", entityId: id, entityLabel: updated?.displayName ?? before?.displayName, before: auditable(before), after: auditable(updated) });
  await invalidateTopicsCache(parsed.data.subjectId);
  if (before && before.subjectId !== parsed.data.subjectId) {
    await invalidateTopicsCache(before.subjectId);
  }
  revalidatePath("/topics");
  return { success: true };
}

export async function deleteTopicAction(id: number, subjectId: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const removed = await topicService.getTopicById(id);
  await topicService.deleteTopic(id);
  await logAudit({ action: "delete", entityType: "topic", entityId: id, entityLabel: removed?.displayName, before: auditable(removed) });
  await invalidateTopicsCache(subjectId);
  revalidatePath("/topics");
  return { success: true };
}

export async function getTopicsAction(subjectId?: number) {
  return topicService.getTopics(subjectId);
}

export async function getTopicByIdAction(id: number) {
  return topicService.getTopicById(id);
}
