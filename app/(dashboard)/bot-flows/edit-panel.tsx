"use client";

import { useMemo, useState, useTransition } from "react";
import { Braces, Eye, LayoutList, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { updateBotFlowAction } from "@/actions/bot-flows.action";
import { FlowBuilder } from "@/components/flow-builder/flow-builder";
import { FlowPreview } from "@/components/flow-builder/flow-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateBlocks } from "@/lib/block-limits";
import {
  blockIssues, fromEditableBlocks, toEditableBlocks, type EditableBlock,
} from "@/lib/flow-blocks";

type Flow = {
  id: number;
  payload: string;
  label: string | null;
  kind: string;
  enabled: boolean;
  blocks: unknown;
};

type Mode = "visual" | "json" | "preview";

/**
 * The flow editor.
 *
 * Visual is the default: the JSON view exists because a Send API message can be anything Meta
 * supports, but nobody should have to count characters inside a string literal to avoid a silent
 * truncation. Switching to JSON serialises whatever the builder holds, and switching back parses it —
 * so the two views cannot drift, and an edit made in either survives the round trip.
 */
export function EditPanel({ flow, onClose }: { flow: Flow; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("visual");
  const [blocks, setBlocks] = useState<EditableBlock[]>(() => toEditableBlocks(flow.blocks));
  const [json, setJson] = useState(() => JSON.stringify(flow.blocks, null, 2));
  const [label, setLabel] = useState(flow.label ?? "");
  const [kind, setKind] = useState(flow.kind);
  const [enabled, setEnabled] = useState(flow.enabled);
  const [pending, start] = useTransition();

  // The visual builder is the source of truth unless the JSON tab is open, in which case the text is.
  const [jsonDirty, setJsonDirty] = useState(false);

  const effective = useMemo(() => {
    if (mode === "json" && jsonDirty) {
      try {
        return { blocks: JSON.parse(json) as Record<string, unknown>[], parseError: null as string | null };
      } catch (err) {
        return { blocks: null, parseError: (err as Error).message };
      }
    }
    return { blocks: fromEditableBlocks(blocks), parseError: null as string | null };
  }, [mode, jsonDirty, json, blocks]);

  const perBlock = blocks.flatMap((b) => blockIssues(b));
  const serialisedIssues = effective.blocks ? validateBlocks(effective.blocks) : [];
  const blocked = Boolean(effective.parseError) || serialisedIssues.length > 0 || (mode !== "json" && perBlock.length > 0);

  const switchTo = (next: Mode) => {
    if (mode === "json" && jsonDirty && next !== "json") {
      // Adopt the hand-edited JSON into the builder, so the visual view shows what was typed.
      try {
        setBlocks(toEditableBlocks(JSON.parse(json)));
        setJsonDirty(false);
      } catch {
        toast.error("Fix the JSON before leaving this tab");
        return;
      }
    }
    if (next === "json" && !jsonDirty) {
      setJson(JSON.stringify(fromEditableBlocks(blocks), null, 2));
    }
    setMode(next);
  };

  const submit = () =>
    start(async () => {
      if (!effective.blocks) return;
      const fd = new FormData();
      fd.set("id", String(flow.id));
      fd.set("label", label);
      fd.set("kind", kind);
      fd.set("enabled", enabled ? "true" : "false");
      fd.set("blocks", JSON.stringify(effective.blocks));
      const r = await updateBotFlowAction(fd);
      if (r?.success) {
        toast.success("Flow saved — engine cache cleared");
        onClose();
      } else {
        const e = (r as { error?: Record<string, string[]> })?.error;
        toast.error(e?.blocks?.[0] ?? e?._form?.[0] ?? "Could not save that flow");
      }
    });

  const TABS: { key: Mode; label: string; icon: typeof LayoutList }[] = [
    { key: "visual", label: "Builder", icon: LayoutList },
    { key: "preview", label: "Preview", icon: Eye },
    { key: "json", label: "JSON", icon: Braces },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
      <Card className="my-4 w-full max-w-4xl">
        <CardHeader className="gap-3 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-sm">{flow.payload}</span>
          </CardTitle>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bf-label" className="text-xs">Label</Label>
              <Input id="bf-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Usage instructions" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-kind" className="text-xs">Kind</Label>
              <Input id="bf-kind" value={kind} onChange={(e) => setKind(e.target.value)} />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span>
              Enabled
              <span className="block text-xs text-muted-foreground">
                When off, the engine falls through to the content tables, then to search.
              </span>
            </span>
          </label>

          <div className="flex gap-2 border-b pb-2" role="tablist" aria-label="Editor view">
            {TABS.map((t) => (
              <Button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={mode === t.key}
                variant={mode === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => switchTo(t.key)}
              >
                <t.icon className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t.label}
              </Button>
            ))}
            <span className="ml-auto self-center text-xs text-muted-foreground">
              {blocks.length} message{blocks.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {mode === "visual" && <FlowBuilder blocks={blocks} onChange={setBlocks} />}

          {mode === "preview" && <FlowPreview blocks={blocks} />}

          {mode === "json" && (
            <div className="space-y-2">
              <Label htmlFor="bf-blocks" className="text-xs">Messenger blocks (JSON array)</Label>
              <Textarea
                id="bf-blocks"
                value={json}
                onChange={(e) => { setJson(e.target.value); setJsonDirty(true); }}
                rows={18}
                spellCheck={false}
                className="font-mono text-xs"
                aria-invalid={Boolean(effective.parseError) || undefined}
              />
              {effective.parseError && (
                <p className="text-xs text-destructive">Not valid JSON — {effective.parseError}</p>
              )}
            </div>
          )}

          <div aria-live="polite">
            {serialisedIssues.length > 0 ? (
              <ul className="space-y-0.5 text-xs text-destructive">
                {serialisedIssues.slice(0, 6).map((i, n) => (
                  <li key={n}><span className="font-mono">{i.path}</span> — {i.problem}</li>
                ))}
                {serialisedIssues.length > 6 && <li>…and {serialisedIssues.length - 6} more</li>}
              </ul>
            ) : !blocked ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Within Meta&apos;s limits — 20-char button titles, 3 buttons per template, 640-char
                template text.
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
            <Button onClick={submit} disabled={pending || blocked}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
