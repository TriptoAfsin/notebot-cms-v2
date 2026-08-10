"use client";

import { useEffect, useState } from "react";

import {
  getSubjectContextAction,
  getTopicContextAction,
  type PreviewContext,
} from "@/actions/preview.action";
import { ContentPreview } from "@/components/content-preview";

/**
 * Drop-in preview for the per-entity note and topic forms.
 *
 * Those forms hold only a parent id, so the ancestry needed to build a route is fetched here
 * rather than shipped to the client. Until this existed the preview lived solely on
 * /content/new, which meant every edit made through the tables — the pencil icon, which is the
 * primary edit path — was still blind to Messenger's truncation.
 */
export function LivePreview(
  props:
    | { kind: "note"; topicId: string; title: string; url: string }
    // slug is taken from the form rather than the DB: on the create page the topic does not
    // exist yet, and on the edit sheet the slug may have been changed but not saved. Either way
    // the previewed route should be the one this submit will produce.
    | { kind: "topic"; subjectId: string; displayName: string; slug?: string }
) {
  const parentId = props.kind === "note" ? props.topicId : props.subjectId;
  const [ctx, setCtx] = useState<PreviewContext | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    const id = Number(parentId);
    // the state update stays inside the async continuation — setting it synchronously in the
    // effect body triggers a cascading render (react-hooks/set-state-in-effect)
    (async () => {
      if (!id) {
        if (live) { setCtx(null); setLoading(false); }
        return;
      }
      if (live) setLoading(true);
      const next = props.kind === "note"
        ? await getTopicContextAction(id)
        : await getSubjectContextAction(id);
      if (live) { setCtx(next); setLoading(false); }
    })();
    return () => { live = false; };
  }, [parentId, props.kind]);

  if (!parentId) {
    return (
      <p className="text-xs text-muted-foreground">
        Pick a {props.kind === "note" ? "topic" : "subject"} to preview how this will look.
      </p>
    );
  }
  if (loading && !ctx) {
    return <p className="text-xs text-muted-foreground">Loading preview…</p>;
  }
  if (!ctx) {
    return <p className="text-xs text-muted-foreground">That parent no longer exists.</p>;
  }

  return (
    <ContentPreview
      input={{
        levelSlug: ctx.levelSlug,
        subjectSlug: ctx.subjectSlug,
        subjectDisplay: ctx.subjectDisplay,
        // A note hangs off its topic. A topic IS the entry on the subject page, so it previews
        // as its own button rather than as a note inside itself.
        topic:
          props.kind === "note"
            ? { slug: ctx.topicSlug ?? "", display: ctx.topicDisplay ?? "" }
            : { slug: props.slug ?? "", display: props.displayName },
        noteTitle: props.kind === "note" ? props.title : props.displayName,
        noteUrl: props.kind === "note" ? props.url : "",
        previewOf: props.kind,
      }}
    />
  );
}
