// Server functions for app-settings.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/app-settings.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/app-settings.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getSubmissionConfig__server = createServerFn({ method: "GET" })
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/app-settings.action");
    return impl.getSubmissionConfig(...(unpackArgs(data) as Parameters<typeof Impl.getSubmissionConfig>));
  });
export const getSubmissionConfig = (...args: Parameters<typeof Impl.getSubmissionConfig>) =>
  getSubmissionConfig__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSubmissionConfig>;

const updateSubmissionConfig__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/app-settings.action");
    return impl.updateSubmissionConfig(...(unpackArgs(data) as Parameters<typeof Impl.updateSubmissionConfig>));
  });
export const updateSubmissionConfig = (...args: Parameters<typeof Impl.updateSubmissionConfig>) =>
  updateSubmissionConfig__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateSubmissionConfig>;
