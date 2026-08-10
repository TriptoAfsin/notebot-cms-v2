"use client";

import { Link } from "next-view-transitions";
import { useState, useTransition } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { toast } from "sonner";

import { toggleBotFlowAction } from "@/actions/bot-flows.action";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import { EditPanel } from "./edit-panel";

type Flow = {
  id: number;
  payload: string;
  label: string | null;
  kind: string;
  enabled: boolean;
  blocks: unknown;
  blockCount: number;
  updatedAt: Date | string;
};

type Data = {
  rows: Flow[];
  total: number;
  page: number;
  pageSize: number;
  kinds: { kind: string; count: number }[];
};

type Search = Record<string, string | undefined>;

const KIND_TINT: Record<string, string> = {
  menu: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
  help: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  donation: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  partner: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
  entertainment: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
};

export function BotFlowsView({
  data, retirable, current,
}: {
  data: Data;
  retirable: { payload: string; kind: string; matched: string }[];
  current: Search;
}) {
  const [editing, setEditing] = useState<Flow | null>(null);

  const qs = (patch: Search) => {
    const merged = { ...current, ...patch };
    if (!("page" in patch)) delete merged.page;
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/bot-flows?${s}` : "/bot-flows";
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bot flows</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The Messenger replies that are <em>not</em> rows in the content tables — usage
          instructions, donation details, top-level menus, partner cards. Notes, topics, subjects,
          labs, routines and syllabuses are resolved live by the engine; edit those in their own
          sections instead.
        </p>
      </div>

      {/* These payloads also name a topic or subject, so the engine would have somewhere to go if the
          flow were disabled — but they were frozen precisely because the database reached *fewer*
          links than v1 showed. Saying "redundant" here would invite a content regression. */}
      {retirable.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
              {retirable.length} flow{retirable.length === 1 ? "" : "s"} overriding a live topic or
              subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              The engine checks this table before the content tables, so each of these hides the
              matching row — and a note added there will not show up in the bot.
            </p>
            <p className="text-muted-foreground">
              They are frozen because the database did not yet hold every link v1 showed.{" "}
              <strong className="text-foreground">Add the missing notes first</strong>, then disable
              the flow: doing it the other way round takes content away from students.
            </p>
            <ul className="mt-2 space-y-0.5">
              {retirable.slice(0, 8).map((r) => (
                <li key={r.payload} className="font-mono text-xs">
                  {r.payload} <span className="text-muted-foreground">→ {r.matched}</span>
                </li>
              ))}
            </ul>
            {retirable.length > 8 && (
              <p className="text-xs text-muted-foreground">…and {retirable.length - 8} more</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="gap-3 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              {data.total} flow{data.total === 1 ? "" : "s"}
            </CardTitle>
            <form action="/bot-flows" method="get" className="flex w-full gap-2 sm:w-auto">
              {current.kind ? <input type="hidden" name="kind" value={current.kind} /> : null}
              {current.status ? <input type="hidden" name="status" value={current.status} /> : null}
              <Input
                name="q" defaultValue={current.q ?? ""} placeholder="Search payload or label…"
                className="h-9 sm:w-64" aria-label="Search bot flows"
              />
              <Button type="submit" variant="outline" size="sm" className="h-9">Search</Button>
            </form>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={qs({ kind: undefined })}>
              <Button variant={current.kind ? "outline" : "default"} size="sm">All kinds</Button>
            </Link>
            {data.kinds.map((k) => (
              <Link key={k.kind} href={qs({ kind: k.kind })}>
                <Button variant={current.kind === k.kind ? "default" : "outline"} size="sm">
                  {k.kind}
                  <span className="ml-1 text-[10px] opacity-70">{k.count}</span>
                </Button>
              </Link>
            ))}
          </div>
          {/* Status is a separate axis from kind: a disabled flow is easy to lose among 274 rows,
              and "what did we turn off?" is the question people actually come here with. */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Status</span>
            {([
              { key: undefined, label: "Any" },
              { key: "enabled", label: "Enabled" },
              { key: "disabled", label: "Disabled" },
            ] as const).map((s) => (
              <Link key={s.label} href={qs({ status: s.key })}>
                <Button variant={current.status === s.key ? "default" : "outline"} size="sm">
                  {s.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {data.rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <SearchX className="h-5 w-5" aria-hidden="true" />
              <p className="text-sm">No flow matches those filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payload</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead className="w-[110px]">Kind</TableHead>
                      <TableHead className="w-[80px]">Blocks</TableHead>
                      <TableHead className="w-[90px]">Status</TableHead>
                      <TableHead className="w-[120px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.map((f) => (
                      <TableRow key={f.id} className={f.enabled ? undefined : "opacity-60"}>
                        <TableCell className="font-mono text-xs">{f.payload}</TableCell>
                        <TableCell className="text-sm">{f.label ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${KIND_TINT[f.kind] ?? ""}`}>
                            {f.kind}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">{f.blockCount}</TableCell>
                        <TableCell>
                          <ToggleButton flow={f} />
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setEditing(f)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  Page {data.page} of {totalPages}
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
            </>
          )}
        </CardContent>
      </Card>

      {editing && <EditPanel flow={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/**
 * Enable/disable.
 *
 * Disabling is confirmed, because it is the one action here that can silently remove content from
 * students: the engine falls through to the content tables, and those may hold fewer links than the
 * frozen flow does. Enabling needs no confirmation — it only ever adds a reply back.
 *
 * A disabled flow shows a destructive-tinted button rather than a neutral outline, so a row that is
 * off is obvious at a glance instead of being distinguishable only by its label.
 */
function ToggleButton({ flow }: { flow: Flow }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const apply = (next: boolean) =>
    start(async () => {
      const r = await toggleBotFlowAction(flow.id, next);
      if (r?.success) toast.success(next ? "Flow enabled" : "Flow disabled — engine cache cleared");
      else toast.error("Could not change that flow");
      setConfirming(false);
    });

  if (!flow.enabled) {
    return (
      <Button variant="destructive" size="sm" disabled={pending}
        title="This flow is off — the engine falls through to the content tables"
        onClick={() => apply(true)}>
        Disabled
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" disabled={pending} onClick={() => setConfirming(true)}>
        Enabled
      </Button>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable this flow?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-xs">{flow.payload}</span> will stop answering with
                  its {flow.blockCount} message{flow.blockCount === 1 ? "" : "s"}.
                </p>
                <p>
                  The engine will fall through to the content tables and then to search. If those hold
                  fewer links than this flow does,{" "}
                  <strong className="text-foreground">students will see less than they do now</strong>.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Keep it on</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => { e.preventDefault(); apply(false); }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending ? "Disabling…" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
