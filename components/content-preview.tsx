"use client";

import { AlertTriangle, MessageSquare, Braces } from "lucide-react";

import { buildPreview, MESSENGER_LIMITS, type PreviewInput } from "@/lib/messenger-preview";
import { cn } from "@/lib/utils";

/**
 * Shows both surfaces the content will appear on, side by side, before it is saved:
 * the Messenger bubble the bot sends, and the JSON the app API returns.
 *
 * The point is the limits. Messenger silently cuts a button title at 20 characters and silently
 * discards a 4th button — neither failure is visible until a student sees it.
 */
export function ContentPreview({ input }: { input: PreviewInput }) {
  const ready = input.subjectDisplay && (input.noteTitle || input.topic);
  const preview = ready ? buildPreview(input) : null;

  return (
    <div className="space-y-4">
      {preview && preview.warnings.length > 0 && (
        <ul className="space-y-2">
          {preview.warnings.map((w, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-2 rounded-md border px-3 py-2 text-xs",
                w.level === "error"
                  ? "border-destructive/40 bg-destructive/5 text-destructive"
                  : "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400"
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{w.message}</span>
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="preview-messenger">
        <h3 id="preview-messenger" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          <MessageSquare className="h-3.5 w-3.5" /> Messenger
        </h3>
        <div className="rounded-lg border bg-muted/30 p-3">
          {!preview ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Pick a subject and add a title to see the bubble.
            </p>
          ) : (
            <div className="space-y-2">
              {preview.groups.map((g, i) => (
                <div key={i} className="max-w-[19rem] overflow-hidden rounded-2xl border bg-background shadow-sm">
                  <p className="px-3 py-2 text-sm">{g.header}</p>
                  {g.buttons.map((b, j) => (
                    <div key={j} className="border-t px-3 py-2 text-center text-sm font-medium text-primary">
                      {b.title || <span className="text-muted-foreground italic">untitled</span>}
                    </div>
                  ))}
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                {preview.bubbleCount} separate message{preview.bubbleCount === 1 ? "" : "s"} ·
                titles cut at {MESSENGER_LIMITS.buttonTitle} chars · max {MESSENGER_LIMITS.buttonsPerGroup} buttons
              </p>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="preview-api">
        <h3 id="preview-api" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          <Braces className="h-3.5 w-3.5" /> App API
          {input.subjectSlug && (
            <code className="ml-1 font-mono text-[11px]">
              /app/notes/{input.levelSlug}/{input.subjectSlug}
            </code>
          )}
        </h3>
        <div className="rounded-lg border bg-muted/30 overflow-x-auto">
          <pre className="p-3 text-[11px] leading-relaxed font-mono">
            {preview ? JSON.stringify(preview.apiEntries, null, 2) : "[]"}
          </pre>
        </div>
      </section>
    </div>
  );
}
