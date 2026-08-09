"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Row = {
  id: number;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: number | null;
  entityLabel: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string | null;
  createdAt: Date | string;
};

const ACTION_STYLE: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  update: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  delete: "bg-destructive/10 text-destructive border-destructive/30",
};

/** Only the keys that actually differ — a whole-row dump buries the one field that changed. */
function diffKeys(before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return [...keys].filter((k) => JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]));
}

const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Button variant={active ? "default" : "outline"} size="sm">{children}</Button>
    </Link>
  );
}

export function AuditTable({
  data, facets, current,
}: {
  data: { rows: Row[]; total: number; page: number; pageSize: number };
  facets: { entityTypes: string[]; actors: string[] };
  current: { entityType?: string; action?: string; actor?: string; page?: string };
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...current, page: undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/audit?${s}` : "/audit";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every content change, with what the row looked like before it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterLink href={qs({ entityType: undefined, action: undefined, actor: undefined })}
          active={!current.entityType && !current.action && !current.actor}>All</FilterLink>
        {["create", "update", "delete"].map((a) => (
          <FilterLink key={a} href={qs({ action: current.action === a ? undefined : a })} active={current.action === a}>
            {a}
          </FilterLink>
        ))}
        <span className="w-px h-6 bg-border mx-1" />
        {facets.entityTypes.map((t) => (
          <FilterLink key={t} href={qs({ entityType: current.entityType === t ? undefined : t })} active={current.entityType === t}>
            {t.replace(/_/g, " ")}
          </FilterLink>
        ))}
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="w-44">When</TableHead>
              <TableHead className="w-24">Action</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead>What</TableHead>
              <TableHead className="w-56">Who</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((r) => {
              const keys = diffKeys(r.before, r.after);
              const open = expanded === r.id;
              return (
                <>
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setExpanded(open ? null : r.id)}>
                    <TableCell>
                      <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-90")} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ACTION_STYLE[r.action] ?? ""}>{r.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{r.entityType.replace(/_/g, " ")}</TableCell>
                    <TableCell className="max-w-[22rem] truncate" title={r.entityLabel ?? ""}>
                      {r.entityLabel || <span className="text-muted-foreground">#{r.entityId}</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate">
                      {r.actorEmail ?? "—"}
                    </TableCell>
                  </TableRow>
                  {open && (
                    <TableRow key={`${r.id}-d`}>
                      <TableCell colSpan={6} className="bg-muted/30">
                        {keys.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">No field-level differences recorded.</p>
                        ) : (
                          <div className="overflow-x-auto py-1">
                            <table className="text-xs w-full">
                              <thead className="text-muted-foreground">
                                <tr>
                                  <th className="text-left font-medium py-1 pr-4 w-40">Field</th>
                                  <th className="text-left font-medium py-1 pr-4">Before</th>
                                  <th className="text-left font-medium py-1">After</th>
                                </tr>
                              </thead>
                              <tbody className="font-mono">
                                {keys.map((k) => (
                                  <tr key={k} className="border-t border-border/50">
                                    <td className="py-1 pr-4 font-sans font-medium">{k}</td>
                                    <td className="py-1 pr-4 text-destructive/80 break-all">{show(r.before?.[k])}</td>
                                    <td className="py-1 text-emerald-600 dark:text-emerald-400 break-all">{show(r.after?.[k])}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {r.ip && <p className="text-[11px] text-muted-foreground pt-2">from {r.ip}</p>}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
            {data.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nothing recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <p className="text-muted-foreground">
          {data.total} entr{data.total === 1 ? "y" : "ies"} · page {data.page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Link href={qs({ page: String(Math.max(1, data.page - 1)) })} aria-disabled={data.page <= 1}>
            <Button variant="outline" size="sm" disabled={data.page <= 1}>Previous</Button>
          </Link>
          <Link href={qs({ page: String(Math.min(totalPages, data.page + 1)) })} aria-disabled={data.page >= totalPages}>
            <Button variant="outline" size="sm" disabled={data.page >= totalPages}>Next</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
