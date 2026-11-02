// Server functions for notes.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/notes.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/notes.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createNoteAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/notes.action");
    return impl.createNoteAction(...(unpackArgs(data) as Parameters<typeof Impl.createNoteAction>));
  });
export const createNoteAction = (...args: Parameters<typeof Impl.createNoteAction>) =>
  createNoteAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createNoteAction>;

const updateNoteAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/notes.action");
    return impl.updateNoteAction(...(unpackArgs(data) as Parameters<typeof Impl.updateNoteAction>));
  });
export const updateNoteAction = (...args: Parameters<typeof Impl.updateNoteAction>) =>
  updateNoteAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateNoteAction>;

const deleteNoteAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/notes.action");
    return impl.deleteNoteAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteNoteAction>));
  });
export const deleteNoteAction = (...args: Parameters<typeof Impl.deleteNoteAction>) =>
  deleteNoteAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteNoteAction>;

const getNotesAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/notes.action");
    return impl.getNotesAction(...(unpackArgs(data) as Parameters<typeof Impl.getNotesAction>));
  });
export const getNotesAction = (...args: Parameters<typeof Impl.getNotesAction>) =>
  getNotesAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getNotesAction>;

const getNoteByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/notes.action");
    return impl.getNoteByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getNoteByIdAction>));
  });
export const getNoteByIdAction = (...args: Parameters<typeof Impl.getNoteByIdAction>) =>
  getNoteByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getNoteByIdAction>;
