import { getBotFlowsAction, getRetirableFlowsAction } from "@/actions/bot-flows.action";
import { requireUser } from "@/lib/session";

import { BotFlowsView } from "./bot-flows-view";

export const metadata = { title: "Bot Flows · NoteBot CMS" };

export default async function BotFlowsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; page?: string }>;
}) {
  if (!(await requireUser())) {
    return <p className="text-sm text-muted-foreground">Sign in to manage bot flows.</p>;
  }

  const sp = await searchParams;
  const [data, retirable] = await Promise.all([
    getBotFlowsAction({ q: sp.q, kind: sp.kind, page: sp.page ? parseInt(sp.page, 10) || 1 : 1 }),
    getRetirableFlowsAction(),
  ]);

  return <BotFlowsView data={data} retirable={retirable} current={sp} />;
}
