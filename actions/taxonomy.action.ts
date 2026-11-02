// Server functions for taxonomy.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/taxonomy.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/taxonomy.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getTaxonomyAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/taxonomy.action");
    return impl.getTaxonomyAction(...(unpackArgs(data) as Parameters<typeof Impl.getTaxonomyAction>));
  });
export const getTaxonomyAction = (...args: Parameters<typeof Impl.getTaxonomyAction>) =>
  getTaxonomyAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getTaxonomyAction>;

const getUsageAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/taxonomy.action");
    return impl.getUsageAction(...(unpackArgs(data) as Parameters<typeof Impl.getUsageAction>));
  });
export const getUsageAction = (...args: Parameters<typeof Impl.getUsageAction>) =>
  getUsageAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getUsageAction>;

const saveTaxonomyAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/taxonomy.action");
    return impl.saveTaxonomyAction(...(unpackArgs(data) as Parameters<typeof Impl.saveTaxonomyAction>));
  });
export const saveTaxonomyAction = (...args: Parameters<typeof Impl.saveTaxonomyAction>) =>
  saveTaxonomyAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.saveTaxonomyAction>;
