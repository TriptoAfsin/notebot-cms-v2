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
import { composeNoteTitle } from "@/lib/note-title";
import { toSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { ContentPreview } from "@/components/content-preview";

type Level = { id: number; displayName: string; slug: string };
type Option = { id: number; displayName: string; slug: string };
type Errors = Record<string, string[] | undefined>;

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

export function ContentForm({
  levels,
  departments,
  noteKinds,
  batches,
  initialTopicName = "",
}: {
  levels: Level[];
  /** from the shared taxonomy — see lib/taxonomy.ts */
  departments: string[];
  noteKinds: string[];
  batches: string[];
  /** prefills a new topic name — set when arriving from a missed search on /analytics */
  initialTopicName?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  const [levelId, setLevelId] = useState("");
  const [subjectMode, setSubjectMode] = useState<"existing" | "new">("existing");
  const [subjectId, setSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");

  // A prefilled topic name only makes sense in "new" mode, so it also decides the starting mode.
  const [topicMode, setTopicMode] = useState<"existing" | "new" | "none">(
    initialTopicName ? "new" : "existing",
  );
  const [topicId, setTopicId] = useState("");
  const [topicName, setTopicName] = useState(initialTopicName);

  // Title is composed from parts rather than typed. Hand-typing is how the corpus ended up with
  // "Hand Note " (57 rows, trailing space) and batches written both "TME-51" and "TME51".
  const [kind, setKind] = useState<string>(noteKinds[0] ?? "Hand Note");
  const [author, setAuthor] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  // escape hatch for the titles that genuinely do not fit the pattern
  const [titleManual, setTitleManual] = useState(false);
  const [titleOverride, setTitleOverride] = useState("");

  const composedTitle = composeNoteTitle({ kind, author, department, batch, year });
  const title = titleManual ? titleOverride : composedTitle;

  const [url, setUrl] = useState("");

  const [subjects, setSubjects] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  // tracked separately from the lists: an in-flight fetch and a genuinely empty parent both
  // leave the array empty, and telling the editor "no topics here" while still loading is wrong
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Each step is scoped to its parent — the old pickers serialized every row in the database
  // into the client bundle. The state update stays inside the async continuation; setting it
  // synchronously in the effect body triggers a cascading render.
  useEffect(() => {
    let live = true;
    (async () => {
      if (live) setLoadingSubjects(!!levelId);
      const rows = levelId ? await getSubjectsForLevelAction(Number(levelId)) : [];
      if (live) { setSubjects(rows as Option[]); setLoadingSubjects(false); }
    })();
    return () => { live = false; };
  }, [levelId]);

  useEffect(() => {
    let live = true;
    const shouldFetch = !!subjectId && subjectMode !== "new";
    (async () => {
      if (live) setLoadingTopics(shouldFetch);
      const rows = shouldFetch ? await getTopicsForSubjectAction(Number(subjectId)) : [];
      if (live) { setTopics(rows as Option[]); setLoadingTopics(false); }
    })();
    return () => { live = false; };
  }, [subjectId, subjectMode]);

  // Derived on every render; there is no manual override any more. A collision is resolved
  // server-side by suffixing rather than rejected, so nothing here has to know what is taken.
  const subjectSlug = subjectMode === "new" ? toSlug(subjectName, 50) : "";
  const topicSlug = topicMode === "new" ? toSlug(topicName, 100) : "";

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
                    loading={loadingSubjects}
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
                    {/* Generated, not typed. The slug is part of the URL the engine resolves, and
                        hand-typing is how the tree ended up with both "IAE" and "iae". A clash is
                        resolved server-side by suffixing, so this is a preview of the intent. */}
                    <Input value={subjectSlug || "—"} readOnly disabled tabIndex={-1}
                      aria-describedby="subject-slug-hint" className="font-mono text-xs" />
                    <p id="subject-slug-hint" className="text-[11px] text-muted-foreground">
                      Slug, generated from the name
                    </p>
                    <input type="hidden" name="subjectSlug" value={subjectSlug} />
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
                    loading={loadingTopics}
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
                    <Input value={topicSlug || "—"} readOnly disabled tabIndex={-1}
                      aria-describedby="topic-slug-hint" className="font-mono text-xs" />
                    <p id="topic-slug-hint" className="text-[11px] text-muted-foreground">
                      Slug, generated from the name
                    </p>
                    <input type="hidden" name="topicSlug" value={topicSlug} />
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

            {/* Title is built from parts. The corpus shows why: 756 titles start "Hand Note",
                57 more start "Hand Note " with a trailing space, and batches appear as both
                "TME-51" and "TME51" — all of it from free-typing the same string 2,300 times. */}
            <fieldset className="space-y-3">
              <div className="flex items-center justify-between">
                <legend className="text-sm font-medium">Title</legend>
                <button
                  type="button"
                  onClick={() => { setTitleManual(!titleManual); if (!titleManual) setTitleOverride(composedTitle); }}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  {titleManual ? "Build from fields" : "Type it manually"}
                </button>
              </div>

              {titleManual ? (
                <Input
                  value={titleOverride}
                  onChange={(e) => setTitleOverride(e.target.value)}
                  placeholder="Hand Note(Jeba Fariha, TME-51, 2026)"
                  aria-invalid={!!errors.title || undefined}
                />
              ) : (
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="kind" className="text-xs text-muted-foreground">Kind</Label>
                      <select
                        id="kind"
                        value={kind}
                        onChange={(e) => setKind(e.target.value)}
                        className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {noteKinds.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="author" className="text-xs text-muted-foreground">Author</Label>
                      <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Jeba Fariha" />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label htmlFor="department" className="text-xs text-muted-foreground">Department</Label>
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">—</option>
                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="batch" className="text-xs text-muted-foreground">Batch</Label>
                      <Input id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="51" list="batch-options" />
                      <datalist id="batch-options">{batches.map((b) => <option key={b} value={b} />)}</datalist>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="year" className="text-xs text-muted-foreground">Year</Label>
                      <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" inputMode="numeric" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saves as{" "}
                    <code className="font-mono text-foreground">{composedTitle || "—"}</code>
                  </p>
                </>
              )}

              {/* the composed value is what actually submits, either way */}
              <input type="hidden" name="title" value={title} />
              <FieldError errors={errors} name="title" />
            </fieldset>

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
