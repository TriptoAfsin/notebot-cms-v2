// Server functions for setup.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/setup.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/setup.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const checkSuperAdminExists__server = createServerFn({ method: "GET" })
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/setup.action");
    return impl.checkSuperAdminExists(...(unpackArgs(data) as Parameters<typeof Impl.checkSuperAdminExists>));
  });
export const checkSuperAdminExists = (...args: Parameters<typeof Impl.checkSuperAdminExists>) =>
  checkSuperAdminExists__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.checkSuperAdminExists>;

const createSuperAdmin__server = createServerFn({ method: "POST" })
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/setup.action");
    return impl.createSuperAdmin(...(unpackArgs(data) as Parameters<typeof Impl.createSuperAdmin>));
  });
export const createSuperAdmin = (...args: Parameters<typeof Impl.createSuperAdmin>) =>
  createSuperAdmin__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createSuperAdmin>;
