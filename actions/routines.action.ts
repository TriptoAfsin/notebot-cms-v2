// Server functions for routines.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/routines.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/routines.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createRoutineAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/routines.action");
    return impl.createRoutineAction(...(unpackArgs(data) as Parameters<typeof Impl.createRoutineAction>));
  });
export const createRoutineAction = (...args: Parameters<typeof Impl.createRoutineAction>) =>
  createRoutineAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createRoutineAction>;

const updateRoutineAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/routines.action");
    return impl.updateRoutineAction(...(unpackArgs(data) as Parameters<typeof Impl.updateRoutineAction>));
  });
export const updateRoutineAction = (...args: Parameters<typeof Impl.updateRoutineAction>) =>
  updateRoutineAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateRoutineAction>;

const deleteRoutineAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/routines.action");
    return impl.deleteRoutineAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteRoutineAction>));
  });
export const deleteRoutineAction = (...args: Parameters<typeof Impl.deleteRoutineAction>) =>
  deleteRoutineAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteRoutineAction>;

const getRoutinesAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/routines.action");
    return impl.getRoutinesAction(...(unpackArgs(data) as Parameters<typeof Impl.getRoutinesAction>));
  });
export const getRoutinesAction = (...args: Parameters<typeof Impl.getRoutinesAction>) =>
  getRoutinesAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getRoutinesAction>;

const getRoutineByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/routines.action");
    return impl.getRoutineByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getRoutineByIdAction>));
  });
export const getRoutineByIdAction = (...args: Parameters<typeof Impl.getRoutineByIdAction>) =>
  getRoutineByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getRoutineByIdAction>;
