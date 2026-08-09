"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as topicService from "@/services/topics.service";
import { invalidateTopicsCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";

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

  await topicService.createTopic(parsed.data);
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

  // moving a topic to another subject must also bust the subject it left
  const before = await topicService.getTopicById(id);

  await topicService.updateTopic(id, parsed.data);
  await invalidateTopicsCache(parsed.data.subjectId);
  if (before && before.subjectId !== parsed.data.subjectId) {
    await invalidateTopicsCache(before.subjectId);
  }
  revalidatePath("/topics");
  return { success: true };
}

export async function deleteTopicAction(id: number, subjectId: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  await topicService.deleteTopic(id);
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
