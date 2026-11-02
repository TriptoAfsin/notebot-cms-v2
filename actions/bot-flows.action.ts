// Server functions for bot-flows.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/bot-flows.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/bot-flows.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getBotFlowsAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/bot-flows.action");
    return impl.getBotFlowsAction(...(unpackArgs(data) as Parameters<typeof Impl.getBotFlowsAction>));
  });
export const getBotFlowsAction = (...args: Parameters<typeof Impl.getBotFlowsAction>) =>
  getBotFlowsAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getBotFlowsAction>;

const getBotFlowAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/bot-flows.action");
    return impl.getBotFlowAction(...(unpackArgs(data) as Parameters<typeof Impl.getBotFlowAction>));
  });
export const getBotFlowAction = (...args: Parameters<typeof Impl.getBotFlowAction>) =>
  getBotFlowAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getBotFlowAction>;

const updateBotFlowAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/bot-flows.action");
    return impl.updateBotFlowAction(...(unpackArgs(data) as Parameters<typeof Impl.updateBotFlowAction>));
  });
export const updateBotFlowAction = (...args: Parameters<typeof Impl.updateBotFlowAction>) =>
  updateBotFlowAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateBotFlowAction>;

const toggleBotFlowAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/bot-flows.action");
    return impl.toggleBotFlowAction(...(unpackArgs(data) as Parameters<typeof Impl.toggleBotFlowAction>));
  });
export const toggleBotFlowAction = (...args: Parameters<typeof Impl.toggleBotFlowAction>) =>
  toggleBotFlowAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.toggleBotFlowAction>;

const getRetirableFlowsAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/bot-flows.action");
    return impl.getRetirableFlowsAction(...(unpackArgs(data) as Parameters<typeof Impl.getRetirableFlowsAction>));
  });
export const getRetirableFlowsAction = (...args: Parameters<typeof Impl.getRetirableFlowsAction>) =>
  getRetirableFlowsAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getRetirableFlowsAction>;

const getFlowMapAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/bot-flows.action");
    return impl.getFlowMapAction(...(unpackArgs(data) as Parameters<typeof Impl.getFlowMapAction>));
  });
export const getFlowMapAction = (...args: Parameters<typeof Impl.getFlowMapAction>) =>
  getFlowMapAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getFlowMapAction>;
