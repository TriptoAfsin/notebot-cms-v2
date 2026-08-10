"use client";

import { Link } from "next-view-transitions";
import { useState } from "react";
import {
  AlertTriangle, ArrowUpRight, ChevronLeft, ChevronRight, Database, SearchX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { AppUserRow, ErrorLogRow } from "@/services/analytics.service";

const ANALYTICS_URL = "https://analytics.butexnotebot.com/";
const nf = new Intl.NumberFormat("en-US");

type Health = {
  available: boolean;
  errors: number | null;
  users: number | null;
  misses: number | null;
  days: number | null;
};
type Paged<T> = { available: boolean; rows: T[]; total: number; page: number; pageSize: number };
type Search = Record<string, string | undefined>;

const TABS = [
  { key: "errors", label: "Error logs" },
  { key: "users", label: "App users" },
  { key: "missed", label: "Missed searches" },
] as const;

export function AnalyticsView({
  tab, current, health, errors, users, missed,
}: {
  tab: string;
  current: Search;
  health: Health;
  errors: (Paged<ErrorLogRow> & { osOptions: string[] }) | null;
  users: (Paged<AppUserRow> & { deptOptions: { dept: string; count: number }[] }) | null;
  missed: Paged<{ term: string; hits: number }> | null;
}) {
  const qs = (patch: Search) => {
    const next = new URLSearchParams();
    // a filter change must reset the page, or page 7 of the old result set 404s into an empty table
    const merged = { ...current, ...patch };
    if (!("page" in patch)) delete merged.page;
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/analytics?${s}` : "/analytics";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only view of the <code className="rounded bg-muted px-1 text-xs">analytics</code>{" "}
            schema, written by the analytics service.
          </p>
        </div>
        <Link
          href={ANALYTICS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          API analytics
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {!health.available ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Database className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">The analytics schema is not readable</p>
            <p className="max-w-md text-sm text-muted-foreground">
              This database has no <code className="rounded bg-muted px-1">analytics</code> schema,
              or the CMS role cannot read it. It is created and populated by the analytics service,
              not by a CMS migration.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Registered users" value={health.users} />
            <Stat label="Missed searches" value={health.misses} />
            <Stat label="Days of traffic" value={health.days} />
            <Stat label="Error reports" value={health.errors} />
          </div>

          {/* Links rather than radio inputs: a radio-driven tab strip scroll-jumps to the checked
              input on load, and these tabs need to survive a shared URL anyway. */}
          <div
            className="flex flex-wrap gap-2 border-b pb-3"
            role="tablist"
            aria-label="Analytics sections"
          >
            {TABS.map((t) => (
              <Link key={t.key} href={qs({ tab: t.key, q: undefined, os: undefined, dept: undefined, batch: undefined })} role="tab" aria-selected={tab === t.key}>
                <Button variant={tab === t.key ? "default" : "outline"} size="sm">
                  {t.label}
                </Button>
              </Link>
            ))}
          </div>

          {tab === "errors" && errors && <ErrorsTab data={errors} current={current} qs={qs} />}
          {tab === "users" && users && <UsersTab data={users} current={current} qs={qs} />}
          {tab === "missed" && missed && <MissedTab data={missed} current={current} qs={qs} />}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold tabular-nums">
          {value === null ? "—" : nf.format(value)}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {value === null && <p className="mt-1 text-[11px] text-muted-foreground">table missing</p>}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ errors */

function ErrorsTab({
  data, current, qs,
}: {
  data: Paged<ErrorLogRow> & { osOptions: string[] };
  current: Search;
  qs: (p: Search) => string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">
            Error reports{" "}
            <span className="font-normal text-muted-foreground">({nf.format(data.total)})</span>
          </CardTitle>
          <FilterForm current={current} placeholder="Search message, email or OS…" />
        </div>
        {data.osOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link href={qs({ os: undefined })}>
              <Button variant={current.os ? "outline" : "default"} size="sm">All platforms</Button>
            </Link>
            {data.osOptions.map((os) => (
              <Link key={os} href={qs({ os })}>
                <Button variant={current.os === os ? "default" : "outline"} size="sm">{os}</Button>
              </Link>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {data.rows.length === 0 ? (
          <NoErrors filtered={Boolean(current.q || current.os)} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead>Reported by</TableHead>
                    <TableHead className="w-[90px]">OS</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer align-top"
                      onClick={() => setOpen(open === r.id ? null : r.id)}
                    >
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="min-w-0">
                        <p className="truncate text-sm">{r.email ?? "—"}</p>
                        {/* Only present when the email matches a registered app user. */}
                        {(r.dept || r.batch || r.uniId) && (
                          <p className="truncate text-xs text-muted-foreground">
                            {[r.dept, r.batch ? `batch ${r.batch}` : null, r.uniId]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.os ? <Badge variant="outline" className="text-[10px]">{r.os}</Badge> : "—"}
                      </TableCell>
                      <TableCell className="min-w-0">
                        <p
                          className={
                            open === r.id
                              ? "text-sm break-words whitespace-pre-wrap"
                              : "truncate text-sm"
                          }
                        >
                          {r.log ?? "—"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager data={data} qs={qs} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * The table is empty in production, so the empty state has to say why — otherwise it reads as
 * "no errors have ever happened", which is a much stronger claim than the data supports.
 */
function NoErrors({ filtered }: { filtered: boolean }) {
  if (filtered) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
        <SearchX className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm">No error report matches those filters</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
      <p className="font-medium">No error reports stored</p>
      <p className="max-w-lg text-sm text-muted-foreground">
        The <code className="rounded bg-muted px-1">analytics.app_err_logs</code> table exists but
        holds no rows. Nothing in the engine or the CMS writes to it — its only writer is the legacy
        analytics API. Absence of rows here is not evidence that the app is error-free.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- users */

function UsersTab({
  data, current, qs,
}: {
  data: Paged<AppUserRow> & { deptOptions: { dept: string; count: number }[] };
  current: Search;
  qs: (p: Search) => string;
}) {
  return (
    <Card>
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">
            App users{" "}
            <span className="font-normal text-muted-foreground">({nf.format(data.total)})</span>
          </CardTitle>
          <FilterForm current={current} placeholder="Search email or university id…" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={qs({ dept: undefined })}>
            <Button variant={current.dept ? "outline" : "default"} size="sm">All departments</Button>
          </Link>
          {data.deptOptions.map((d) => (
            <Link key={d.dept} href={qs({ dept: d.dept })}>
              <Button variant={current.dept === d.dept ? "default" : "outline"} size="sm">
                {d.dept}
                <span className="ml-1 text-[10px] opacity-70">{nf.format(d.count)}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <SearchX className="h-5 w-5" aria-hidden="true" />
            <p className="text-sm">No user matches those filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>University ID</TableHead>
                    <TableHead className="w-[90px]">Batch</TableHead>
                    <TableHead className="w-[130px]">Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{u.id}</TableCell>
                      <TableCell className="min-w-0">
                        <p className="truncate text-sm">{u.email ?? "—"}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{u.uniId || "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {/* 0 is the placeholder the signup form writes when batch is skipped. */}
                        {u.batch && u.batch > 0 ? u.batch : "—"}
                      </TableCell>
                      <TableCell>
                        {u.dept && u.dept.toLowerCase() !== "null" ? (
                          <Badge variant="outline" className="text-[10px]">{u.dept}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager data={data} qs={qs} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ missed */

function MissedTab({
  data, current, qs,
}: {
  data: Paged<{ term: string; hits: number }>;
  current: Search;
  qs: (p: Search) => string;
}) {
  const max = data.rows[0]?.hits ?? 1;

  return (
    <Card>
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">
              Missed searches{" "}
              <span className="font-normal text-muted-foreground">
                ({nf.format(data.total)} distinct terms)
              </span>
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              What students typed that the bot could not match — ranked by how often.
            </p>
          </div>
          <FilterForm current={current} placeholder="Search terms…" />
        </div>
      </CardHeader>
      <CardContent>
        {data.rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <SearchX className="h-5 w-5" aria-hidden="true" />
            <p className="text-sm">No term matches that search</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {data.rows.map((r) => (
                <div key={r.term} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">{r.term}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {nf.format(r.hits)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-rose-500/70"
                        style={{ width: `${Math.max(2, (r.hits / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/content/new?topic=${encodeURIComponent(r.term)}`}
                    className="shrink-0"
                  >
                    <Button variant="outline" size="sm">Add content</Button>
                  </Link>
                </div>
              ))}
            </div>
            <Pager data={data} qs={qs} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ shared */

/** Plain GET form: the filter survives a reload and can be shared as a URL. */
function FilterForm({ current, placeholder }: { current: Search; placeholder: string }) {
  return (
    <form action="/analytics" method="get" className="flex w-full gap-2 sm:w-auto">
      {(["tab", "os", "dept", "batch"] as const).map((k) =>
        current[k] ? <input key={k} type="hidden" name={k} value={current[k]} /> : null,
      )}
      <Input
        name="q"
        defaultValue={current.q ?? ""}
        placeholder={placeholder}
        className="h-9 sm:w-64"
        aria-label={placeholder}
      />
      <Button type="submit" variant="outline" size="sm" className="h-9">Search</Button>
    </form>
  );
}

function Pager({
  data, qs,
}: {
  data: { total: number; page: number; pageSize: number };
  qs: (p: Search) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const start = (data.page - 1) * data.pageSize + 1;
  const end = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        {data.total > 0 ? `Showing ${nf.format(start)}–${nf.format(end)} of ${nf.format(data.total)}` : "No results"}
      </p>
      <div className="flex items-center gap-1">
        {data.page > 1 ? (
          <Link href={qs({ page: String(data.page - 1) })} aria-label="Previous page">
            <Button variant="outline" size="icon-sm"><ChevronLeft className="h-4 w-4" /></Button>
          </Link>
        ) : (
          <Button variant="outline" size="icon-sm" disabled aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <span className="min-w-[80px] px-2 text-center text-xs text-muted-foreground">
          Page {data.page} of {totalPages}
        </span>
        {data.page < totalPages ? (
          <Link href={qs({ page: String(data.page + 1) })} aria-label="Next page">
            <Button variant="outline" size="icon-sm"><ChevronRight className="h-4 w-4" /></Button>
          </Link>
        ) : (
          <Button variant="outline" size="icon-sm" disabled aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
