// Server functions for note-submissions.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/note-submissions.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/note-submissions.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const getSubmissions__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/note-submissions.action");
    return impl.getSubmissions(...(unpackArgs(data) as Parameters<typeof Impl.getSubmissions>));
  });
export const getSubmissions = (...args: Parameters<typeof Impl.getSubmissions>) =>
  getSubmissions__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getSubmissions>;

const createSubmission__server = createServerFn({ method: "POST" })
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/note-submissions.action");
    return impl.createSubmission(...(unpackArgs(data) as Parameters<typeof Impl.createSubmission>));
  });
export const createSubmission = (...args: Parameters<typeof Impl.createSubmission>) =>
  createSubmission__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createSubmission>;

const trackSubmissions__server = createServerFn({ method: "GET" })
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/note-submissions.action");
    return impl.trackSubmissions(...(unpackArgs(data) as Parameters<typeof Impl.trackSubmissions>));
  });
export const trackSubmissions = (...args: Parameters<typeof Impl.trackSubmissions>) =>
  trackSubmissions__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.trackSubmissions>;

const reviewSubmission__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/note-submissions.action");
    return impl.reviewSubmission(...(unpackArgs(data) as Parameters<typeof Impl.reviewSubmission>));
  });
export const reviewSubmission = (...args: Parameters<typeof Impl.reviewSubmission>) =>
  reviewSubmission__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.reviewSubmission>;

const deleteSubmission__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/note-submissions.action");
    return impl.deleteSubmission(...(unpackArgs(data) as Parameters<typeof Impl.deleteSubmission>));
  });
export const deleteSubmission = (...args: Parameters<typeof Impl.deleteSubmission>) =>
  deleteSubmission__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteSubmission>;

const checkSubmission__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/note-submissions.action");
    return impl.checkSubmission(...(unpackArgs(data) as Parameters<typeof Impl.checkSubmission>));
  });
export const checkSubmission = (...args: Parameters<typeof Impl.checkSubmission>) =>
  checkSubmission__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.checkSubmission>;
