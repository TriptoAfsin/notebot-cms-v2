"use client";

import Link from "next/link";
import {
  ArrowUpRight, BookOpen, Calendar, FileText, FlaskConical, GraduationCap,
  HelpCircle, Layers, ScrollText, SearchX,
} from "lucide-react";

import { EvilAreaChart } from "@/components/evilcharts/charts/recharts-area-chart";
import { EvilBarChart } from "@/components/evilcharts/charts/recharts-bar-chart";
import { EvilPieChart } from "@/components/evilcharts/charts/recharts-pie-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toSlug } from "@/lib/slug";
import type { DashboardData } from "@/services/dashboard.service";

import {
  contentMixConfig, cycleConfig, missedConfig, perLevelConfig, trafficConfig,
} from "./chart-config";
import { FlushCacheButton } from "./flush-cache-button";

const ANALYTICS_URL = "https://analytics.butexnotebot.com/";

const nf = new Intl.NumberFormat("en-US");
const monthLabel = (m: string) => {
  const [y, mo] = m.split("-");
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(mo) - 1]} ${y.slice(2)}`;
};

export function DashboardView({ data }: { data: DashboardData }) {
  const { stats, analytics } = data;

  // Two rows of four: the content tree first, then the standalone resource tables.
  const kpiRows = [
    [
      { title: "Levels", value: stats.levels, icon: Layers, tint: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10", href: "/levels" },
      { title: "Subjects", value: stats.subjects, icon: GraduationCap, tint: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", href: "/subjects" },
      { title: "Topics", value: stats.topics, icon: BookOpen, tint: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", href: "/topics" },
      { title: "Notes", value: stats.notes, icon: FileText, tint: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10", href: "/notes" },
    ],
    [
      { title: "Lab Reports", value: stats.labReports, icon: FlaskConical, tint: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10", href: "/lab-reports" },
      { title: "Q. Banks", value: stats.questionBanks, icon: HelpCircle, tint: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10", href: "/question-banks" },
      { title: "Routines", value: stats.routines, icon: Calendar, tint: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10", href: "/routines" },
      { title: "Syllabuses", value: stats.syllabuses, icon: ScrollText, tint: "text-fuchsia-500", bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10", href: "/syllabuses" },
    ],
  ];

  const deptConfig = cycleConfig(data.contentByDept.map((d) => d.dept));

  // EvilCharts builds SVG gradient ids straight from the nameKey value — `url(#…-colors-BUTEX
  // Affiliate)` — so any category containing a space silently renders black with no legend swatch.
  // Slug the key, keep the human label in the config.
  const audience = (analytics?.audience ?? []).map((a) => ({
    key: toSlug(a.dept) || "unknown",
    label: a.dept,
    users: a.users,
  }));
  const audienceLabels = new Map(audience.map((a) => [a.key, a.label]));
  const audienceConfig = cycleConfig(
    audience.map((a) => a.key),
    (k) => audienceLabels.get(k) ?? k,
  );
  const coveragePct = data.deptCoverage.total
    ? Math.round((data.deptCoverage.tagged / data.deptCoverage.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={ANALYTICS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            API analytics
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">(opens analytics.butexnotebot.com in a new tab)</span>
          </Link>
          <FlushCacheButton />
        </div>
      </div>

      {/* ---- KPIs, two rows ---- */}
      <div className="space-y-3">
        {kpiRows.map((row, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {row.map((card) => (
              <Link key={card.title} href={card.href} className="group focus-visible:outline-none">
                {/* py-2.5 overrides Card's built-in py-6 — with it, eight tiles cost ~220px of
                    vertical space before a single chart is visible. */}
                <Card className="h-full py-2.5 transition-colors group-hover:border-foreground/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardContent className="flex items-center gap-2.5 px-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${card.bg}`}>
                      <card.icon className={`h-3.5 w-3.5 ${card.tint}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg leading-tight font-bold tabular-nums">
                        {nf.format(card.value)}
                      </div>
                      <p className="truncate text-[11px] leading-tight text-muted-foreground">
                        {card.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* ---- Traffic ---- */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 pb-2">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">Requests per month</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Last 12 months, web app vs Messenger bot
            </p>
          </div>
          {analytics && (
            <Link
              href={ANALYTICS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-medium text-muted-foreground whitespace-nowrap hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Full analytics <ArrowUpRight className="inline h-3 w-3" aria-hidden="true" />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-72 min-w-0">
            {!analytics ? (
              <Unavailable />
            ) : (
              <EvilAreaChart
                className="h-full w-full"
                data={analytics.traffic}
                config={trafficConfig}
                stackType="stacked"
                xDataKey="month"
              >
                <EvilAreaChart.Grid />
                <EvilAreaChart.XAxis dataKey="month" tickFormatter={monthLabel} />
                <EvilAreaChart.YAxis tickFormatter={(v) => compact(Number(v))} />
                <EvilAreaChart.Legend isClickable />
                <EvilAreaChart.Tooltip variant="frosted-glass" />
                <EvilAreaChart.Area dataKey="app" variant="gradient" isClickable>
                  <EvilAreaChart.ActiveDot variant="colored-border" />
                </EvilAreaChart.Area>
                <EvilAreaChart.Area dataKey="bot" variant="gradient" isClickable>
                  <EvilAreaChart.ActiveDot variant="colored-border" />
                </EvilAreaChart.Area>
              </EvilAreaChart>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ---- Content mix + per level ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Content mix</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Every published resource by type</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 min-w-0">
              <EvilPieChart
                className="h-full w-full"
                data={data.contentMix}
                dataKey="value"
                nameKey="kind"
                config={contentMixConfig}
              >
                <EvilPieChart.Legend isClickable />
                <EvilPieChart.Tooltip variant="frosted-glass" />
                <EvilPieChart.Pie variant="gradient" innerRadius={58} cornerRadius={6} paddingAngle={3} isClickable />
              </EvilPieChart>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Depth per level</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Topics are the buttons students tap; notes are what sits behind them
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72 min-w-0">
              <EvilBarChart
                className="h-full w-full"
                data={data.perLevel}
                config={perLevelConfig}
                xDataKey="level"
              >
                <EvilBarChart.Grid />
                <EvilBarChart.XAxis dataKey="level" />
                <EvilBarChart.YAxis />
                <EvilBarChart.Legend isClickable />
                <EvilBarChart.Tooltip variant="frosted-glass" />
                <EvilBarChart.Bar dataKey="notes" variant="duotone" radius={6} isClickable enableHoverHighlight />
                <EvilBarChart.Bar dataKey="topics" variant="duotone" radius={6} isClickable enableHoverHighlight />
              </EvilBarChart>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Departments: what we hold vs who reads it ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Notes by department</CardTitle>
            {/* A department chart that quietly speaks for a fifth of the corpus reads as though it
                speaks for all of it, so the coverage is stated rather than implied. */}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {nf.format(data.deptCoverage.tagged)} of {nf.format(data.deptCoverage.total)} notes
              name a department ({coveragePct}%) — the rest are untagged
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72 min-w-0">
              {data.contentByDept.length === 0 ? (
                <Empty icon={FileText} text="No note carries a department yet" />
              ) : (
                <EvilBarChart
                  className="h-full w-full"
                  data={data.contentByDept}
                  config={{ notes: { label: "Notes", colors: deptConfig[data.contentByDept[0].dept].colors } }}
                  xDataKey="dept"
                >
                  <EvilBarChart.Grid />
                  <EvilBarChart.XAxis dataKey="dept" />
                  <EvilBarChart.YAxis />
                  <EvilBarChart.Tooltip variant="frosted-glass" />
                  <EvilBarChart.Bar dataKey="notes" variant="hatched" radius={6} isClickable enableHoverHighlight />
                </EvilBarChart>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Readers by department</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {analytics ? `${nf.format(analytics.totals.users)} registered app users` : "From the analytics schema"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72 min-w-0">
              {!analytics || analytics.audience.length === 0 ? (
                <Unavailable />
              ) : (
                // A radial chart was unreadable here: "BUTEX Affiliate" is a 2,716-user catch-all
                // against departments of 100–350, so every real department collapsed to a sliver.
                // A pie carries a single dominant share legibly, and the solid centre keeps it
                // visually distinct from the Content-mix donut above.
                <EvilPieChart
                  className="h-full w-full"
                  data={audience}
                  dataKey="users"
                  nameKey="key"
                  config={audienceConfig}
                >
                  <EvilPieChart.Legend isClickable />
                  <EvilPieChart.Tooltip variant="frosted-glass" />
                  <EvilPieChart.Pie variant="gradient" cornerRadius={4} paddingAngle={2} isClickable />
                </EvilPieChart>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Content gaps + the one submissions panel ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Searched but not found</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Terms the bot could not match{analytics ? ` — ${nf.format(analytics.totals.misses)} misses logged` : ""}. Each one is a note worth adding.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-w-0">
              {!analytics || analytics.missed.length === 0 ? (
                <Unavailable />
              ) : (
                // EvilCharts inverts Recharts' `layout`: "horizontal" means the bars run
                // horizontally (Recharts layout="vertical"). It also infers each axis type from
                // that, so passing type= by hand fights it and yields a chart with no bars.
                <EvilBarChart
                  className="h-full w-full"
                  data={analytics.missed}
                  config={missedConfig}
                  layout="horizontal"
                  xDataKey="term"
                >
                  <EvilBarChart.Grid />
                  <EvilBarChart.XAxis />
                  {/* interval={0} — the default minTickGap silently labelled only every other
                      bar, which on a ranked list makes the unlabelled ones unreadable. */}
                  <EvilBarChart.YAxis dataKey="term" width={112} interval={0} />
                  <EvilBarChart.Tooltip variant="frosted-glass" />
                  <EvilBarChart.Bar dataKey="hits" variant="gradient" radius={5} isClickable enableHoverHighlight />
                </EvilBarChart>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-base font-semibold">Recent submissions</CardTitle>
            {data.submissions.pending > 0 && (
              <Badge className="shrink-0 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
                {data.submissions.pending} pending
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="h-80 space-y-2 overflow-y-auto">
              {data.submissions.recent.length === 0 ? (
                <Empty icon={FileText} text="No submissions yet" />
              ) : (
                data.submissions.recent.map((sub) => (
                  <Link
                    key={sub.id}
                    href="/submissions"
                    className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{sub.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {sub.subjectName} &middot; {sub.topicName}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** 4_015_931 → "4M" — axis ticks have no room for grouped digits. */
function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

function Empty({ icon: Icon, text }: { icon: typeof FileText; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <Icon className="h-5 w-5" aria-hidden="true" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

/** The analytics schema is owned by a separate service, so its absence is a state, not an error. */
function Unavailable() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
      <SearchX className="h-5 w-5" aria-hidden="true" />
      <p className="text-sm">Analytics data unavailable</p>
      <p className="max-w-xs text-xs">
        The <code className="rounded bg-muted px-1">analytics</code> schema could not be read from
        this database.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge className={`shrink-0 text-[10px] ${styles[status] ?? styles.pending}`}>{label}</Badge>
  );
}
