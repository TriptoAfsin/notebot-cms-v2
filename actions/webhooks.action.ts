// Server functions for webhooks.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/webhooks.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/webhooks.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getWebhooksAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/webhooks.action");
    return impl.getWebhooksAction(...(unpackArgs(data) as Parameters<typeof Impl.getWebhooksAction>));
  });
export const getWebhooksAction = (...args: Parameters<typeof Impl.getWebhooksAction>) =>
  getWebhooksAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getWebhooksAction>;

const getDeliveriesAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/webhooks.action");
    return impl.getDeliveriesAction(...(unpackArgs(data) as Parameters<typeof Impl.getDeliveriesAction>));
  });
export const getDeliveriesAction = (...args: Parameters<typeof Impl.getDeliveriesAction>) =>
  getDeliveriesAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getDeliveriesAction>;

const createWebhookAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/webhooks.action");
    return impl.createWebhookAction(...(unpackArgs(data) as Parameters<typeof Impl.createWebhookAction>));
  });
export const createWebhookAction = (...args: Parameters<typeof Impl.createWebhookAction>) =>
  createWebhookAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createWebhookAction>;

const toggleWebhookAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/webhooks.action");
    return impl.toggleWebhookAction(...(unpackArgs(data) as Parameters<typeof Impl.toggleWebhookAction>));
  });
export const toggleWebhookAction = (...args: Parameters<typeof Impl.toggleWebhookAction>) =>
  toggleWebhookAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.toggleWebhookAction>;

const deleteWebhookAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/webhooks.action");
    return impl.deleteWebhookAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteWebhookAction>));
  });
export const deleteWebhookAction = (...args: Parameters<typeof Impl.deleteWebhookAction>) =>
  deleteWebhookAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteWebhookAction>;

const testWebhookAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/webhooks.action");
    return impl.testWebhookAction(...(unpackArgs(data) as Parameters<typeof Impl.testWebhookAction>));
  });
export const testWebhookAction = (...args: Parameters<typeof Impl.testWebhookAction>) =>
  testWebhookAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.testWebhookAction>;
