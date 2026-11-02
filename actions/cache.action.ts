// Server functions for cache.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/cache.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/cache.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

export type { CacheScope } from "./_impl/cache.action";

const flushEngineCacheAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/cache.action");
    return impl.flushEngineCacheAction(...(unpackArgs(data) as Parameters<typeof Impl.flushEngineCacheAction>));
  });
export const flushEngineCacheAction = (...args: Parameters<typeof Impl.flushEngineCacheAction>) =>
  flushEngineCacheAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.flushEngineCacheAction>;
