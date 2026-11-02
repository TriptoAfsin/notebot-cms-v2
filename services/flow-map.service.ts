import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * The bot as a graph: every bespoke flow, every button/quick reply that leads somewhere, and where
 * each of those payloads actually lands.
 *
 * Classification mirrors the engine's resolver (notebot-engine-v2 `services/chatbot/flow.service.ts`):
 * a payload is answered by an enabled `bot_flows` row first (also with `_flow` stripped), then as a
 * topic, a subject, a structural address (level, lab level, routine, question bank, syllabus), then
 * the lab tree. Anything else falls through to search, which for a button means the student tapped
 * it and got a search result instead of the page it promised: a broken link.
 *
 * If the engine's rules change, change them here too, or the map will report the wrong things.
 */

export type Family = "topic" | "subject" | "level" | "lab" | "routine" | "qb" | "syllabus";
export type TargetState =
  | { kind: "flow" }
  | { kind: "resolved"; family: Family; empty: boolean }
  | { kind: "broken"; disabledFlow: boolean };

export type FlowNode = {
  payload: string;
  flowId: number;
  label: string | null;
  kind: string;
  enabled: boolean;
  blockCount: number;
  /** payloads linking here (bespoke flows only) */
  incoming: string[];
  /** no flow links here, it is not a menu, and its payload is not a content address */
  orphan: boolean;
  /** an enabled flow whose payload is also a topic/subject: it hides that live content */
  shadows: Family | null;
};

export type FlowEdge = { source: string; target: string; title: string; state: TargetState };

const norm = (s: string) => s.toLowerCase().trim();
const stripFlow = (s: string) => s.replace(/_flow$/, "");
const bareSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Every payload a Messenger message array can send back: postback buttons and quick replies. */
function outgoing(blocks: unknown): { payload: string; title: string }[] {
  const out: { payload: string; title: string }[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    // `attachment.payload` is an object (the template); only string payloads are addresses.
    if (typeof o.payload === "string" && (o.type === "postback" || o.content_type === "text")) {
      out.push({ payload: o.payload, title: typeof o.title === "string" ? o.title : o.payload });
    }
    for (const k of Object.keys(o)) walk(o[k]);
  };
  walk(blocks);
  return out;
}

async function loadAddressBook() {
  const q = <T,>(query: ReturnType<typeof sql>) => db.execute<T & Record<string, unknown>>(query).then((r) => r.rows);
  const [topics, subjects, levels, labs, syllabi, routines, qbs] = await Promise.all([
    q<{ slug: string; v1: string | null; notes: number; direct: boolean }>(sql`
      SELECT lower(t.slug) AS slug, lower(t.metadata->>'v1RouteSlug') AS v1,
             (SELECT COUNT(*) FROM notes n WHERE n.topic_id = t.id)::int AS notes,
             (t.metadata->>'directUrl') IS NOT NULL AS direct
      FROM topics t`),
    q<{ slug: string; v1: string | null; topics: number }>(sql`
      SELECT lower(s.slug) AS slug, lower(s.metadata->>'v1RouteSlug') AS v1,
             (SELECT COUNT(*) FROM topics t WHERE t.subject_id = s.id)::int AS topics
      FROM subjects s`),
    q<{ slug: string; subjects: number }>(sql`
      SELECT lower(l.slug) AS slug, (SELECT COUNT(*) FROM subjects s WHERE s.level_id = l.id)::int AS subjects FROM levels l`),
    q<{ subject: string; topic: string; level: string }>(sql`
      SELECT DISTINCT lower(lr.subject_slug) AS subject, lower(replace(lr.topic_name, ' ', '_')) AS topic, lower(l.slug) AS level
      FROM lab_reports lr JOIN levels l ON l.id = lr.level_id`),
    q<{ batch: string; dept: string }>(sql`SELECT DISTINCT batch, lower(department) AS dept FROM syllabuses`),
    q<{ level: string; term: string }>(sql`
      SELECT DISTINCT lower(l.slug) AS level, regexp_replace(COALESCE(r.term, ''), '\\D', '', 'g') AS term
      FROM routines r JOIN levels l ON l.id = r.level_id`),
    q<{ level: string }>(sql`SELECT DISTINCT lower(l.slug) AS level FROM question_banks q JOIN levels l ON l.id = q.level_id`),
  ]);

  const topicBy = new Map<string, { empty: boolean }>();
  for (const t of topics) {
    const e = { empty: !t.direct && Number(t.notes) === 0 };
    for (const k of [t.slug, t.v1]) if (k && !topicBy.has(k)) topicBy.set(k, e);
  }
  const subjectBy = new Map<string, { empty: boolean }>();
  for (const s of subjects) {
    for (const k of [s.slug, s.v1]) {
      if (!k) continue;
      // Duplicate subjects exist; the engine prefers the populated one.
      const prev = subjectBy.get(k);
      if (!prev || prev.empty) subjectBy.set(k, { empty: Number(s.topics) === 0 });
    }
  }
  return {
    topicBy,
    subjectBy,
    levels: new Map(levels.map((l) => [l.slug, Number(l.subjects)])),
    labLevels: new Set(labs.map((l) => l.level)),
    labSubjects: new Set(labs.map((l) => bareSlug(l.subject))),
    labTopics: new Set(labs.map((l) => `${l.subject}_${l.topic}`)),
    syllabusDeptBatch: new Set(syllabi.map((s) => `${s.dept}${s.batch}`)),
    syllabusBatches: new Set(syllabi.map((s) => String(s.batch))),
    routineLevels: new Set(routines.map((r) => r.level)),
    routineLevelTerms: new Set(routines.map((r) => `${r.level}:${r.term}`)),
    qbLevels: new Set(qbs.map((r) => r.level)),
  };
}
type AddressBook = Awaited<ReturnType<typeof loadAddressBook>>;

/** Steps 2-5 of the engine's resolver. */
function resolveContent(key: string, a: AddressBook): { family: Family; empty: boolean } | null {
  const bare = stripFlow(key);
  const topic = a.topicBy.get(key) ?? a.topicBy.get(bare);
  if (topic) return { family: "topic", ...topic };
  const subject = a.subjectBy.get(bare);
  if (subject) return { family: "subject", ...subject };

  let m: RegExpMatchArray | null;
  if ((m = key.match(/^level[_-]?(\d)[_-]?lab$/))) return { family: "lab", empty: !a.labLevels.has(m[1]) };
  if ((m = key.match(/^routine[_-]?level[_-]?(\d)$/))) return { family: "routine", empty: !a.routineLevels.has(m[1]) };
  if ((m = key.match(/^l(\d)[_-]?t(\d)[_-]?routine$/)) && a.routineLevelTerms.has(`${m[1]}:${m[2]}`)) return { family: "routine", empty: false };
  if ((m = key.match(/^syllabus[_-]?([a-z]+)(\d{2})$/)) && a.syllabusDeptBatch.has(`${m[1]}${m[2]}`)) return { family: "syllabus", empty: false };
  if ((m = key.match(/^level[_-]?(\d)$/) ?? key.match(/^(\d)$/)) && (a.levels.get(m[1]) ?? 0) > 0) return { family: "level", empty: false };
  if ((m = key.match(/^qb[_-]?(?:level[_-]?)?(\d)$/)) && a.qbLevels.has(m[1])) return { family: "qb", empty: false };
  if ((m = key.match(/^syllabus[_-]?(\d+)$/))) return { family: "syllabus", empty: !a.syllabusBatches.has(m[1]) };

  // Lab tree, keyed on strings: `<subject>_lab` or `<subject>_<topic>`.
  if ((m = bare.match(/^(.+?)[_-]lab$/)) && a.labSubjects.has(m[1].replace(/[^a-z0-9]/g, ""))) return { family: "lab", empty: false };
  const parts = bare.split("_");
  for (let i = 1; i < parts.length; i++) {
    if (a.labTopics.has(`${parts.slice(0, i).join("_")}_${parts.slice(i).join("_")}`)) return { family: "lab", empty: false };
  }
  return null;
}

const ROOTS = new Set(["get_started", "getstarted"]);

export async function getFlowMap() {
  const [flowsRes, book] = await Promise.all([
    db.execute<{ id: number; payload: string; label: string | null; kind: string; enabled: boolean; blocks: unknown }>(sql`
      SELECT id, payload, label, kind, enabled, blocks FROM bot_flows ORDER BY payload`),
    loadAddressBook(),
  ]);
  const flows = flowsRes.rows;
  const byPayload = new Map(flows.map((f) => [norm(f.payload), f]));

  const target = (payload: string): TargetState => {
    const key = norm(payload);
    const flow = byPayload.get(key) ?? byPayload.get(stripFlow(key));
    // The engine skips rows with no blocks, so an empty flow is as good as missing.
    if (flow?.enabled && Array.isArray(flow.blocks) && flow.blocks.length) return { kind: "flow" };
    const content = resolveContent(key, book);
    if (content) return { kind: "resolved", ...content };
    return { kind: "broken", disabledFlow: !!flow };
  };
  const flowKey = (payload: string) => {
    const key = norm(payload);
    return byPayload.has(key) ? key : byPayload.has(stripFlow(key)) ? stripFlow(key) : key;
  };

  const edges: FlowEdge[] = [];
  const incoming = new Map<string, Set<string>>();
  for (const f of flows) {
    const src = norm(f.payload);
    const seen = new Set<string>();
    for (const o of outgoing(f.blocks)) {
      const state = target(o.payload);
      const tgt = state.kind === "flow" ? flowKey(o.payload) : norm(o.payload);
      const dedupe = `${tgt}|${o.title}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      edges.push({ source: src, target: tgt, title: o.title, state });
      if (state.kind === "flow" && f.enabled) {
        if (!incoming.has(tgt)) incoming.set(tgt, new Set());
        incoming.get(tgt)!.add(src);
      }
    }
  }

  const nodes: FlowNode[] = flows.map((f) => {
    const key = norm(f.payload);
    const content = resolveContent(key, book);
    const inc = [...(incoming.get(key) ?? [])].filter((p) => p !== key);
    return {
      payload: key,
      flowId: f.id,
      label: f.label,
      kind: f.kind,
      enabled: f.enabled,
      blockCount: Array.isArray(f.blocks) ? f.blocks.length : 0,
      incoming: inc,
      orphan: f.enabled && !ROOTS.has(key) && f.kind !== "menu" && inc.length === 0 && !content,
      shadows: f.enabled && content && (content.family === "topic" || content.family === "subject") ? content.family : null,
    };
  });

  const fromEnabled = new Set(flows.filter((f) => f.enabled).map((f) => norm(f.payload)));
  const live = edges.filter((e) => fromEnabled.has(e.source));
  return {
    nodes,
    edges,
    roots: [...ROOTS].filter((r) => byPayload.has(r)),
    summary: {
      flows: nodes.length,
      links: live.length,
      broken: live.filter((e) => e.state.kind === "broken").length,
      empty: live.filter((e) => e.state.kind === "resolved" && e.state.empty).length,
      orphans: nodes.filter((n) => n.orphan).length,
      shadowing: nodes.filter((n) => n.shadows).length,
    },
  };
}

export type FlowMap = Awaited<ReturnType<typeof getFlowMap>>;
