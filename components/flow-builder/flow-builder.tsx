"use client";

import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Image, LayoutTemplate, MessageSquare, MousePointerClick, Plus, Braces, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BLOCK_LABELS, newBlock, type BlockKind, type EditableBlock,
} from "@/lib/flow-blocks";

import { BlockNode } from "./block-node";

/**
 * Visual editor for a Messenger flow.
 *
 * Blocks are reordered by dragging, which matters because order *is* the conversation — the bot sends
 * them one after another. dnd-kit is used rather than native HTML5 drag events so the same reordering
 * works with a keyboard (tab to the handle, space, arrows) and on touch; a builder that only responds
 * to a mouse excludes anyone editing on a phone, which is how a lot of this content gets fixed.
 *
 * The JSON escape hatch stays available in the parent: this editor covers the five shapes NoteBot
 * actually uses, and anything else is shown as a raw node rather than being coerced into one of them.
 */

const PALETTE: { kind: BlockKind; icon: typeof MessageSquare; hint: string }[] = [
  { kind: "text", icon: MessageSquare, hint: "A plain message bubble" },
  { kind: "buttons", icon: MousePointerClick, hint: "Up to 3 buttons under a header" },
  { kind: "card", icon: LayoutTemplate, hint: "Image, title and buttons" },
  { kind: "quickReplies", icon: Zap, hint: "Chips above the keyboard" },
  { kind: "image", icon: Image, hint: "A single image" },
  { kind: "raw", icon: Braces, hint: "Hand-written JSON" },
];

export function FlowBuilder({
  blocks,
  onChange,
}: {
  blocks: EditableBlock[];
  onChange: (next: EditableBlock[]) => void;
}) {
  const sensors = useSensors(
    // A small distance threshold so a click on an input inside a node is not read as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(blocks, from, to));
  };

  const patch = (id: string, next: EditableBlock) =>
    onChange(blocks.map((b) => (b.id === id ? next : b)));

  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));

  const duplicate = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id);
    if (i < 0) return;
    // Re-derive through newBlock's id counter so the copy gets its own drag identity.
    const copy: EditableBlock = { ...blocks[i], id: `${blocks[i].id}-copy-${blocks.length}` };
    onChange([...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)]);
  };

  const move = (id: string, delta: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    onChange(arrayMove(blocks, i, j));
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-3">
            {blocks.map((block, i) => (
              <BlockNode
                key={block.id}
                block={block}
                index={i}
                total={blocks.length}
                onChange={(next) => patch(block.id, next)}
                onRemove={() => remove(block.id)}
                onDuplicate={() => duplicate(block.id)}
                onMove={(d) => move(block.id, d)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No messages yet. Add one below — the bot sends them in order.
        </p>
      )}

      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add a message
        </p>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map(({ kind, icon: Icon, hint }) => (
            <Button
              key={kind}
              type="button"
              variant="outline"
              size="sm"
              title={hint}
              onClick={() => onChange([...blocks, newBlock(kind)])}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {BLOCK_LABELS[kind]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
