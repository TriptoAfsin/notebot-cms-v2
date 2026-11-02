// Server functions for subjects.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/subjects.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/subjects.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createSubjectAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/subjects.action");
    return impl.createSubjectAction(...(unpackArgs(data) as Parameters<typeof Impl.createSubjectAction>));
  });
export const createSubjectAction = (...args: Parameters<typeof Impl.createSubjectAction>) =>
  createSubjectAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createSubjectAction>;

const updateSubjectAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/subjects.action");
    return impl.updateSubjectAction(...(unpackArgs(data) as Parameters<typeof Impl.updateSubjectAction>));
  });
export const updateSubjectAction = (...args: Parameters<typeof Impl.updateSubjectAction>) =>
  updateSubjectAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateSubjectAction>;

const deleteSubjectAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/subjects.action");
    return impl.deleteSubjectAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteSubjectAction>));
  });
export const deleteSubjectAction = (...args: Parameters<typeof Impl.deleteSubjectAction>) =>
  deleteSubjectAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteSubjectAction>;

const getSubjectsAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/subjects.action");
    return impl.getSubjectsAction(...(unpackArgs(data) as Parameters<typeof Impl.getSubjectsAction>));
  });
export const getSubjectsAction = (...args: Parameters<typeof Impl.getSubjectsAction>) =>
  getSubjectsAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSubjectsAction>;

const getSubjectByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/subjects.action");
    return impl.getSubjectByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getSubjectByIdAction>));
  });
export const getSubjectByIdAction = (...args: Parameters<typeof Impl.getSubjectByIdAction>) =>
  getSubjectByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSubjectByIdAction>;
