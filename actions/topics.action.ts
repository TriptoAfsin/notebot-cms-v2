// Server functions for topics.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/topics.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/topics.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createTopicAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/topics.action");
    return impl.createTopicAction(...(unpackArgs(data) as Parameters<typeof Impl.createTopicAction>));
  });
export const createTopicAction = (...args: Parameters<typeof Impl.createTopicAction>) =>
  createTopicAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createTopicAction>;

const updateTopicAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/topics.action");
    return impl.updateTopicAction(...(unpackArgs(data) as Parameters<typeof Impl.updateTopicAction>));
  });
export const updateTopicAction = (...args: Parameters<typeof Impl.updateTopicAction>) =>
  updateTopicAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateTopicAction>;

const deleteTopicAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/topics.action");
    return impl.deleteTopicAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteTopicAction>));
  });
export const deleteTopicAction = (...args: Parameters<typeof Impl.deleteTopicAction>) =>
  deleteTopicAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteTopicAction>;

const getTopicsAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/topics.action");
    return impl.getTopicsAction(...(unpackArgs(data) as Parameters<typeof Impl.getTopicsAction>));
  });
export const getTopicsAction = (...args: Parameters<typeof Impl.getTopicsAction>) =>
  getTopicsAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getTopicsAction>;

const getTopicByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/topics.action");
    return impl.getTopicByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getTopicByIdAction>));
  });
export const getTopicByIdAction = (...args: Parameters<typeof Impl.getTopicByIdAction>) =>
  getTopicByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getTopicByIdAction>;
