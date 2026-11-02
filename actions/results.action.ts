// Server functions for results.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/results.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/results.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createResultAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/results.action");
    return impl.createResultAction(...(unpackArgs(data) as Parameters<typeof Impl.createResultAction>));
  });
export const createResultAction = (...args: Parameters<typeof Impl.createResultAction>) =>
  createResultAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createResultAction>;

const updateResultAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/results.action");
    return impl.updateResultAction(...(unpackArgs(data) as Parameters<typeof Impl.updateResultAction>));
  });
export const updateResultAction = (...args: Parameters<typeof Impl.updateResultAction>) =>
  updateResultAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateResultAction>;

const deleteResultAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/results.action");
    return impl.deleteResultAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteResultAction>));
  });
export const deleteResultAction = (...args: Parameters<typeof Impl.deleteResultAction>) =>
  deleteResultAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteResultAction>;

const getResultsAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/results.action");
    return impl.getResultsAction(...(unpackArgs(data) as Parameters<typeof Impl.getResultsAction>));
  });
export const getResultsAction = (...args: Parameters<typeof Impl.getResultsAction>) =>
  getResultsAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getResultsAction>;

const getResultByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/results.action");
    return impl.getResultByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getResultByIdAction>));
  });
export const getResultByIdAction = (...args: Parameters<typeof Impl.getResultByIdAction>) =>
  getResultByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getResultByIdAction>;
