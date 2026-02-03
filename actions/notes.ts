"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as noteService from "@/services/notes";
import { invalidateNotesCache } from "@/services/cache";

const noteSchema = z.object({
  topicId: z.coerce.number().int(),
  title: z.string().min(1).max(500),
  url: z.string().url().max(1000),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional().transform(val => {
    if (!val || val.trim() === '') return undefined;
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
  }),
});

export async function createNoteAction(formData: FormData) {
  const parsed = noteSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await noteService.createNote(parsed.data);
  await invalidateNotesCache(parsed.data.topicId);
  revalidatePath("/notes");
  return { success: true };
}

export async function updateNoteAction(id: number, formData: FormData) {
  const parsed = noteSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
    metadata: formData.get("metadata"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await noteService.updateNote(id, parsed.data);
  await invalidateNotesCache(parsed.data.topicId);
  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNoteAction(id: number, topicId: number) {
  await noteService.deleteNote(id);
  await invalidateNotesCache(topicId);
  revalidatePath("/notes");
  return { success: true };
}
