// Server functions for syllabuses.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/syllabuses.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/syllabuses.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createSyllabusAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/syllabuses.action");
    return impl.createSyllabusAction(...(unpackArgs(data) as Parameters<typeof Impl.createSyllabusAction>));
  });
export const createSyllabusAction = (...args: Parameters<typeof Impl.createSyllabusAction>) =>
  createSyllabusAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createSyllabusAction>;

const updateSyllabusAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/syllabuses.action");
    return impl.updateSyllabusAction(...(unpackArgs(data) as Parameters<typeof Impl.updateSyllabusAction>));
  });
export const updateSyllabusAction = (...args: Parameters<typeof Impl.updateSyllabusAction>) =>
  updateSyllabusAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateSyllabusAction>;

const deleteSyllabusAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/syllabuses.action");
    return impl.deleteSyllabusAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteSyllabusAction>));
  });
export const deleteSyllabusAction = (...args: Parameters<typeof Impl.deleteSyllabusAction>) =>
  deleteSyllabusAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteSyllabusAction>;

const getSyllabusesAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/syllabuses.action");
    return impl.getSyllabusesAction(...(unpackArgs(data) as Parameters<typeof Impl.getSyllabusesAction>));
  });
export const getSyllabusesAction = (...args: Parameters<typeof Impl.getSyllabusesAction>) =>
  getSyllabusesAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSyllabusesAction>;

const getSyllabusBatchesAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/syllabuses.action");
    return impl.getSyllabusBatchesAction(...(unpackArgs(data) as Parameters<typeof Impl.getSyllabusBatchesAction>));
  });
export const getSyllabusBatchesAction = (...args: Parameters<typeof Impl.getSyllabusBatchesAction>) =>
  getSyllabusBatchesAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSyllabusBatchesAction>;

const getSyllabusByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/syllabuses.action");
    return impl.getSyllabusByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getSyllabusByIdAction>));
  });
export const getSyllabusByIdAction = (...args: Parameters<typeof Impl.getSyllabusByIdAction>) =>
  getSyllabusByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSyllabusByIdAction>;
