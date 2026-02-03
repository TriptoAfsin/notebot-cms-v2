"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as topicService from "@/services/topics";
import { invalidateTopicsCache } from "@/services/cache";

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

  await topicService.updateTopic(id, parsed.data);
  await invalidateTopicsCache(parsed.data.subjectId);
  revalidatePath("/topics");
  return { success: true };
}

export async function deleteTopicAction(id: number, subjectId: number) {
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
