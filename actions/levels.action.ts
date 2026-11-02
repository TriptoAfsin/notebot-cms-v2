// Server functions for levels.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/levels.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/levels.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createLevelAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/levels.action");
    return impl.createLevelAction(...(unpackArgs(data) as Parameters<typeof Impl.createLevelAction>));
  });
export const createLevelAction = (...args: Parameters<typeof Impl.createLevelAction>) =>
  createLevelAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createLevelAction>;

const updateLevelAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/levels.action");
    return impl.updateLevelAction(...(unpackArgs(data) as Parameters<typeof Impl.updateLevelAction>));
  });
export const updateLevelAction = (...args: Parameters<typeof Impl.updateLevelAction>) =>
  updateLevelAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateLevelAction>;

const deleteLevelAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/levels.action");
    return impl.deleteLevelAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteLevelAction>));
  });
export const deleteLevelAction = (...args: Parameters<typeof Impl.deleteLevelAction>) =>
  deleteLevelAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteLevelAction>;

const getLevelsAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/levels.action");
    return impl.getLevelsAction(...(unpackArgs(data) as Parameters<typeof Impl.getLevelsAction>));
  });
export const getLevelsAction = (...args: Parameters<typeof Impl.getLevelsAction>) =>
  getLevelsAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getLevelsAction>;

const getLevelByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/levels.action");
    return impl.getLevelByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getLevelByIdAction>));
  });
export const getLevelByIdAction = (...args: Parameters<typeof Impl.getLevelByIdAction>) =>
  getLevelByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getLevelByIdAction>;
