// Server functions for lab-reports.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/lab-reports.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/lab-reports.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createLabReportAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/lab-reports.action");
    return impl.createLabReportAction(...(unpackArgs(data) as Parameters<typeof Impl.createLabReportAction>));
  });
export const createLabReportAction = (...args: Parameters<typeof Impl.createLabReportAction>) =>
  createLabReportAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createLabReportAction>;

const updateLabReportAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/lab-reports.action");
    return impl.updateLabReportAction(...(unpackArgs(data) as Parameters<typeof Impl.updateLabReportAction>));
  });
export const updateLabReportAction = (...args: Parameters<typeof Impl.updateLabReportAction>) =>
  updateLabReportAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateLabReportAction>;

const deleteLabReportAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/lab-reports.action");
    return impl.deleteLabReportAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteLabReportAction>));
  });
export const deleteLabReportAction = (...args: Parameters<typeof Impl.deleteLabReportAction>) =>
  deleteLabReportAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteLabReportAction>;

const getLabReportsAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/lab-reports.action");
    return impl.getLabReportsAction(...(unpackArgs(data) as Parameters<typeof Impl.getLabReportsAction>));
  });
export const getLabReportsAction = (...args: Parameters<typeof Impl.getLabReportsAction>) =>
  getLabReportsAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getLabReportsAction>;

const getLabReportByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/lab-reports.action");
    return impl.getLabReportByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getLabReportByIdAction>));
  });
export const getLabReportByIdAction = (...args: Parameters<typeof Impl.getLabReportByIdAction>) =>
  getLabReportByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getLabReportByIdAction>;
