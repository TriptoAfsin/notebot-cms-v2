import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { FormSkeleton } from "@/features/dashboard/skeletons";
import { getSubjectsAction } from "@/actions/subjects.action";
import { NewTopicForm } from "@/features/dashboard/topics/new/new-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const subjects = await getSubjectsAction();
    return { subjects };
  });

export const Route = createFileRoute("/_dashboard/topics/new")({
  pendingComponent: FormSkeleton,
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { subjects } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-[22px] font-semibold tracking-[-0.02em]">Create Topic</h1>
      <NewTopicForm subjects={subjects} />
    </div>
  );
}
