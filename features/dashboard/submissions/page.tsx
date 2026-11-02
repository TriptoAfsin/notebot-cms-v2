import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getSubmissions, reviewSubmission, deleteSubmission, checkSubmission } from "@/actions/note-submissions.action";
import type { SubmissionChecks, CheckState } from "@/services/submission-checks.service";
import { useSearchParams } from "@/lib/navigation";
import { SearchInput } from "@/components/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Check, CircleAlert, CircleHelp, Copy, ExternalLink, FilePlus2, Inbox, Settings, Trash2, X,
} from "lucide-react";

type Submission = {
  id: number;
  name: string;
  batch: string;
  department: string;
  level: string;
  subjectName: string;
  topicName: string;
  noteLink: string;
  contactInfo: string;
  status: string;
  reviewedAt: Date | string | null;
  reviewNote: string | null;
  createdAt: Date | string;
};
type Status = "pending" | "approved" | "rejected";

/** How long a decision waits before it is sent. Approve/reject emails the student, so Undo must
 *  stop the request rather than revert it afterwards. */
const UNDO_MS = 5000;

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const;

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function ago(d: Date | string) {
  const s = (new Date(d).getTime() - Date.now()) / 1000;
  const abs = Math.abs(s);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), "day");
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
        status === "approved" ? "bg-primary" : status === "rejected" ? "bg-destructive" : "bg-warning",
      )}
    />
  );
}

function StatusLabel({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
      <StatusDot status={status} />
      {status}
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="ml-1.5 rounded border border-current/25 px-1 font-mono text-[10.5px] leading-4 opacity-70">{children}</kbd>
  );
}

const CHECK_ICON: Record<CheckState, { icon: typeof Check; cls: string; label: string }> = {
  pass: { icon: Check, cls: "text-primary", label: "Pass" },
  warn: { icon: CircleAlert, cls: "text-warning", label: "Check" },
  fail: { icon: X, cls: "text-destructive", label: "Problem" },
  unknown: { icon: CircleHelp, cls: "text-muted-foreground", label: "Unknown" },
};

function CheckRow({ title, state, children }: { title: string; state: CheckState; children: React.ReactNode }) {
  const { icon: Icon, cls, label } = CHECK_ICON[state];
  return (
    <li className="flex gap-3 py-2.5">
      <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border", cls)}>
        <Icon className="h-3 w-3" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
      <div className="min-w-0 text-[13px]">
        <p className="font-medium">{title}</p>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

function Field({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-[13px]", mono && "font-mono")}>{children}</dd>
    </div>
  );
}

export default function SubmissionsPage() {
  // Tab and selection are local state mirrored into the URL with replaceState. Routing them would
  // re-run the layout's session check on every J/K press.
  const initialParams = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>(() => {
    const v = initialParams.get("status");
    return TABS.some((t) => t.value === v) ? (v as (typeof TABS)[number]["value"]) : "pending";
  });
  const [selectedParam, setSelectedParam] = useState(() => initialParams.get("id") ?? "");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (tab === "pending") p.delete("status");
    else p.set("status", tab);
    if (selectedParam) p.set("id", selectedParam);
    else p.delete("id");
    const qs = p.toString();
    window.history.replaceState(window.history.state, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, [tab, selectedParam]);
  const [items, setItems] = useState<Submission[] | null>(null);
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 200).trim().toLowerCase();
  const [note, setNote] = useState("");
  const [checks, setChecks] = useState<Record<number, SubmissionChecks | "loading" | "error">>({});
  const [publicUrl, setPublicUrl] = useState("/submit");
  const listRef = useRef<HTMLUListElement>(null);
  // id -> scheduled commit. Flushed (sent immediately) when the page is left or hidden.
  const queued = useRef(new Map<number, { timer: ReturnType<typeof setTimeout>; run: () => void }>());

  // window.location is client-only; computing it during render caused a hydration mismatch.
  useEffect(() => setPublicUrl(`${window.location.origin}/submit`), []);

  const load = useCallback(async () => {
    const res = await getSubmissions();
    setItems(("data" in res ? res.data : []) as Submission[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, all: items?.length ?? 0 };
    for (const s of items ?? []) if (s.status in c) c[s.status as Status]++;
    return c;
  }, [items]);

  const visible = useMemo(() => {
    let list = items ?? [];
    if (tab !== "all") list = list.filter((s) => s.status === tab);
    if (q) {
      list = list.filter((s) =>
        [s.name, s.subjectName, s.topicName, s.batch, s.department, s.level, s.contactInfo].some((v) => v.toLowerCase().includes(q)),
      );
    }
    // Queue order: oldest pending first, so nobody waits longest. Other tabs: newest first.
    return [...list].sort((a, b) => {
      const d = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return tab === "pending" ? d : -d;
    });
  }, [items, tab, q]);

  const selectedId = Number(selectedParam) || visible[0]?.id || 0;
  const selected = (items ?? []).find((s) => s.id === selectedId) ?? visible[0] ?? null;
  const index = selected ? visible.findIndex((s) => s.id === selected.id) : -1;

  const select = useCallback((id: number) => setSelectedParam(String(id)), [setSelectedParam]);

  // Reset the note and fetch checks when the selection changes.
  useEffect(() => {
    setNote("");
    if (!selected || checks[selected.id]) return;
    const id = selected.id;
    setChecks((c) => ({ ...c, [id]: "loading" }));
    checkSubmission(id)
      .then((r) => setChecks((c) => ({ ...c, [id]: "data" in r && r.data ? r.data : "error" })))
      .catch(() => setChecks((c) => ({ ...c, [id]: "error" })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // Keep the selected row in view when moving with J/K.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-id="${selected?.id}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected?.id]);

  const setStatus = (id: number, status: string, reviewNote: string | null) =>
    setItems((list) => list?.map((s) => (s.id === id ? { ...s, status, reviewNote, reviewedAt: status === "pending" ? null : new Date() } : s)) ?? null);

  const flush = useCallback(() => {
    for (const [, q] of queued.current) { clearTimeout(q.timer); q.run(); }
  }, []);
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => { document.removeEventListener("visibilitychange", onHide); flush(); };
  }, [flush]);

  const decide = (status: "approved" | "rejected") => {
    if (!selected || selected.status !== "pending" || queued.current.has(selected.id)) return;
    const s = selected;
    const reviewNote = note.trim();
    const next = visible[index + 1] ?? visible[index - 1];

    setStatus(s.id, status, reviewNote || null);
    if (next && tab === "pending") select(next.id);

    const run = () => {
      queued.current.delete(s.id);
      const fd = new FormData();
      fd.set("id", String(s.id));
      fd.set("status", status);
      if (reviewNote) fd.set("reviewNote", reviewNote);
      reviewSubmission(fd)
        .then((r) => {
          if (r && "error" in r && r.error) throw new Error(String(r.error));
        })
        .catch(() => {
          setStatus(s.id, "pending", null);
          toast.error(`Could not save the review of "${s.topicName}". It is back in the queue.`);
        });
    };
    queued.current.set(s.id, { timer: setTimeout(run, UNDO_MS), run });

    toast(`${status === "approved" ? "Approved" : "Rejected"} "${s.topicName}"`, {
      description: s.contactInfo.includes("@") ? `${s.name} will be emailed in ${UNDO_MS / 1000}s.` : undefined,
      duration: UNDO_MS,
      action: {
        label: "Undo",
        onClick: () => {
          const q = queued.current.get(s.id);
          if (!q) return; // already sent
          clearTimeout(q.timer);
          queued.current.delete(s.id);
          setStatus(s.id, "pending", null);
          select(s.id);
          setNote(reviewNote);
        },
      },
    });
  };

  const [removing, setRemoving] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const remove = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!selected) return;
    const id = selected.id;
    const next = visible[index + 1] ?? visible[index - 1];
    setRemoving(true);
    const r = await deleteSubmission(id).finally(() => setRemoving(false));
    if (r && "error" in r && r.error) return toast.error("Could not delete the submission.");
    setRemoveOpen(false);
    setItems((list) => list?.filter((s) => s.id !== id) ?? null);
    if (next) select(next.id);
    toast.success("Submission deleted");
  };

  // J/K move, A/R decide. Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      const k = e.key.toLowerCase();
      if (k === "j" || k === "arrowdown") {
        const n = visible[Math.min(index + 1, visible.length - 1)];
        if (n) { e.preventDefault(); select(n.id); }
      } else if (k === "k" || k === "arrowup") {
        const n = visible[Math.max(index - 1, 0)];
        if (n) { e.preventDefault(); select(n.id); }
      } else if (k === "a") { e.preventDefault(); decide("approved"); }
      else if (k === "r") { e.preventDefault(); decide("rejected"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const c = selected ? checks[selected.id] : undefined;
  const bestTopic = c && typeof c === "object" ? c.topic.matches[0] : undefined;
  const addNoteHref = selected
    ? `/notes/new?${new URLSearchParams({
        ...(bestTopic ? { topicId: String(bestTopic.topicId) } : {}),
        url: selected.noteLink,
        title: selected.topicName,
        author: selected.name,
      })}`
    : "#";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Submissions</h1>
          <p className="mt-0.5 text-[13.5px] text-muted-foreground">
            {items === null ? "Loading…" : counts.pending ? `${counts.pending} waiting for review, oldest first.` : "Nothing waiting. New submissions land here."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigator.clipboard.writeText(publicUrl).then(
                () => toast.success("Form link copied"),
                () => toast.error(publicUrl),
              )
            }
          >
            <Copy /> Copy form link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/submit" target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Open form
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/submissions/settings">
              <Settings /> Form settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid min-h-[560px] overflow-hidden rounded-lg border bg-card lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        {/* ---- Queue ---- */}
        <section aria-label="Submission queue" className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
          <div className="space-y-2 border-b p-2.5">
            <div role="tablist" aria-label="Status" className="grid grid-cols-4 gap-0.5 rounded-md bg-muted p-0.5">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  role="tab"
                  aria-selected={tab === t.value}
                  onClick={() => { setTab(t.value); setSelectedParam(""); }}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-[5px] px-1.5 py-1 text-[12.5px] transition-colors duration-100",
                    tab === t.value ? "bg-card font-medium text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span className="font-mono text-[10.5px] tabular-nums opacity-70">{counts[t.value]}</span>
                </button>
              ))}
            </div>
            <SearchInput value={search} onChange={setSearch} pending={false} placeholder="Name, subject, topic, batch…" />
          </div>
          <ul ref={listRef} className="max-h-[70vh] min-h-0 flex-1 overflow-y-auto" aria-label="Submissions">
            {items === null &&
              Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="space-y-1.5 border-b px-3.5 py-3">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </li>
              ))}
            {items !== null && visible.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-6 py-16 text-center text-[13px] text-muted-foreground">
                <Inbox className="h-5 w-5" aria-hidden="true" />
                {q ? "No submissions match your search." : tab === "pending" ? "The queue is clear." : `No ${tab === "all" ? "" : tab + " "}submissions.`}
              </li>
            )}
            {visible.map((s) => {
              const active = s.id === selected?.id;
              return (
                <li key={s.id} data-id={s.id} className="border-b last:border-b-0">
                  <button
                    onClick={() => select(s.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "relative block w-full px-3.5 py-2.5 text-left transition-colors duration-100",
                      active ? "bg-muted before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary" : "hover:bg-muted/50",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13.5px] font-medium">{s.topicName}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{ago(s.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                      {tab === "all" && <StatusDot status={s.status} />}
                      <span className="truncate">
                        {s.subjectName} · {s.name} · {s.department} {s.batch}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {visible.length > 0 && (
            <p className="hidden border-t px-3.5 py-2 font-mono text-[11px] text-muted-foreground lg:block">
              J / K to move · A approve · R reject
            </p>
          )}
        </section>

        {/* ---- Detail ---- */}
        <section aria-label="Submission detail" className="min-w-0">
          {!selected ? (
            <div className="grid h-full place-items-center p-10 text-[13px] text-muted-foreground">
              {items === null ? <Skeleton className="h-40 w-full max-w-md" /> : "Select a submission"}
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <StatusLabel status={selected.status} />
                    <span className="font-mono text-[11px] text-muted-foreground">#{selected.id} · {ago(selected.createdAt)}</span>
                  </div>
                  <h2 className="mt-1 truncate text-[17px] font-semibold tracking-[-0.01em]">{selected.topicName}</h2>
                  <p className="text-[13px] text-muted-foreground">
                    {selected.subjectName} · {selected.level}
                  </p>
                </div>
                <AlertDialog open={removeOpen} onOpenChange={(o) => !removing && setRemoveOpen(o)}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Delete submission" className="text-muted-foreground hover:text-destructive">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{selected.topicName}&rdquo; from {selected.name} is removed for good. The student is not notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={remove} variant="destructive" loading={removing}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </header>

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                  <Field label="Student">{selected.name}</Field>
                  <Field label="Batch · Dept" mono>{selected.batch} · {selected.department}</Field>
                  <Field label="Contact">
                    <span title={selected.contactInfo}>{selected.contactInfo}</span>
                  </Field>
                  <Field label="Submitted" mono>
                    {new Date(selected.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Field>
                </dl>

                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]" title={selected.noteLink}>{selected.noteLink}</span>
                  <Button variant="ghost" size="icon-sm" aria-label="Copy link" onClick={() => navigator.clipboard.writeText(selected.noteLink).then(() => toast.success("Link copied"), () => {})}>
                    <Copy />
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={selected.noteLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink /> Open
                    </a>
                  </Button>
                </div>

                <div>
                  <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Checks</h3>
                  {c === undefined || c === "loading" ? (
                    <div className="mt-2 space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-2/3" /></div>
                        </div>
                      ))}
                    </div>
                  ) : c === "error" ? (
                    <p className="mt-2 text-[13px] text-muted-foreground">Checks could not run. Review the link by hand.</p>
                  ) : (
                    <ul className="mt-1 divide-y">
                      <CheckRow title="Link is public" state={c.link.state}>{c.link.detail}</CheckRow>
                      <CheckRow title="Topic exists" state={c.topic.state}>
                        {c.topic.detail}
                        {c.topic.state !== "pass" && c.topic.matches.length > 0 && (
                          <span className="mt-1 flex flex-wrap gap-1.5">
                            {c.topic.matches.map((m) => (
                              <span key={m.topicId} className="rounded border bg-background px-1.5 py-0.5 text-[12px] text-foreground">
                                {m.topic} <span className="text-muted-foreground">· {m.subject} · {m.level}</span>
                              </span>
                            ))}
                          </span>
                        )}
                      </CheckRow>
                      <CheckRow title="Not a duplicate" state={c.duplicate.state}>
                        {c.duplicate.detail}{" "}
                        {c.duplicate.noteIds[0] && (
                          <Link href={`/notes/${c.duplicate.noteIds[0]}`} className="text-primary hover:underline">Open note</Link>
                        )}
                        {!c.duplicate.noteIds[0] && c.duplicate.submissionIds[0] && (
                          <button className="text-primary hover:underline" onClick={() => { setTab("all"); select(c.duplicate.submissionIds[0]); }}>
                            Show #{c.duplicate.submissionIds[0]}
                          </button>
                        )}
                      </CheckRow>
                      <CheckRow title="Fills a search gap" state={c.gap.state}>{c.gap.detail}</CheckRow>
                    </ul>
                  )}
                </div>

                {selected.status !== "pending" && (
                  <div className="rounded-md border bg-background px-3 py-2.5 text-[13px]">
                    <p className="font-medium capitalize">
                      {selected.status}
                      {selected.reviewedAt && <span className="font-normal text-muted-foreground"> · {ago(selected.reviewedAt)}</span>}
                    </p>
                    <p className="text-muted-foreground">{selected.reviewNote || "No note."}</p>
                  </div>
                )}
              </div>

              {selected.status === "pending" ? (
                <footer className="space-y-2.5 border-t bg-background/60 px-5 py-3.5">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={selected.contactInfo.includes("@") ? "Note to the student (optional, included in the email)" : "Review note (optional)"}
                    rows={2}
                    className="min-h-0 resize-none text-[13px]"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={() => decide("approved")}>
                      <Check /> Approve <Kbd>A</Kbd>
                    </Button>
                    <Button variant="outline" onClick={() => decide("rejected")} className="hover:border-destructive/50 hover:text-destructive">
                      <X /> Reject <Kbd>R</Kbd>
                    </Button>
                    <Button variant="ghost" asChild className="ml-auto">
                      <Link href={addNoteHref}>
                        <FilePlus2 /> Add as note
                      </Link>
                    </Button>
                  </div>
                </footer>
              ) : (
                <footer className="flex justify-end border-t px-5 py-3">
                  <Button variant="ghost" asChild>
                    <Link href={addNoteHref}>
                      <FilePlus2 /> Add as note
                    </Link>
                  </Button>
                </footer>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
