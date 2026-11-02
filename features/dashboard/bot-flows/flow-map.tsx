import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Background, Controls, Handle, Position, ReactFlow, ReactFlowProvider, useReactFlow,
  type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, CircleSlash, Link2Off, PencilLine, X } from "lucide-react";

import { getBotFlowAction, getFlowMapAction } from "@/actions/bot-flows.action";
import type { FlowMap, FlowNode, FlowEdge, Family } from "@/services/flow-map.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditPanel } from "./edit-panel";

/* ------------------------------------------------------------------ model */

const FAMILY_LABEL: Record<Family, [string, string]> = {
  topic: ["topic", "topics"], subject: ["subject", "subjects"], level: ["level", "levels"],
  lab: ["lab page", "lab pages"], routine: ["routine", "routines"], qb: ["question bank", "question banks"],
  syllabus: ["syllabus", "syllabuses"],
};
/** Kinds whose flows are content addresses; hundreds of them, so hidden from the overview. */
const BULK_KINDS = new Set(["subject", "lab"]);

type FlowData = { kind: "flow"; node: FlowNode; broken: number; selected: boolean; dim: boolean };
type GroupData = { kind: "group"; family: Family; count: number; empty: number; targets: FlowEdge[]; dim: boolean };
type BrokenData = { kind: "broken"; payload: string; disabledFlow: boolean; dim: boolean };
type MapNode = Node<FlowData | GroupData | BrokenData>;

const W = { flow: 216, group: 176, broken: 196 };
const H = { flow: 58, group: 44, broken: 44 };

/** Flows with no link in or out among the shown kinds. Laid out, they stack into one tall column. */
function isolatedFlows(map: FlowMap, showBulk: boolean) {
  const shown = new Set(map.nodes.filter((n) => showBulk || !BULK_KINDS.has(n.kind)).map((n) => n.payload));
  const linked = new Set<string>();
  for (const e of map.edges) {
    if (!shown.has(e.source)) continue;
    if (e.state.kind !== "flow") linked.add(e.source);
    else if (shown.has(e.target) && e.target !== e.source) { linked.add(e.source); linked.add(e.target); }
  }
  return new Set([...shown].filter((p) => !linked.has(p)));
}

function buildGraph(map: FlowMap, showBulk: boolean, showIsolated: boolean, selected: string | null) {
  const isolated = isolatedFlows(map, showBulk);
  const visible = new Set(
    map.nodes
      .filter((n) => showBulk || !BULK_KINDS.has(n.kind))
      .filter((n) => showIsolated || !isolated.has(n.payload) || n.payload === selected)
      .map((n) => n.payload),
  );
  const brokenCount = new Map<string, number>();
  for (const e of map.edges) if (e.state.kind === "broken") brokenCount.set(e.source, (brokenCount.get(e.source) ?? 0) + 1);

  // Neighbourhood of the selection, so the rest of the graph can recede.
  const near = new Set<string>();
  if (selected) {
    near.add(selected);
    for (const e of map.edges) {
      if (e.source === selected) near.add(e.state.kind === "flow" ? e.target : `${e.source}::${e.state.kind === "resolved" ? e.state.family : "broken:" + e.target}`);
      if (e.target === selected) near.add(e.source);
    }
  }
  const dim = (id: string) => !!selected && !near.has(id);

  const nodes: MapNode[] = [];
  const edges: Edge[] = [];
  for (const n of map.nodes) {
    if (!visible.has(n.payload)) continue;
    nodes.push({
      id: n.payload, type: "flow", position: { x: 0, y: 0 },
      data: { kind: "flow", node: n, broken: brokenCount.get(n.payload) ?? 0, selected: n.payload === selected, dim: dim(n.payload) },
    });
  }

  const groups = new Map<string, GroupData & { source: string }>();
  const brokenNodes = new Set<string>();
  for (const e of map.edges) {
    if (!visible.has(e.source)) continue;
    if (e.state.kind === "flow") {
      if (!visible.has(e.target) || e.target === e.source) continue;
      edges.push({ id: `${e.source}->${e.target}:${e.title}`, source: e.source, target: e.target, className: cn("fm-edge", dim(e.source) && dim(e.target) && "fm-dim") });
    } else if (e.state.kind === "resolved") {
      const id = `${e.source}::${e.state.family}`;
      const g = groups.get(id) ?? { kind: "group" as const, family: e.state.family, count: 0, empty: 0, targets: [], dim: dim(id), source: e.source };
      g.count++;
      if (e.state.empty) g.empty++;
      g.targets.push(e);
      groups.set(id, g);
    } else {
      const id = `${e.source}::broken:${e.target}`;
      if (!brokenNodes.has(id)) {
        brokenNodes.add(id);
        nodes.push({ id, type: "broken", position: { x: 0, y: 0 }, data: { kind: "broken", payload: e.target, disabledFlow: e.state.disabledFlow, dim: dim(id) } });
        edges.push({ id: `${e.source}->${id}`, source: e.source, target: id, label: e.title, className: cn("fm-edge fm-edge-broken", dim(id) && "fm-dim") });
      }
    }
  }
  for (const [id, g] of groups) {
    nodes.push({ id, type: "content", position: { x: 0, y: 0 }, data: g });
    edges.push({ id: `${g.source}->${id}`, source: g.source, target: id, className: cn("fm-edge fm-edge-content", g.dim && "fm-dim") });
  }

  // Left-to-right layered layout.
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 14, ranksep: 70, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of nodes) g.setNode(n.id, { width: W[n.data.kind], height: H[n.data.kind] });
  for (const e of edges) g.setEdge(e.source, e.target);
  dagre.layout(g);
  for (const n of nodes) {
    const p = g.node(n.id);
    n.position = { x: p.x - W[n.data.kind] / 2, y: p.y - H[n.data.kind] / 2 };
  }
  return { nodes, edges };
}

/* ------------------------------------------------------------------ nodes */

const FlowNodeView = memo(function FlowNodeView({ data }: NodeProps<Node<FlowData>>) {
  const n = data.node;
  return (
    <div
      className={cn(
        "fm-node w-[216px] rounded-md border bg-card px-2.5 py-1.5 shadow-xs",
        !n.enabled && "border-dashed opacity-70",
        data.broken > 0 && "border-destructive/60",
        data.selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        data.dim && "opacity-35",
      )}
    >
      <Handle type="target" position={Position.Left} className="fm-handle" />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[11.5px] font-medium">{n.payload}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">{n.kind}</span>
      </div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span className="truncate">{n.label || `${n.blockCount} block${n.blockCount === 1 ? "" : "s"}`}</span>
        {!n.enabled && <span className="ml-auto shrink-0 text-[10.5px]">disabled</span>}
        {data.broken > 0 && <span className="ml-auto shrink-0 font-mono text-[10.5px] text-destructive">{data.broken} broken</span>}
        {n.orphan && !data.broken && <span className="ml-auto shrink-0 font-mono text-[10.5px] text-warning">no links in</span>}
      </div>
      <Handle type="source" position={Position.Right} className="fm-handle" />
    </div>
  );
});

const GroupNodeView = memo(function GroupNodeView({ data }: NodeProps<Node<GroupData>>) {
  const [one, many] = FAMILY_LABEL[data.family];
  return (
    <div className={cn("w-[176px] rounded-md border border-dashed bg-muted/60 px-2.5 py-1.5", data.dim && "opacity-35")}>
      <Handle type="target" position={Position.Left} className="fm-handle" />
      <p className="text-[12px] font-medium">
        {data.count} {data.count === 1 ? one : many}
      </p>
      <p className="font-mono text-[10.5px] text-muted-foreground">
        resolved live{data.empty ? <span className="text-warning"> · {data.empty} empty</span> : null}
      </p>
    </div>
  );
});

const BrokenNodeView = memo(function BrokenNodeView({ data }: NodeProps<Node<BrokenData>>) {
  return (
    <div className={cn("w-[196px] rounded-md border border-destructive/60 bg-destructive/8 px-2.5 py-1.5", data.dim && "opacity-35")}>
      <Handle type="target" position={Position.Left} className="fm-handle" />
      <p className="truncate font-mono text-[11.5px] font-medium text-destructive">{data.payload}</p>
      <p className="text-[10.5px] text-muted-foreground">{data.disabledFlow ? "flow disabled, nothing else answers" : "nothing answers · falls to search"}</p>
    </div>
  );
});

const nodeTypes = { flow: FlowNodeView, content: GroupNodeView, broken: BrokenNodeView };

/* ------------------------------------------------------------------ view */

function Stat({ label, value, tone }: { label: string; value: number; tone?: "bad" | "warn" }) {
  return (
    <div className="min-w-0">
      <p className={cn("text-[18px] leading-none font-semibold tabular-nums", tone === "bad" && value && "text-destructive", tone === "warn" && value && "text-warning")}>{value}</p>
      <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.05em] text-muted-foreground">{label}</p>
    </div>
  );
}

function StateIcon({ e }: { e: FlowEdge }) {
  if (e.state.kind === "broken") return <Link2Off className="h-3.5 w-3.5 shrink-0 text-destructive" aria-label="Broken" />;
  if (e.state.kind === "resolved" && e.state.empty) return <CircleSlash className="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Empty page" />;
  return <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />;
}

function describe(e: FlowEdge) {
  if (e.state.kind === "flow") return "flow";
  if (e.state.kind === "broken") return e.state.disabledFlow ? "disabled flow" : "nothing answers";
  return `${FAMILY_LABEL[e.state.family][0]}${e.state.empty ? " · empty" : ""}`;
}

function Canvas({ initial }: { initial: FlowMap }) {
  const [map, setMap] = useState(initial);
  const [showBulk, setShowBulk] = useState(false);
  const [showIsolated, setShowIsolated] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [focusOn, setFocusOn] = useState<string | null>(null);
  const [editing, setEditing] = useState<Parameters<typeof EditPanel>[0]["flow"] | null>(null);
  const { resolvedTheme } = useTheme();
  const { fitView, setCenter, getNode } = useReactFlow();

  const graph = useMemo(() => buildGraph(map, showBulk, showIsolated, selected), [map, showBulk, showIsolated, selected]);
  const isolatedCount = useMemo(() => isolatedFlows(map, showBulk).size, [map, showBulk]);
  const byPayload = useMemo(() => new Map(map.nodes.map((n) => [n.payload, n])), [map]);
  const sel = selected ? byPayload.get(selected) : undefined;
  const out = useMemo(() => map.edges.filter((e) => e.source === selected), [map, selected]);

  // Refit when the set of shown flows changes (after React Flow has measured the new nodes).
  useEffect(() => {
    const id = setTimeout(() => void fitView({ padding: 0.12, duration: 200 }), 30);
    return () => clearTimeout(id);
  }, [showBulk, showIsolated, fitView]);

  // Centre on a node picked from a list, once it has been laid out.
  useEffect(() => {
    if (!focusOn) return;
    const id = setTimeout(() => {
      const rf = getNode(focusOn);
      if (rf) void setCenter(rf.position.x + W.flow / 2, rf.position.y + H.flow / 2, { zoom: 1.1, duration: 250 });
      setFocusOn(null);
    }, 30);
    return () => clearTimeout(id);
  }, [focusOn, graph, getNode, setCenter]);

  const focus = useCallback((payload: string) => {
    const n = byPayload.get(payload);
    if (n && BULK_KINDS.has(n.kind)) setShowBulk(true);
    setSelected(payload);
    setFocusOn(payload);
  }, [byPayload]);

  const openEditor = async (flowId: number) => {
    const row = await getBotFlowAction(flowId);
    if (!row) return toast.error("Could not load that flow");
    setEditing(row as Parameters<typeof EditPanel>[0]["flow"]);
  };

  const closeEditor = async () => {
    setEditing(null);
    const next = await getFlowMapAction();
    if (next) setMap(next);
  };

  const live = new Set(map.nodes.filter((n) => n.enabled).map((n) => n.payload));
  const broken = map.edges.filter((e) => e.state.kind === "broken" && live.has(e.source));
  const empty = map.edges.filter((e) => e.state.kind === "resolved" && e.state.empty && live.has(e.source));
  const orphans = map.nodes.filter((n) => n.orphan);
  const shadowing = map.nodes.filter((n) => n.shadows);

  return (
    <div className="grid h-[calc(100dvh-170px)] min-h-[520px] overflow-hidden rounded-lg border bg-card lg:grid-cols-[264px_minmax(0,1fr)]">
      {/* ---- Issues rail ---- */}
      <aside className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0" aria-label="Map summary and issues">
        <div className="grid grid-cols-3 gap-3 border-b p-3.5">
          <Stat label="Flows" value={map.summary.flows} />
          <Stat label="Links" value={map.summary.links} />
          <Stat label="Broken" value={map.summary.broken} tone="bad" />
          <Stat label="Empty" value={map.summary.empty} tone="warn" />
          <Stat label="No links in" value={map.summary.orphans} tone="warn" />
          <Stat label="Shadowing" value={map.summary.shadowing} tone="warn" />
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3.5 text-[12.5px]">
          <IssueList
            title="Broken links"
            hint="A student taps these and gets a search result instead of the page."
            empty="Every button leads somewhere."
            items={broken.map((e) => ({ key: `${e.source}${e.target}${e.title}`, payload: e.source, line: <>“{e.title}” → <span className="text-destructive">{e.target}</span></> }))}
            onPick={focus}
          />
          {empty.length > 0 && (
            <IssueList
              title="Links to empty pages"
              hint="The page exists but has nothing filed under it yet."
              items={empty.map((e) => ({ key: `${e.source}${e.target}${e.title}`, payload: e.source, line: <>“{e.title}” → {e.target}</> }))}
              onPick={focus}
            />
          )}
          <IssueList
            title="No links in"
            hint="No flow links here and it is not a content address. Keyword replies in the engine may still use it; check before retiring."
            items={orphans.map((n) => ({ key: n.payload, payload: n.payload, line: <span className="text-muted-foreground">{n.kind}</span> }))}
            onPick={focus}
            collapsed
          />
          <IssueList
            title="Hiding live content"
            hint="Answered by this flow before the matching topic or subject, so notes added there do not show in the bot."
            items={shadowing.map((n) => ({ key: n.payload, payload: n.payload, line: <span className="text-muted-foreground">shadows a {n.shadows}</span> }))}
            onPick={focus}
            collapsed
          />
        </div>
      </aside>

      {/* ---- Canvas + inspector ---- */}
      <div className="relative min-h-0">
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-[12.5px] shadow-xs">
            <input type="checkbox" checked={showBulk} onChange={(e) => setShowBulk(e.target.checked)} className="accent-[var(--primary)]" />
            Subject and lab flows
            <span className="font-mono text-[11px] text-muted-foreground">{map.nodes.filter((n) => BULK_KINDS.has(n.kind)).length}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-[12.5px] shadow-xs">
            <input type="checkbox" checked={showIsolated} onChange={(e) => setShowIsolated(e.target.checked)} className="accent-[var(--primary)]" />
            Unlinked flows
            <span className="font-mono text-[11px] text-muted-foreground">{isolatedCount}</span>
          </label>
        </div>
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.1}
          maxZoom={1.75}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          onlyRenderVisibleElements
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, n) => {
            if (n.type === "flow") setSelected(n.id);
            else setSelected(n.id.split("::")[0]);
          }}
          onPaneClick={() => setSelected(null)}
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} position="bottom-left" />
        </ReactFlow>

        {sel && (
          <aside
            aria-label={`Flow ${sel.payload}`}
            className="absolute top-3 right-3 bottom-3 z-10 flex w-[300px] max-w-[calc(100%-24px)] flex-col overflow-hidden rounded-lg border bg-card shadow-lg"
          >
            <header className="flex items-start justify-between gap-2 border-b px-3.5 py-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-[12.5px] font-medium">{sel.payload}</p>
                <p className="truncate text-[12.5px] text-muted-foreground">
                  {sel.label || "No label"} · {sel.kind} · {sel.blockCount} block{sel.blockCount === 1 ? "" : "s"}
                  {!sel.enabled && " · disabled"}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => setSelected(null)}>
                <X />
              </Button>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3.5 py-3 text-[12.5px]">
              {sel.shadows && (
                <p className="flex gap-2 rounded-md border border-warning/40 bg-warning/10 px-2.5 py-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
                  Answers before the matching {sel.shadows}, so its live notes are hidden.
                </p>
              )}
              <section>
                <h3 className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Links out · {out.length}</h3>
                {out.length === 0 ? (
                  <p className="text-muted-foreground">No buttons or quick replies.</p>
                ) : (
                  <ul className="space-y-1">
                    {out.map((e) => (
                      <li key={`${e.target}${e.title}`} className="flex items-center gap-2">
                        <StateIcon e={e} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{e.title}</span>
                          {e.state.kind === "flow" ? (
                            <button className="block max-w-full truncate font-mono text-[11px] text-primary hover:underline" onClick={() => focus(e.target)}>{e.target}</button>
                          ) : (
                            <span className={cn("block truncate font-mono text-[11px]", e.state.kind === "broken" ? "text-destructive" : "text-muted-foreground")}>
                              {e.target} · {describe(e)}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Linked from · {sel.incoming.length}</h3>
                {sel.incoming.length === 0 ? (
                  <p className="text-muted-foreground">{sel.orphan ? "Nothing links here." : "Reached as a content address or entry point."}</p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {sel.incoming.map((p) => (
                      <li key={p}>
                        <button className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] hover:border-muted-foreground/50" onClick={() => focus(p)}>{p}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
            <footer className="border-t p-3">
              <Button className="w-full" onClick={() => openEditor(sel.flowId)}>
                <PencilLine /> Open in editor
              </Button>
            </footer>
          </aside>
        )}
      </div>

      {editing && <EditPanel flow={editing} onClose={closeEditor} />}
    </div>
  );
}

function IssueList({
  title, hint, items, onPick, empty, collapsed,
}: {
  title: string;
  hint: string;
  items: { key: string; payload: string; line: React.ReactNode }[];
  onPick: (payload: string) => void;
  empty?: string;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);
  const shown = open ? items : items.slice(0, 0);
  return (
    <section>
      <button className="flex w-full items-baseline justify-between gap-2 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{title}</h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{items.length} {open ? "−" : "+"}</span>
      </button>
      {open && <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{items.length ? hint : empty ?? hint}</p>}
      {shown.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {shown.map((it) => (
            <li key={it.key}>
              <button onClick={() => onPick(it.payload)} className="w-full rounded px-1.5 py-1 text-left hover:bg-muted">
                <span className="block truncate font-mono text-[11.5px]">{it.payload}</span>
                <span className="block truncate text-[11.5px]">{it.line}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FlowMapView({ map }: { map: FlowMap }) {
  return (
    <ReactFlowProvider>
      <Canvas initial={map} />
    </ReactFlowProvider>
  );
}
