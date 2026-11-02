// Server functions for users.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/users.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/users.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getUsers__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/users.action");
    return impl.getUsers(...(unpackArgs(data) as Parameters<typeof Impl.getUsers>));
  });
export const getUsers = (...args: Parameters<typeof Impl.getUsers>) =>
  getUsers__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getUsers>;

const deleteUser__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/users.action");
    return impl.deleteUser(...(unpackArgs(data) as Parameters<typeof Impl.deleteUser>));
  });
export const deleteUser = (...args: Parameters<typeof Impl.deleteUser>) =>
  deleteUser__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteUser>;
