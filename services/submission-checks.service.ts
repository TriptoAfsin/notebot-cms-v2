import { db } from "@/lib/db";
import { levels, notes, noteSubmissions, subjects, topics } from "@/lib/db/schema";
import { and, eq, ilike, ne, or, sql } from "drizzle-orm";
import { driveId } from "@/lib/drive";

/**
 * Automatic checks shown beside a submission in the review queue. Each check is independent and
 * never throws: a failure becomes a "unknown" result rather than blocking the review.
 */
export type CheckState = "pass" | "warn" | "fail" | "unknown";
export type SubmissionChecks = {
  link: { state: CheckState; detail: string };
  topic: { state: CheckState; detail: string; matches: { topicId: number; topic: string; subject: string; level: string }[] };
  duplicate: { state: CheckState; detail: string; noteIds: number[]; submissionIds: number[] };
  gap: { state: CheckState; detail: string; terms: { term: string; hits: number }[] };
};

type Submission = typeof noteSubmissions.$inferSelect;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Is the Drive file readable without signing in? Only Google's own hosts are ever fetched (the URL
 * is rebuilt from the file id), so a submitted link can't make the server request arbitrary URLs.
 */
async function checkLink(url: string): Promise<SubmissionChecks["link"]> {
  const id = driveId(url);
  if (!id) {
    return { state: "unknown", detail: "Not a Google Drive link. Open it to check it is public." };
  }
  const isFolder = /\/folders\//.test(url);
  const target = isFolder ? `https://drive.google.com/drive/folders/${id}` : `https://drive.google.com/file/d/${id}/view`;
  try {
    const res = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(6000) });
    const loc = res.headers.get("location") ?? "";
    if (res.status === 200) return { state: "pass", detail: `Public ${isFolder ? "folder" : "file"}, opens without signing in.` };
    if (res.status === 404) return { state: "fail", detail: "Drive says this file does not exist." };
    if ((res.status >= 300 && res.status < 400 && /accounts\.google\.com/.test(loc)) || res.status === 401 || res.status === 403) {
      return { state: "fail", detail: "Private: Drive asks to sign in. Ask the student to share it with 'Anyone with the link'." };
    }
    return { state: "unknown", detail: `Drive answered ${res.status}. Open it to check.` };
  } catch {
    return { state: "unknown", detail: "Could not reach Google Drive." };
  }
}

async function checkTopic(s: Submission): Promise<SubmissionChecks["topic"]> {
  const words = norm(s.topicName).split(" ").filter((w) => w.length >= 3);
  if (!words.length) return { state: "warn", detail: "Topic name is too short to match.", matches: [] };
  const rows = await db
    .select({ topicId: topics.id, topic: topics.displayName, topicKey: topics.name, subject: subjects.displayName, subjectKey: subjects.name, level: levels.displayName })
    .from(topics)
    .innerJoin(subjects, eq(subjects.id, topics.subjectId))
    .innerJoin(levels, eq(levels.id, subjects.levelId))
    .where(or(...words.map((w) => or(ilike(topics.displayName, `%${w}%`), ilike(topics.name, `%${w}%`)))))
    .limit(200);

  const want = norm(s.topicName);
  const subj = norm(s.subjectName);
  const scored = rows
    .map((r) => {
      const t = norm(r.topic), k = norm(r.topicKey);
      let score = t === want || k === want ? 10 : 0;
      score += words.filter((w) => t.includes(w) || k.includes(w)).length;
      const sn = norm(r.subject), sk = norm(r.subjectKey);
      if (subj && (sn.includes(subj) || subj.includes(sn) || sk === subj)) score += 4;
      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!scored.length) {
    return { state: "warn", detail: `No topic like "${s.topicName}" yet. Approving means creating it.`, matches: [] };
  }
  const exact = scored[0].score >= 10;
  return {
    state: exact ? "pass" : "warn",
    detail: exact ? `${scored[0].topic} in ${scored[0].subject}, ${scored[0].level}.` : "Similar topics found; pick where the note belongs.",
    matches: scored.map(({ topicId, topic, subject, level }) => ({ topicId, topic, subject, level })),
  };
}

async function checkDuplicate(s: Submission): Promise<SubmissionChecks["duplicate"]> {
  const id = driveId(s.noteLink);
  const needle = id ? `%${id}%` : s.noteLink;
  const [dupNotes, dupSubs] = await Promise.all([
    db.select({ id: notes.id }).from(notes).where(id ? ilike(notes.url, needle) : eq(notes.url, needle)).limit(5),
    db
      .select({ id: noteSubmissions.id })
      .from(noteSubmissions)
      .where(and(ne(noteSubmissions.id, s.id), id ? ilike(noteSubmissions.noteLink, needle) : eq(noteSubmissions.noteLink, needle)))
      .limit(5),
  ]);
  if (dupNotes.length) {
    return { state: "fail", detail: `Already published as note #${dupNotes.map((n) => n.id).join(", #")}.`, noteIds: dupNotes.map((n) => n.id), submissionIds: dupSubs.map((n) => n.id) };
  }
  if (dupSubs.length) {
    return { state: "warn", detail: `Also submitted as #${dupSubs.map((n) => n.id).join(", #")}.`, noteIds: [], submissionIds: dupSubs.map((n) => n.id) };
  }
  return { state: "pass", detail: "Not in the library or other submissions.", noteIds: [], submissionIds: [] };
}

const MISS_NOISE = ["get started", "i want to learn more", "get_started"];

/** Would publishing this answer searches the bot currently fails? */
async function checkGap(s: Submission): Promise<SubmissionChecks["gap"]> {
  const topic = norm(s.topicName);
  if (topic.length < 3) return { state: "unknown", detail: "Topic name too short to compare.", terms: [] };
  try {
    const res = await db.execute<{ term: string; hits: number }>(sql`
      SELECT trim(regexp_replace(lower(missed_words), '[^a-z0-9]+', ' ', 'g')) AS term, COUNT(*)::int AS hits
      FROM analytics.missed_words_table
      WHERE length(trim(missed_words)) >= 4
        AND lower(trim(missed_words)) <> ALL(${sql`ARRAY[${sql.join(MISS_NOISE.map((w) => sql`${w}`), sql`, `)}]::text[]`})
        -- whole words either way: "knitting" matches "Knitting 2", "chan" does not match "Change"
        AND (' ' || ${topic} || ' ' LIKE '% ' || trim(regexp_replace(lower(missed_words), '[^a-z0-9]+', ' ', 'g')) || ' %'
             OR ' ' || trim(regexp_replace(lower(missed_words), '[^a-z0-9]+', ' ', 'g')) || ' ' LIKE '% ' || ${topic} || ' %')
      GROUP BY 1 ORDER BY hits DESC LIMIT 3
    `);
    const terms = res.rows.map((r) => ({ term: r.term, hits: Number(r.hits) }));
    const total = terms.reduce((n, t) => n + t.hits, 0);
    return terms.length
      ? { state: "pass", detail: `Fills a gap: ${total.toLocaleString("en-US")} failed bot searches (${terms.map((t) => `"${t.term}"`).join(", ")}).`, terms }
      : { state: "unknown", detail: "No failed searches match this topic.", terms };
  } catch {
    return { state: "unknown", detail: "Search analytics unavailable.", terms: [] };
  }
}

export async function runChecks(s: Submission): Promise<SubmissionChecks> {
  const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);
  const [link, topic, duplicate, gap] = await Promise.all([
    safe(checkLink(s.noteLink), { state: "unknown" as const, detail: "Check failed." }),
    safe(checkTopic(s), { state: "unknown" as const, detail: "Check failed.", matches: [] }),
    safe(checkDuplicate(s), { state: "unknown" as const, detail: "Check failed.", noteIds: [], submissionIds: [] }),
    safe(checkGap(s), { state: "unknown" as const, detail: "Check failed.", terms: [] }),
  ]);
  return { link, topic, duplicate, gap };
}
