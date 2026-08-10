import { requireUser } from "@/lib/session";
import {
  getAnalyticsHealth, getAppUsers, getErrorLogs, getMissedSearches,
} from "@/services/analytics.service";

import { AnalyticsView } from "./analytics-view";

export const metadata = { title: "Analytics · NoteBot CMS" };

type Search = {
  tab?: string;
  q?: string;
  os?: string;
  dept?: string;
  batch?: string;
  page?: string;
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!(await requireUser())) {
    return <p className="text-sm text-muted-foreground">Sign in to view analytics.</p>;
  }

  const sp = await searchParams;
  const tab = sp.tab === "users" || sp.tab === "missed" ? sp.tab : "errors";
  const page = sp.page ? parseInt(sp.page, 10) || 1 : 1;

  // Only the visible tab is queried. Fetching all three would mean three COUNT(*) sweeps over
  // 10k+ rows on every filter keystroke, for two tables nobody is looking at.
  const health = await getAnalyticsHealth();
  const errors = tab === "errors" ? await getErrorLogs({ q: sp.q, os: sp.os, page }) : null;
  const users = tab === "users" ? await getAppUsers({ q: sp.q, dept: sp.dept, batch: sp.batch, page }) : null;
  const missed = tab === "missed" ? await getMissedSearches({ q: sp.q, page }) : null;

  return (
    <AnalyticsView
      tab={tab}
      current={sp}
      health={health}
      errors={errors}
      users={users}
      missed={missed}
    />
  );
}
