import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import DashboardLoading from "@/features/dashboard/loading";
import { getLevelsAction } from "@/actions/levels.action";
import { CreateQuestionBankForm } from "@/features/dashboard/question-banks/new/create-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const levels = await getLevelsAction();
    return { levels };
  });

export const Route = createFileRoute("/_dashboard/question-banks/new")({
  pendingComponent: DashboardLoading,
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { levels } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-[22px] font-semibold tracking-[-0.02em]">Create Question Bank</h1>
      <CreateQuestionBankForm levels={levels} />
    </div>
  );
}
