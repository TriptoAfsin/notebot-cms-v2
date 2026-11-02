// Server functions for preview.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/preview.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/preview.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

export type { PreviewContext } from "./_impl/preview.action";

const getSubjectContextAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/preview.action");
    return impl.getSubjectContextAction(...(unpackArgs(data) as Parameters<typeof Impl.getSubjectContextAction>));
  });
export const getSubjectContextAction = (...args: Parameters<typeof Impl.getSubjectContextAction>) =>
  getSubjectContextAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSubjectContextAction>;

const getTopicContextAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/preview.action");
    return impl.getTopicContextAction(...(unpackArgs(data) as Parameters<typeof Impl.getTopicContextAction>));
  });
export const getTopicContextAction = (...args: Parameters<typeof Impl.getTopicContextAction>) =>
  getTopicContextAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getTopicContextAction>;
