import { Link } from "next-view-transitions";
import { ChevronLeft, ChevronRight, Mail, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/session";
import {
  getContributorStats, getContributors, type ContributorSort,
} from "@/services/contributors.service";

export const metadata = { title: "Contributors · NoteBot CMS" };

type Search = { q?: string; sort?: string; page?: string };

const nf = new Intl.NumberFormat("en-US");
const SORTS: { key: ContributorSort; label: string }[] = [
  { key: "top", label: "Most submissions" },
  { key: "recent", label: "Most recent" },
  { key: "name", label: "Name" },
];

/** Form timestamps are Dhaka time; show dates the way contributors would recognise them. */
function day(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
}

export default async function ContributorsPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (!(await requireUser())) {
    return <p className="text-sm text-muted-foreground">Sign in to view contributors.</p>;
  }

  const sp = await searchParams;
  const sort: ContributorSort = sp.sort === "recent" || sp.sort === "name" ? sp.sort : "top";
  const page = sp.page ? parseInt(sp.page, 10) || 1 : 1;
  const [stats, data] = await Promise.all([getContributorStats(), getContributors({ q: sp.q, sort, page })]);

  const qs = (patch: Search) => {
    const merged: Search = { q: sp.q, sort: sort === "top" ? undefined : sort, ...patch };
    // any change other than paging starts again from page 1
    if (!("page" in patch)) delete merged.page;
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/contributors?${s}` : "/contributors";
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold">Contributors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Students who submitted notes through the form, matched by email. Kept up to date by the ingest
          pipeline; contributors are thanked by email when their notes go live.
        </p>
      </div>

      {!data.available ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            The <code className="rounded bg-muted px-1 text-xs">contributors</code> table does not exist in this
            database yet. Apply <code className="rounded bg-muted px-1 text-xs">drizzle/0008_contributors.sql</code>.
          </CardContent>
        </Card>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Contributors" value={stats.contributors} />
              <Stat label="Active in last 90 days" value={stats.active90} />
              <Stat label="Form submissions before the pipeline" value={stats.legacy} />
              <Stat label="Thank-you emails sent" value={stats.emailsSent} hint={`${nf.format(stats.thankedPeople)} people`} />
            </div>
          )}

          <Card className="py-0">
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Sort contributors">
                  {SORTS.map((s) => (
                    <Link key={s.key} href={qs({ sort: s.key === "top" ? undefined : s.key })} role="tab" aria-selected={sort === s.key}>
                      <Badge variant={sort === s.key ? "default" : "outline"} className="cursor-pointer">{s.label}</Badge>
                    </Link>
                  ))}
                </div>
                <form action="/contributors" method="get" className="flex w-full gap-2 sm:w-auto">
                  {sort !== "top" && <input type="hidden" name="sort" value={sort} />}
                  <Input name="q" defaultValue={sp.q ?? ""} placeholder="Search name, email, batch, dept" className="h-9 sm:w-72" aria-label="Search contributors" />
                  <Button type="submit" variant="outline" size="sm" className="h-9">Search</Button>
                </form>
              </div>

              {data.rows.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <Users className="h-6 w-6" />
                  {sp.q ? <>No contributor matches “{sp.q}”.</> : <>No contributors yet.</>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contributor</TableHead>
                        <TableHead>Batch · Dept</TableHead>
                        <TableHead className="text-right">Submitted</TableHead>
                        <TableHead className="text-right">Published</TableHead>
                        <TableHead>First → last</TableHead>
                        <TableHead>Last thanked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="min-w-0">
                            <div className="font-medium">{r.name || "—"}</div>
                            <a href={`mailto:${r.email}`} className="text-xs text-muted-foreground hover:underline">{r.email}</a>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {[r.batch, r.department].filter(Boolean).join(" · ") || "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{nf.format(r.submissions)}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.published ? nf.format(r.published) : "—"}</TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {day(r.firstSubmittedAt)} → {day(r.lastSubmittedAt)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs">
                            {r.lastAcknowledgedAt ? (
                              <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{day(r.lastAcknowledgedAt)}</span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  {data.total > 0
                    ? `Showing ${nf.format((data.page - 1) * data.pageSize + 1)}–${nf.format(Math.min(data.page * data.pageSize, data.total))} of ${nf.format(data.total)}`
                    : "No results"}
                </p>
                <div className="flex items-center gap-1">
                  {data.page > 1 ? (
                    <Link href={qs({ page: String(data.page - 1) })} aria-label="Previous page">
                      <Button variant="outline" size="icon-sm"><ChevronLeft className="h-4 w-4" /></Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="icon-sm" disabled aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
                  )}
                  <span className="min-w-[80px] px-2 text-center text-xs text-muted-foreground">Page {data.page} of {totalPages}</span>
                  {data.page < totalPages ? (
                    <Link href={qs({ page: String(data.page + 1) })} aria-label="Next page">
                      <Button variant="outline" size="icon-sm"><ChevronRight className="h-4 w-4" /></Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="icon-sm" disabled aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card className="py-2.5">
      <CardContent className="px-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{nf.format(value)}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
