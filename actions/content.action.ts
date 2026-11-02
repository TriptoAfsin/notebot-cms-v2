// Server functions for content.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/content.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/content.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createContentAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/content.action");
    return impl.createContentAction(...(unpackArgs(data) as Parameters<typeof Impl.createContentAction>));
  });
export const createContentAction = (...args: Parameters<typeof Impl.createContentAction>) =>
  createContentAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createContentAction>;

const getSubjectsForLevelAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/content.action");
    return impl.getSubjectsForLevelAction(...(unpackArgs(data) as Parameters<typeof Impl.getSubjectsForLevelAction>));
  });
export const getSubjectsForLevelAction = (...args: Parameters<typeof Impl.getSubjectsForLevelAction>) =>
  getSubjectsForLevelAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSubjectsForLevelAction>;

const getTopicsForSubjectAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/content.action");
    return impl.getTopicsForSubjectAction(...(unpackArgs(data) as Parameters<typeof Impl.getTopicsForSubjectAction>));
  });
export const getTopicsForSubjectAction = (...args: Parameters<typeof Impl.getTopicsForSubjectAction>) =>
  getTopicsForSubjectAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getTopicsForSubjectAction>;
