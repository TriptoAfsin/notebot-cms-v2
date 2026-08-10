/**
 * Faithful preview of how a piece of content renders in the Messenger bot and in the app API.
 *
 * These reproduce the v1 engine's behaviour deliberately, including its limits, so an editor
 * sees the truncation BEFORE saving rather than discovering it in Messenger. The rules are
 * taken from `simple-messenger-blocks` and `appController/translaters/SubTopicTrans.js`.
 */

/** Meta's real limits. v1 used to cut titles at 15, five below what Messenger allows; that was
 *  fixed in notebot-engine-v1@c724761 and this mirrors the corrected value. */
export const MESSENGER_LIMITS = {
  buttonTitle: 20,
  buttonsPerGroup: 3,
  templateText: 640,
  cardTitle: 80,
} as const;

/** v1 truncates by UTF-16 code unit, not grapheme — an emoji or Bangla conjunct can be cut in
 *  half. Reproduced so the preview shows the same damage the bot would do. */
export function truncate(value: string, max: number) {
  const s = String(value ?? "");
  return s.length > max ? { text: s.slice(0, max), truncated: true, from: s.length } : { text: s, truncated: false, from: s.length };
}

export type PreviewButton = { kind: "url" | "postback"; title: string; target: string };
export type PreviewGroup = { header: string; buttons: PreviewButton[] };

export type PreviewWarning = { level: "warn" | "error"; message: string };

export type PreviewResult = {
  /** what Messenger actually renders, after truncation and the 3-button cap */
  groups: PreviewGroup[];
  /** the app API body for the subject page, matching SubTopicTrans's output shape */
  apiEntries: Array<{ topic: string; route?: string; url?: string }>;
  warnings: PreviewWarning[];
  /** number of separate bubbles the user receives — magicFunc sends one Send API call per block */
  bubbleCount: number;
};

/**
 * SubTopicTrans prepends the group header to the button title only when the header matches this
 * whitelist; otherwise the entry is labelled with the bare button title. That is why a
 * "📌 Drive Folder -" group shows up in the app as an unhelpful "Download".
 */
const HEADER_PREFIX_WHITELIST = [
  "📌 full", "📌 all", "⚡", "📌 analytical", "📌 QB Solve", "📌 qb solve",
  "📌 analysis", "⚡ Viva", "⚡ All",
];
const headerIsPrefixed = (header: string) =>
  HEADER_PREFIX_WHITELIST.some((w) => header.toLowerCase().includes(w.toLowerCase()));

export type PreviewInput = {
  levelSlug: string;
  subjectSlug: string;
  subjectDisplay: string;
  /** the topic this content hangs off, or null for a subject-level direct link */
  topic: { slug: string; display: string } | null;
  noteTitle: string;
  noteUrl: string;
  /**
   * What is being previewed. A "topic" is itself the button on the subject page — it opens a
   * sub-page via a postback and has no url of its own, so requiring one would report a false
   * error on the topics form.
   */
  previewOf?: "note" | "topic";
  /** groups already present on the subject page, so the preview shows the real neighbourhood */
  existing?: PreviewGroup[];
};

export function buildPreview(input: PreviewInput): PreviewResult {
  const warnings: PreviewWarning[] = [];
  const groups: PreviewGroup[] = [...(input.existing ?? [])];

  const isDirectLink = !input.topic;
  const header = isDirectLink ? `📌 ${input.subjectDisplay} -` : `🔰 Select Topics for ${input.subjectDisplay} - `;

  // --- the Messenger side ---
  if (isDirectLink) {
    const t = truncate(input.noteTitle, MESSENGER_LIMITS.buttonTitle);
    if (t.truncated) {
      warnings.push({
        level: "warn",
        message: `Button title is ${t.from} characters; Messenger shows only ${MESSENGER_LIMITS.buttonTitle}. It will appear as “${t.text}”.`,
      });
    }
    groups.push({ header, buttons: [{ kind: "url", title: t.text, target: input.noteUrl }] });
  } else {
    const t = truncate(input.topic!.display, MESSENGER_LIMITS.buttonTitle);
    if (t.truncated) {
      warnings.push({
        level: "warn",
        message: `Topic button is ${t.from} characters; Messenger shows only ${MESSENGER_LIMITS.buttonTitle}. It will appear as “${t.text}”.`,
      });
    }
    groups.push({ header, buttons: [{ kind: "postback", title: t.text, target: input.topic!.slug }] });
  }

  // Meta drops the 4th button silently — surface it as an error, not a warning
  for (const g of groups) {
    if (g.buttons.length > MESSENGER_LIMITS.buttonsPerGroup) {
      warnings.push({
        level: "error",
        message: `“${g.header.trim()}” has ${g.buttons.length} buttons. Messenger allows ${MESSENGER_LIMITS.buttonsPerGroup} and silently discards the rest.`,
      });
      g.buttons = g.buttons.slice(0, MESSENGER_LIMITS.buttonsPerGroup);
    }
    if (g.header.length > MESSENGER_LIMITS.templateText) {
      warnings.push({ level: "error", message: `Group header exceeds ${MESSENGER_LIMITS.templateText} characters.` });
    }
  }

  // a topic navigates by postback, so it has no url to validate
  if ((input.previewOf ?? "note") === "note") {
    if (!input.noteUrl) {
      warnings.push({ level: "error", message: "A link is required — the button has nothing to open." });
    } else if (!/^https?:\/\//i.test(input.noteUrl)) {
      warnings.push({ level: "error", message: "Link must start with http:// or https://." });
    }
  }

  // --- the app API side (SubTopicTrans) ---
  const apiEntries = groups.flatMap((g) =>
    g.buttons.map((b) =>
      b.kind === "url"
        ? { topic: headerIsPrefixed(g.header) ? `${g.header}${b.title}` : b.title, url: b.target }
        : { topic: b.title, route: `app/notes/${input.levelSlug}/${input.subjectSlug}/${b.target}` }
    )
  );

  return { groups, apiEntries, warnings, bubbleCount: groups.length };
}
