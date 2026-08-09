"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as noteService from "@/services/notes.service";
import { invalidateNotesCache } from "@/services/cache";
import { requireUser, UNAUTHORIZED } from "@/lib/session";

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
  if (!(await requireUser())) return UNAUTHORIZED;
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
  if (!(await requireUser())) return UNAUTHORIZED;
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

  // moving a note to another topic must also bust the topic it left
  const before = await noteService.getNoteById(id);

  await noteService.updateNote(id, parsed.data);
  await invalidateNotesCache(parsed.data.topicId);
  if (before && before.topicId !== parsed.data.topicId) {
    await invalidateNotesCache(before.topicId);
  }
  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNoteAction(id: number, topicId: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  await noteService.deleteNote(id);
  await invalidateNotesCache(topicId);
  revalidatePath("/notes");
  return { success: true };
}

export async function getNotesAction(topicId?: number) {
  return noteService.getNotes(topicId);
}

export async function getNoteByIdAction(id: number) {
  return noteService.getNoteById(id);
}
