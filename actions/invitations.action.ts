// Server functions for invitations.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/invitations.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/invitations.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getInvitations__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/invitations.action");
    return impl.getInvitations(...(unpackArgs(data) as Parameters<typeof Impl.getInvitations>));
  });
export const getInvitations = (...args: Parameters<typeof Impl.getInvitations>) =>
  getInvitations__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getInvitations>;

const createInvitation__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/invitations.action");
    return impl.createInvitation(...(unpackArgs(data) as Parameters<typeof Impl.createInvitation>));
  });
export const createInvitation = (...args: Parameters<typeof Impl.createInvitation>) =>
  createInvitation__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createInvitation>;

const deleteInvitation__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/invitations.action");
    return impl.deleteInvitation(...(unpackArgs(data) as Parameters<typeof Impl.deleteInvitation>));
  });
export const deleteInvitation = (...args: Parameters<typeof Impl.deleteInvitation>) =>
  deleteInvitation__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteInvitation>;

const validateInvitation__server = createServerFn({ method: "GET" })
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/invitations.action");
    return impl.validateInvitation(...(unpackArgs(data) as Parameters<typeof Impl.validateInvitation>));
  });
export const validateInvitation = (...args: Parameters<typeof Impl.validateInvitation>) =>
  validateInvitation__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.validateInvitation>;

const registerWithInvitation__server = createServerFn({ method: "POST" })
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/invitations.action");
    return impl.registerWithInvitation(...(unpackArgs(data) as Parameters<typeof Impl.registerWithInvitation>));
  });
export const registerWithInvitation = (...args: Parameters<typeof Impl.registerWithInvitation>) =>
  registerWithInvitation__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.registerWithInvitation>;
