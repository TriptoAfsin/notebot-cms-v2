import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { FormSkeleton } from "@/features/dashboard/skeletons";
import { getTopicsAction } from "@/actions/topics.action";
import { CreateNoteForm } from "@/features/dashboard/notes/new/create-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const topics = await getTopicsAction();
    return { topics };
  });

export const Route = createFileRoute("/_dashboard/notes/new")({
  pendingComponent: FormSkeleton,
  // Prefill from the submissions queue: ?topicId=&url=&title=&author=
  validateSearch: (s: Record<string, unknown>) => ({
    topicId: s.topicId != null && Number.isFinite(Number(s.topicId)) ? Number(s.topicId) : undefined,
    url: typeof s.url === "string" ? s.url : undefined,
    title: typeof s.title === "string" ? s.title : undefined,
    author: typeof s.author === "string" ? s.author : undefined,
  }),
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { topics } = Route.useLoaderData();
  const search = Route.useSearch();
  const initial = { ...search, topicId: search.topicId?.toString() };
  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-[22px] font-semibold tracking-[-0.02em]">Create Note</h1>
      <CreateNoteForm topics={topics} initial={initial} />
    </div>
  );
}
