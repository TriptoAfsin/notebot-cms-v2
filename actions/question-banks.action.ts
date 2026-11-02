// Server functions for question-banks.action. Generated from the former Next.js Server Actions;
// call signatures are unchanged. Implementations live in ./_impl/question-banks.action.ts (server-only).
import { createServerFn } from "@tanstack/react-start";
import type * as Impl from "./_impl/question-banks.action";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";

const createQuestionBankAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/question-banks.action");
    return impl.createQuestionBankAction(...(unpackArgs(data) as Parameters<typeof Impl.createQuestionBankAction>));
  });
export const createQuestionBankAction = (...args: Parameters<typeof Impl.createQuestionBankAction>) =>
  createQuestionBankAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.createQuestionBankAction>;

const updateQuestionBankAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/question-banks.action");
    return impl.updateQuestionBankAction(...(unpackArgs(data) as Parameters<typeof Impl.updateQuestionBankAction>));
  });
export const updateQuestionBankAction = (...args: Parameters<typeof Impl.updateQuestionBankAction>) =>
  updateQuestionBankAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.updateQuestionBankAction>;

const deleteQuestionBankAction__server = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/question-banks.action");
    return impl.deleteQuestionBankAction(...(unpackArgs(data) as Parameters<typeof Impl.deleteQuestionBankAction>));
  });
export const deleteQuestionBankAction = (...args: Parameters<typeof Impl.deleteQuestionBankAction>) =>
  deleteQuestionBankAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.deleteQuestionBankAction>;

const getQuestionBanksAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/question-banks.action");
    return impl.getQuestionBanksAction(...(unpackArgs(data) as Parameters<typeof Impl.getQuestionBanksAction>));
  });
export const getQuestionBanksAction = (...args: Parameters<typeof Impl.getQuestionBanksAction>) =>
  getQuestionBanksAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getQuestionBanksAction>;

const getQuestionBankByIdAction__server = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data }) => {
    const impl = await import("./_impl/question-banks.action");
    return impl.getQuestionBankByIdAction(...(unpackArgs(data) as Parameters<typeof Impl.getQuestionBankByIdAction>));
  });
export const getQuestionBankByIdAction = (...args: Parameters<typeof Impl.getQuestionBankByIdAction>) =>
  getQuestionBankByIdAction__server({ data: packArgs(args) }) as unknown as ReturnType<typeof Impl.getQuestionBankByIdAction>;
