"use client";

import { BLOCK_LIMITS } from "@/lib/block-limits";
import type { EditableBlock, EditableButton } from "@/lib/flow-blocks";

/**
 * How the flow will actually look in Messenger.
 *
 * Titles are rendered **truncated to Meta's limits**, because that is what students see. Showing the
 * full string here would hide the very problem the editor is trying to surface: a 24-character button
 * title arrives as 20 characters and the author has no idea. Anything cut is marked so it reads as a
 * warning rather than a typo.
 *
 * Deliberately not a phone mock-up — no fake status bar or device frame. The bubbles and their limits
 * are the useful part; drawn chrome is decoration that competes with the content.
 */

const cut = (s: string, max: number) => (s.length > max ? { text: s.slice(0, max), clipped: true } : { text: s, clipped: false });

function ButtonRow({ b, max }: { b: EditableButton; max: number }) {
  const { text, clipped } = cut(b.title || "(untitled)", max);
  return (
    <div
      className={`rounded-md border px-2 py-1.5 text-center text-[13px] ${
        clipped ? "border-destructive/50 text-destructive" : "border-border text-sky-600 dark:text-sky-400"
      }`}
      title={clipped ? `Cut from "${b.title}"` : b.title}
    >
      {text}
      {clipped && <span aria-hidden="true">…</span>}
    </div>
  );
}

export function FlowPreview({ blocks }: { blocks: EditableBlock[] }) {
  if (blocks.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>;
  }

  // Messenger discards buttons past the third rather than wrapping them.
  const anyDropped = blocks.some((b) => b.buttons.length > BLOCK_LIMITS.buttonsPerGroup);

  return (
    <div className="space-y-3">
      {anyDropped && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
          A template with more than {BLOCK_LIMITS.buttonsPerGroup} buttons loses the extras —
          Messenger shows only the first {BLOCK_LIMITS.buttonsPerGroup}. Split them across blocks.
        </p>
      )}

      <div className="space-y-2 rounded-lg bg-muted/30 p-3">
        {blocks.map((b) => {
          if (b.kind === "text") {
            return (
              <Bubble key={b.id}>
                <p className="text-[13px] whitespace-pre-wrap">{b.text || "(empty)"}</p>
              </Bubble>
            );
          }

          if (b.kind === "quickReplies") {
            return (
              <div key={b.id} className="space-y-1.5">
                <Bubble>
                  <p className="text-[13px] whitespace-pre-wrap">{b.text || "(empty)"}</p>
                </Bubble>
                <div className="flex flex-wrap gap-1.5">
                  {b.quickReplies.slice(0, BLOCK_LIMITS.quickReplies).map((q) => {
                    const { text, clipped } = cut(q.title || "(untitled)", BLOCK_LIMITS.quickReplyTitle);
                    return (
                      <span
                        key={q.id}
                        className={`rounded-full border px-2.5 py-1 text-[12px] ${
                          clipped ? "border-destructive/50 text-destructive" : "border-sky-500/50 text-sky-600 dark:text-sky-400"
                        }`}
                      >
                        {text}{clipped && "…"}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (b.kind === "image") {
            return (
              <Bubble key={b.id}>
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote URL, not a known asset
                  <img src={b.imageUrl} alt="" className="max-h-40 rounded-md object-contain" />
                ) : (
                  <p className="text-[13px] text-muted-foreground">(no image URL)</p>
                )}
              </Bubble>
            );
          }

          if (b.kind === "card") {
            return (
              <Bubble key={b.id} className="w-full max-w-[280px] p-0 overflow-hidden">
                {b.card.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote URL
                  <img src={b.card.imageUrl} alt="" className="h-28 w-full object-cover" />
                )}
                <div className="space-y-1 p-2.5">
                  <p className="text-[13px] font-semibold">{cut(b.card.title || "(untitled)", BLOCK_LIMITS.cardTitle).text}</p>
                  {b.card.subtitle && (
                    <p className="text-[12px] text-muted-foreground">{cut(b.card.subtitle, BLOCK_LIMITS.cardTitle).text}</p>
                  )}
                  {b.buttons.slice(0, BLOCK_LIMITS.buttonsPerGroup).map((btn) => (
                    <ButtonRow key={btn.id} b={btn} max={BLOCK_LIMITS.buttonTitle} />
                  ))}
                </div>
              </Bubble>
            );
          }

          if (b.kind === "buttons") {
            return (
              <Bubble key={b.id} className="w-full max-w-[280px]">
                <p className="mb-2 text-[13px] whitespace-pre-wrap">{b.text || "(no header)"}</p>
                <div className="space-y-1">
                  {b.buttons.slice(0, BLOCK_LIMITS.buttonsPerGroup).map((btn) => (
                    <ButtonRow key={btn.id} b={btn} max={BLOCK_LIMITS.buttonTitle} />
                  ))}
                  {b.buttons.length > BLOCK_LIMITS.buttonsPerGroup && (
                    <p className="text-[11px] text-destructive">
                      +{b.buttons.length - BLOCK_LIMITS.buttonsPerGroup} button
                      {b.buttons.length - BLOCK_LIMITS.buttonsPerGroup === 1 ? "" : "s"} not shown
                    </p>
                  )}
                </div>
              </Bubble>
            );
          }

          return (
            <Bubble key={b.id}>
              <p className="text-[12px] text-muted-foreground">Raw JSON message — no visual preview</p>
            </Bubble>
          );
        })}
      </div>
    </div>
  );
}

function Bubble({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-fit max-w-[280px] rounded-2xl rounded-bl-md border bg-card p-2.5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
