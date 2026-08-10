"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle, ChevronDown, ChevronUp, Copy, GripVertical, Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLOCK_LIMITS } from "@/lib/block-limits";
import {
  BLOCK_LABELS, blockIssues, newButton, type EditableBlock, type EditableButton,
} from "@/lib/flow-blocks";

/**
 * One message in the flow: a draggable card with fields for its own shape.
 *
 * Every text input shows a live character count against Meta's limit for that field, because the
 * limits are the whole reason this editor exists — a 21-character button title is not rejected by
 * Messenger, it is silently cut, and the author never finds out.
 */

const KIND_TINT: Record<string, string> = {
  text: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
  buttons: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  card: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
  quickReplies: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  image: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
  raw: "bg-muted text-muted-foreground",
};

/** Character counter that turns destructive at the limit rather than only past it. */
function Count({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  const near = !over && value.length >= max - 2;
  return (
    <span
      className={
        over ? "text-destructive font-medium" : near ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      }
    >
      {value.length}/{max}
    </span>
  );
}

export function BlockNode({
  block, index, total, onChange, onRemove, onDuplicate, onMove,
}: {
  block: EditableBlock;
  index: number;
  total: number;
  onChange: (next: EditableBlock) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (delta: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const issues = blockIssues(block);
  const set = (patch: Partial<EditableBlock>) => onChange({ ...block, ...patch });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border bg-card ${isDragging ? "z-10 opacity-90 shadow-lg" : ""} ${
        issues.length ? "border-destructive/50" : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b px-2 py-1.5">
        {/* The handle is a real button so keyboard users can pick the block up: focus it, press
            space, then use the arrow keys. dnd-kit announces the move to screen readers. */}
        <button
          type="button"
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
          aria-label={`Reorder message ${index + 1}. Press space, then use the arrow keys.`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="text-xs font-medium text-muted-foreground tabular-nums">{index + 1}</span>
        <Badge variant="outline" className={`text-[10px] ${KIND_TINT[block.kind] ?? ""}`}>
          {BLOCK_LABELS[block.kind]}
        </Badge>

        {issues.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {issues.length}
          </span>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => onMove(-1)}
            disabled={index === 0} aria-label="Move up">
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => onMove(1)}
            disabled={index === total - 1} aria-label="Move down">
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onDuplicate} aria-label="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}
            aria-label="Delete message" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 p-3">
        {(block.kind === "text" || block.kind === "quickReplies") && (
          <Field
            label="Message"
            hint={<Count value={block.text} max={BLOCK_LIMITS.text} />}
          >
            <Textarea value={block.text} onChange={(e) => set({ text: e.target.value })} rows={3} />
          </Field>
        )}

        {block.kind === "buttons" && (
          <Field
            label="Header text"
            hint={<Count value={block.text} max={BLOCK_LIMITS.templateText} />}
          >
            <Input value={block.text} onChange={(e) => set({ text: e.target.value })} placeholder="Choose -" />
          </Field>
        )}

        {block.kind === "image" && (
          <Field label="Image URL">
            <Input value={block.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })}
              placeholder="https://…" inputMode="url" />
          </Field>
        )}

        {block.kind === "card" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" hint={<Count value={block.card.title} max={BLOCK_LIMITS.cardTitle} />}>
              <Input value={block.card.title}
                onChange={(e) => set({ card: { ...block.card, title: e.target.value } })} />
            </Field>
            <Field label="Subtitle" hint={<Count value={block.card.subtitle} max={BLOCK_LIMITS.cardTitle} />}>
              <Input value={block.card.subtitle}
                onChange={(e) => set({ card: { ...block.card, subtitle: e.target.value } })} />
            </Field>
            <Field label="Image URL">
              <Input value={block.card.imageUrl} inputMode="url"
                onChange={(e) => set({ card: { ...block.card, imageUrl: e.target.value } })} />
            </Field>
            <Field label="Tap-through URL">
              <Input value={block.card.defaultUrl} inputMode="url"
                onChange={(e) => set({ card: { ...block.card, defaultUrl: e.target.value } })} />
            </Field>
          </div>
        )}

        {(block.kind === "buttons" || block.kind === "card") && (
          <ButtonList
            label="Buttons"
            max={BLOCK_LIMITS.buttonsPerGroup}
            titleMax={BLOCK_LIMITS.buttonTitle}
            items={block.buttons}
            onChange={(buttons) => set({ buttons })}
            allowWebUrl
          />
        )}

        {block.kind === "quickReplies" && (
          <ButtonList
            label="Quick replies"
            max={BLOCK_LIMITS.quickReplies}
            titleMax={BLOCK_LIMITS.quickReplyTitle}
            items={block.quickReplies}
            onChange={(quickReplies) => set({ quickReplies })}
            allowWebUrl={false}
          />
        )}

        {block.kind === "raw" && (
          <Field label="Message JSON">
            {/* Shown for shapes this editor does not model — carousels, or anything Meta adds. The
                original is written back untouched, so nothing is lost by not understanding it. */}
            <Textarea value={block.raw} onChange={(e) => set({ raw: e.target.value })}
              rows={8} spellCheck={false} className="font-mono text-xs" />
          </Field>
        )}

        {issues.length > 0 && (
          <ul className="space-y-0.5 text-xs text-destructive" aria-live="polite">
            {issues.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        )}
      </div>
    </li>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        {hint && <span className="text-[11px] tabular-nums">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/**
 * Buttons and quick replies, both of which are ordered lists of {title, target}.
 *
 * Reordering here uses explicit up/down controls rather than a second nested DnD context: nesting
 * sortables inside a sortable makes both ambiguous to point at, and a button list is short enough
 * that two clicks is no worse than a drag.
 */
function ButtonList({
  label, items, max, titleMax, onChange, allowWebUrl,
}: {
  label: string;
  items: EditableButton[];
  max: number;
  titleMax: number;
  onChange: (next: EditableButton[]) => void;
  allowWebUrl: boolean;
}) {
  const patch = (id: string, next: Partial<EditableButton>) =>
    onChange(items.map((b) => (b.id === id ? { ...b, ...next } : b)));

  const swap = (i: number, j: number) => {
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        <span className={`text-[11px] tabular-nums ${items.length > max ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {items.length}/{max}
        </span>
      </div>

      {items.map((b, i) => (
        <div key={b.id} className="space-y-2 rounded-md border bg-muted/20 p-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground tabular-nums">{i + 1}</span>
            {allowWebUrl && (
              <div className="flex gap-1">
                {(["web_url", "postback"] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={b.type === t ? "default" : "outline"}
                    className="h-6 px-2 text-[11px]"
                    onClick={() => patch(b.id, { type: t })}
                  >
                    {t === "web_url" ? "Link" : "Postback"}
                  </Button>
                ))}
              </div>
            )}
            <div className="ml-auto flex gap-0.5">
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => swap(i, i - 1)}
                disabled={i === 0} aria-label={`Move ${label} ${i + 1} up`}>
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => swap(i, i + 1)}
                disabled={i === items.length - 1} aria-label={`Move ${label} ${i + 1} down`}>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm"
                onClick={() => onChange(items.filter((x) => x.id !== b.id))}
                aria-label={`Remove ${label} ${i + 1}`} className="text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Title" hint={<Count value={b.title} max={titleMax} />}>
              <Input value={b.title} onChange={(e) => patch(b.id, { title: e.target.value })}
                className="h-8" aria-invalid={b.title.length > titleMax || undefined} />
            </Field>
            {b.type === "web_url" ? (
              <Field label="URL">
                <Input value={b.url} inputMode="url" className="h-8"
                  onChange={(e) => patch(b.id, { url: e.target.value })} placeholder="https://…" />
              </Field>
            ) : (
              <Field label="Payload">
                <Input value={b.payload} className="h-8 font-mono text-xs"
                  onChange={(e) => patch(b.id, { payload: e.target.value })} placeholder="math1_flow" />
              </Field>
            )}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={items.length >= max}
        onClick={() => onChange([...items, newButton(allowWebUrl ? "web_url" : "postback")])}
      >
        Add {label.replace(/s$/, "").toLowerCase()}
      </Button>
    </div>
  );
}
