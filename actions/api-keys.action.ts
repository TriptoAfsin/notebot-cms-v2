// Server functions for api-keys.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/api-keys.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/api-keys.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getApiKeysAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/api-keys.action");
    return impl.getApiKeysAction(...(unpackArgs(data) as Parameters<typeof Impl.getApiKeysAction>));
  });
export const getApiKeysAction = (...args: Parameters<typeof Impl.getApiKeysAction>) =>
  getApiKeysAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getApiKeysAction>;

const createApiKeyAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/api-keys.action");
    return impl.createApiKeyAction(...(unpackArgs(data) as Parameters<typeof Impl.createApiKeyAction>));
  });
export const createApiKeyAction = (...args: Parameters<typeof Impl.createApiKeyAction>) =>
  createApiKeyAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createApiKeyAction>;

const revokeApiKeyAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/api-keys.action");
    return impl.revokeApiKeyAction(...(unpackArgs(data) as Parameters<typeof Impl.revokeApiKeyAction>));
  });
export const revokeApiKeyAction = (...args: Parameters<typeof Impl.revokeApiKeyAction>) =>
  revokeApiKeyAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.revokeApiKeyAction>;
