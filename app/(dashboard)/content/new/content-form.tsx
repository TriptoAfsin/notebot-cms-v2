"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createContentAction,
  getSubjectsForLevelAction,
  getTopicsForSubjectAction,
} from "@/actions/content.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/searchable-select";
import { cn } from "@/lib/utils";
import { ContentPreview } from "@/components/content-preview";

type Level = { id: number; displayName: string; slug: string };
type Option = { id: number; displayName: string; slug: string };
type Errors = Record<string, string[] | undefined>;

/** Mirrors the slug rule the action enforces, so the field can be filled in automatically. */
const toSlug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 50);

function FieldError({ errors, name }: { errors: Errors; name: string }) {
  const msg = errors[name]?.[0];
  if (!msg) return null;
  return <p className="text-xs text-destructive">{msg}</p>;
}

/** Declared at module scope — a component created during render remounts on every keystroke
 *  and loses its state (react-hooks/static-components). */
function Segmented<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-md border p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ContentForm({ levels }: { levels: Level[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  const [levelId, setLevelId] = useState("");
  const [subjectMode, setSubjectMode] = useState<"existing" | "new">("existing");
  const [subjectId, setSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectSlug, setSubjectSlug] = useState("");
  const [subjectSlugTouched, setSubjectSlugTouched] = useState(false);

  const [topicMode, setTopicMode] = useState<"existing" | "new" | "none">("existing");
  const [topicId, setTopicId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicSlug, setTopicSlug] = useState("");
  const [topicSlugTouched, setTopicSlugTouched] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const [subjects, setSubjects] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);

  // Each step is scoped to its parent — the old pickers serialized every row in the database
  // into the client bundle. The state update stays inside the async continuation; setting it
  // synchronously in the effect body triggers a cascading render.
  useEffect(() => {
    let live = true;
    (async () => {
      const rows = levelId ? await getSubjectsForLevelAction(Number(levelId)) : [];
      if (live) setSubjects(rows as Option[]);
    })();
    return () => { live = false; };
  }, [levelId]);

  useEffect(() => {
    let live = true;
    (async () => {
      const rows = subjectId && subjectMode !== "new"
        ? await getTopicsForSubjectAction(Number(subjectId))
        : [];
      if (live) setTopics(rows as Option[]);
    })();
    return () => { live = false; };
  }, [subjectId, subjectMode]);

  // derive slugs until the editor overrides them
  if (!subjectSlugTouched && subjectMode === "new" && toSlug(subjectName) !== subjectSlug) {
    setSubjectSlug(toSlug(subjectName));
  }
  if (!topicSlugTouched && topicMode === "new" && toSlug(topicName) !== topicSlug) {
    setTopicSlug(toSlug(topicName));
  }

  const level = levels.find((l) => String(l.id) === levelId);
  const chosenSubject = subjects.find((s) => String(s.id) === subjectId);
  const chosenTopic = topics.find((t) => String(t.id) === topicId);

  const previewInput = {
    levelSlug: level?.slug ?? "?",
    subjectSlug: subjectMode === "new" ? subjectSlug : chosenSubject?.slug ?? "",
    subjectDisplay: subjectMode === "new" ? subjectName : chosenSubject?.displayName ?? "",
    topic:
      topicMode === "none"
        ? null
        : topicMode === "new"
          ? { slug: topicSlug, display: topicName }
          : chosenTopic
            ? { slug: chosenTopic.slug, display: chosenTopic.displayName }
            : null,
    noteTitle: title,
    noteUrl: url,
  };

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createContentAction(formData);
      if (result?.success) {
        toast.success("Content added");
        router.push("/notes");
        return;
      }
      const fieldErrors = (result?.error ?? {}) as Errors;
      setErrors(fieldErrors);
      toast.error(fieldErrors._form?.[0] ?? "Check the highlighted fields");
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] items-start">
      <Card>
        <CardHeader><CardTitle>Add content</CardTitle></CardHeader>
        <CardContent>
          <form action={submit} className="space-y-5">
            {errors._form?.[0] && (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errors._form[0]}
              </p>
            )}

            <div className="space-y-2">
              <Label>Level</Label>
              <SearchableSelect
                name="levelId"
                value={levelId}
                onValueChange={(v) => { setLevelId(v); setSubjectId(""); setTopicId(""); }}
                options={levels.map((l) => ({ value: String(l.id), label: l.displayName }))}
                placeholder="Select a level"
                invalid={!!errors.levelId}
              />
              <FieldError errors={errors} name="levelId" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subject</Label>
                <Segmented
                  value={subjectMode}
                  onChange={(v) => { setSubjectMode(v); setSubjectId(""); setTopicId(""); }}
                  options={[{ value: "existing", label: "Existing" }, { value: "new", label: "New" }]}
                />
              </div>
              <input type="hidden" name="subjectMode" value={subjectMode} />
              {subjectMode === "existing" ? (
                <>
                  <SearchableSelect
                    name="subjectId"
                    value={subjectId}
                    onValueChange={(v) => { setSubjectId(v); setTopicId(""); }}
                    options={subjects.map((s) => ({ value: String(s.id), label: `${s.displayName}  ·  ${s.slug}` }))}
                    placeholder={levelId ? "Select a subject" : "Pick a level first"}
                    emptyMessage="No subjects in this level yet — switch to New"
                    disabled={!levelId}
                    invalid={!!errors.subjectId}
                  />
                  <FieldError errors={errors} name="subjectId" />
                </>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Input name="subjectName" value={subjectName} placeholder="Fundamental of Polymer Chemistry"
                      onChange={(e) => setSubjectName(e.target.value)} aria-invalid={!!errors.subjectName || undefined} />
                    <FieldError errors={errors} name="subjectName" />
                  </div>
                  <div className="space-y-1">
                    <Input name="subjectSlug" value={subjectSlug} placeholder="fpc"
                      onChange={(e) => { setSubjectSlugTouched(true); setSubjectSlug(e.target.value); }}
                      aria-invalid={!!errors.subjectSlug || undefined} className="font-mono text-xs" />
                    <FieldError errors={errors} name="subjectSlug" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Topic</Label>
                <Segmented
                  value={topicMode}
                  onChange={(v) => { setTopicMode(v); setTopicId(""); }}
                  options={[
                    { value: "existing", label: "Existing" },
                    { value: "new", label: "New" },
                    { value: "none", label: "Subject link" },
                  ]}
                />
              </div>
              <input type="hidden" name="topicMode" value={topicMode} />
              {topicMode === "existing" && (
                <>
                  <SearchableSelect
                    name="topicId"
                    value={topicId}
                    onValueChange={setTopicId}
                    options={topics.map((t) => ({ value: String(t.id), label: `${t.displayName}  ·  ${t.slug}` }))}
                    placeholder={subjectId ? "Select a topic" : "Pick a subject first"}
                    emptyMessage="No topics in this subject yet — switch to New"
                    disabled={!subjectId || subjectMode === "new"}
                    invalid={!!errors.topicId}
                  />
                  <FieldError errors={errors} name="topicId" />
                </>
              )}
              {topicMode === "new" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Input name="topicName" value={topicName} placeholder="Polymer Degradation"
                      onChange={(e) => setTopicName(e.target.value)} aria-invalid={!!errors.topicName || undefined} />
                    <FieldError errors={errors} name="topicName" />
                  </div>
                  <div className="space-y-1">
                    <Input name="topicSlug" value={topicSlug} placeholder="fpc_degradation"
                      onChange={(e) => { setTopicSlugTouched(true); setTopicSlug(e.target.value); }}
                      aria-invalid={!!errors.topicSlug || undefined} className="font-mono text-xs" />
                    <FieldError errors={errors} name="topicSlug" />
                  </div>
                </div>
              )}
              {topicMode === "none" && (
                <p className="text-xs text-muted-foreground">
                  The link sits on the subject page itself, the way a v1 subject-flow web link does.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Hand Note(Jeba Fariha, TME-51, 2026)" aria-invalid={!!errors.title || undefined} />
              <FieldError errors={errors} name="title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Link</Label>
              <Input id="url" name="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/…/view" aria-invalid={!!errors.url || undefined} />
              <FieldError errors={errors} name="url" />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add content"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/notes")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-6">
        <ContentPreview input={previewInput} />
      </div>
    </div>
  );
}
