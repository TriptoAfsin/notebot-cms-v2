import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { notFound } from "@/lib/navigation";
import { getQuestionBankByIdAction } from "@/actions/question-banks.action";
import { getLevelsAction } from "@/actions/levels.action";
import { EditQuestionBankForm } from "@/features/dashboard/question-banks/[id]/edit-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const params = thenable(__params);
    const { id } = await params;
    const [questionBank, levels] = await Promise.all([
    getQuestionBankByIdAction(parseInt(id)),
    getLevelsAction(),
  ]);
    if (!questionBank) {
    notFound();
  }
    return { questionBank, levels };
  });

export const Route = createFileRoute("/_dashboard/question-banks/$id")({
  pendingComponent: DashboardLoading,
  loader: ({ params, }) => loadPage({ data: packArgs([params, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { questionBank, levels } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Question Bank</h1>
      <EditQuestionBankForm questionBank={questionBank} levels={levels} />
    </div>
  );
}
