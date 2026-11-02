// Server functions for dashboard.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/dashboard.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/dashboard.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getDashboardDataAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/dashboard.action");
    return impl.getDashboardDataAction(...(unpackArgs(data) as Parameters<typeof Impl.getDashboardDataAction>));
  });
export const getDashboardDataAction = (...args: Parameters<typeof Impl.getDashboardDataAction>) =>
  getDashboardDataAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getDashboardDataAction>;
