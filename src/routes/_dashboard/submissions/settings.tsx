import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import DashboardLoading from "@/features/dashboard/loading";
import { getSubmissionConfig } from "@/actions/app-settings.action";
import { SubmissionSettingsForm } from "@/features/dashboard/submissions/settings/settings-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const config = await getSubmissionConfig();
    return { config };
  });

export const Route = createFileRoute("/_dashboard/submissions/settings")({
  pendingComponent: DashboardLoading,
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { config } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-[22px] font-semibold tracking-[-0.02em]">Submission Form Settings</h1>
      <SubmissionSettingsForm config={config} />
    </div>
  );
}
