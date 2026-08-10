import { BLOCK_LIMITS } from "@/lib/block-limits";

/**
 * An editable view over a Messenger message array.
 *
 * The builder needs typed fields, but a Send API message can carry anything Meta supports — and more
 * than this editor knows about. So a block is never rebuilt from scratch: the original object is kept
 * and only the fields the editor exposes are patched. Anything it does not recognise is presented as
 * a raw JSON node and written back byte-for-byte.
 *
 * Without that rule a builder would quietly delete `sharable`, `image_aspect_ratio`,
 * `messaging_type` and anything else it had not been taught, and the loss would only show up in
 * Messenger.
 *
 * No imports beyond the limits table, so this is safe in a client bundle.
 */

export type BlockKind = "text" | "buttons" | "card" | "image" | "quickReplies" | "raw";

export type EditableButton = {
  /** stable id for drag-and-drop; not persisted */
  id: string;
  type: "web_url" | "postback";
  title: string;
  url: string;
  payload: string;
  /** everything else Meta allows on a button, preserved verbatim */
  rest: Record<string, unknown>;
};

export type EditableBlock = {
  /** stable id for drag-and-drop; not persisted */
  id: string;
  kind: BlockKind;
  /** text bubble, or the header text of a button template */
  text: string;
  buttons: EditableButton[];
  /** generic-template card */
  card: { title: string; subtitle: string; imageUrl: string; defaultUrl: string };
  imageUrl: string;
  quickReplies: EditableButton[];
  /** the untouched original, so unknown fields survive a round trip */
  original: Record<string, unknown>;
  /** raw JSON text, used by the `raw` kind and as the fallback editor */
  raw: string;
};

let seq = 0;
/**
 * Ids are per-session counters rather than Math.random or Date.now: those are impure calls that the
 * React Compiler lint rules reject during render, and a stable counter is enough for DnD keys.
 */
const nextId = (prefix: string) => `${prefix}-${++seq}`;

const str = (v: unknown) => (typeof v === "string" ? v : "");

function toButton(raw: unknown): EditableButton {
  const b = (raw ?? {}) as Record<string, unknown>;
  const { type, title, url, payload, ...rest } = b;
  return {
    id: nextId("btn"),
    type: type === "postback" ? "postback" : "web_url",
    title: str(title),
    url: str(url),
    payload: str(payload),
    rest,
  };
}

function fromButton(b: EditableButton): Record<string, unknown> {
  const out: Record<string, unknown> = { ...b.rest, type: b.type, title: b.title };
  if (b.type === "web_url") out.url = b.url;
  else out.payload = b.payload;
  return out;
}

function toQuickReply(raw: unknown): EditableButton {
  const q = (raw ?? {}) as Record<string, unknown>;
  const { content_type, title, payload, ...rest } = q;
  return {
    id: nextId("qr"),
    type: "postback",
    title: str(title),
    url: "",
    payload: str(payload),
    rest: { ...rest, content_type: content_type ?? "text" },
  };
}

const fromQuickReply = (q: EditableButton): Record<string, unknown> => ({
  ...q.rest,
  content_type: (q.rest.content_type as string) ?? "text",
  title: q.title,
  payload: q.payload,
});

const emptyBlock = (kind: BlockKind): EditableBlock => ({
  id: nextId("blk"),
  kind,
  text: "",
  buttons: [],
  card: { title: "", subtitle: "", imageUrl: "", defaultUrl: "" },
  imageUrl: "",
  quickReplies: [],
  original: {},
  raw: "{}",
});

/** Recognises a message's shape. Unknown shapes become `raw` rather than being coerced. */
export function toEditableBlock(input: unknown): EditableBlock {
  const block = (input ?? {}) as Record<string, unknown>;
  const base = emptyBlock("raw");
  base.original = block;
  base.raw = JSON.stringify(block, null, 2);

  const attachment = block.attachment as Record<string, unknown> | undefined;
  const payload = attachment?.payload as Record<string, unknown> | undefined;

  if (typeof block.text === "string" && Array.isArray(block.quick_replies)) {
    return { ...base, kind: "quickReplies", text: block.text, quickReplies: block.quick_replies.map(toQuickReply) };
  }
  if (typeof block.text === "string" && !attachment) {
    return { ...base, kind: "text", text: block.text };
  }
  if (attachment?.type === "image" && payload) {
    return { ...base, kind: "image", imageUrl: str(payload.url) };
  }
  if (payload?.template_type === "button") {
    return {
      ...base,
      kind: "buttons",
      text: str(payload.text),
      buttons: Array.isArray(payload.buttons) ? payload.buttons.map(toButton) : [],
    };
  }
  if (payload?.template_type === "generic") {
    const elements = Array.isArray(payload.elements) ? payload.elements : [];
    // Only single-element cards are editable visually; a carousel keeps its raw editor so the other
    // elements are not silently discarded.
    if (elements.length === 1) {
      const el = (elements[0] ?? {}) as Record<string, unknown>;
      const action = el.default_action as Record<string, unknown> | undefined;
      return {
        ...base,
        kind: "card",
        card: {
          title: str(el.title),
          subtitle: str(el.subtitle),
          imageUrl: str(el.image_url),
          defaultUrl: str(action?.url),
        },
        buttons: Array.isArray(el.buttons) ? el.buttons.map(toButton) : [],
      };
    }
  }
  return base;
}

/** Writes an edited block back to a Send API message, preserving unknown fields. */
export function fromEditableBlock(b: EditableBlock): Record<string, unknown> {
  if (b.kind === "raw") {
    try {
      return JSON.parse(b.raw) as Record<string, unknown>;
    } catch {
      return b.original;
    }
  }

  const original = b.original ?? {};

  if (b.kind === "text") {
    // A text block has no quick replies; leaving a stale array behind would keep rendering chips.
    const rest = { ...original };
    delete rest.quick_replies;
    return { ...rest, text: b.text };
  }

  if (b.kind === "quickReplies") {
    return { ...original, text: b.text, quick_replies: b.quickReplies.map(fromQuickReply) };
  }

  const attachment = (original.attachment ?? {}) as Record<string, unknown>;
  const payload = (attachment.payload ?? {}) as Record<string, unknown>;

  if (b.kind === "image") {
    return {
      ...original,
      attachment: { ...attachment, type: "image", payload: { ...payload, url: b.imageUrl } },
    };
  }

  if (b.kind === "buttons") {
    return {
      ...original,
      attachment: {
        ...attachment,
        type: "template",
        payload: { ...payload, template_type: "button", text: b.text, buttons: b.buttons.map(fromButton) },
      },
    };
  }

  // card
  const elements = Array.isArray(payload.elements) ? payload.elements : [];
  const el = (elements[0] ?? {}) as Record<string, unknown>;
  const nextEl: Record<string, unknown> = { ...el, title: b.card.title };
  if (b.card.subtitle) nextEl.subtitle = b.card.subtitle; else delete nextEl.subtitle;
  if (b.card.imageUrl) nextEl.image_url = b.card.imageUrl; else delete nextEl.image_url;
  if (b.card.defaultUrl) nextEl.default_action = { type: "web_url", url: b.card.defaultUrl };
  else delete nextEl.default_action;
  if (b.buttons.length) nextEl.buttons = b.buttons.map(fromButton); else delete nextEl.buttons;

  return {
    ...original,
    attachment: {
      ...attachment,
      type: "template",
      payload: { ...payload, template_type: "generic", elements: [nextEl] },
    },
  };
}

export const toEditableBlocks = (blocks: unknown): EditableBlock[] =>
  Array.isArray(blocks) ? blocks.map(toEditableBlock) : [];

export const fromEditableBlocks = (blocks: EditableBlock[]) => blocks.map(fromEditableBlock);

/* --------------------------------------------------------------- new blocks */

export function newBlock(kind: BlockKind): EditableBlock {
  const b = emptyBlock(kind);
  switch (kind) {
    case "text":
      return { ...b, text: "New message" };
    case "buttons":
      return { ...b, text: "Choose -", buttons: [newButton("web_url")] };
    case "card":
      return { ...b, card: { title: "Card title", subtitle: "", imageUrl: "", defaultUrl: "" } };
    case "image":
      return { ...b, imageUrl: "" };
    case "quickReplies":
      return { ...b, text: "Pick one -", quickReplies: [newButton("postback")] };
    default:
      return { ...b, raw: "{\n  \"text\": \"\"\n}" };
  }
}

export const newButton = (type: "web_url" | "postback"): EditableButton => ({
  id: nextId("btn"),
  type,
  title: "",
  url: "",
  payload: "",
  rest: {},
});

export const BLOCK_LABELS: Record<BlockKind, string> = {
  text: "Text",
  buttons: "Buttons",
  card: "Card",
  image: "Image",
  quickReplies: "Quick replies",
  raw: "Raw JSON",
};

/**
 * Per-block problems, keyed the way the builder displays them.
 *
 * Duplicates the rules in `block-limits.ts` on purpose: that one validates a whole serialised array
 * for the save path, this one attributes a problem to the field the editor is showing, which is what
 * lets the UI put the message next to the offending input.
 */
export function blockIssues(b: EditableBlock): string[] {
  const issues: string[] = [];
  const over = (label: string, value: string, max: number) => {
    if (value.length > max) issues.push(`${label} is ${value.length} characters, max ${max}`);
  };

  if (b.kind === "text" || b.kind === "quickReplies") over("Message text", b.text, BLOCK_LIMITS.text);
  if (b.kind === "buttons") over("Header text", b.text, BLOCK_LIMITS.templateText);
  if (b.kind === "card") {
    over("Card title", b.card.title, BLOCK_LIMITS.cardTitle);
    over("Card subtitle", b.card.subtitle, BLOCK_LIMITS.cardTitle);
    if (!b.card.title.trim()) issues.push("A card needs a title");
  }
  if (b.kind === "image" && !b.imageUrl.trim()) issues.push("An image block needs a URL");

  if (b.kind === "buttons" || b.kind === "card") {
    if (b.buttons.length > BLOCK_LIMITS.buttonsPerGroup) {
      issues.push(`${b.buttons.length} buttons — Messenger shows only the first ${BLOCK_LIMITS.buttonsPerGroup}`);
    }
    if (b.kind === "buttons" && b.buttons.length === 0) issues.push("A button template needs at least one button");
    b.buttons.forEach((btn, i) => {
      over(`Button ${i + 1} title`, btn.title, BLOCK_LIMITS.buttonTitle);
      if (!btn.title.trim()) issues.push(`Button ${i + 1} needs a title`);
      if (btn.type === "web_url" && !/^https?:\/\//i.test(btn.url)) issues.push(`Button ${i + 1} needs a http(s) URL`);
      if (btn.type === "postback" && !btn.payload.trim()) issues.push(`Button ${i + 1} needs a payload`);
    });
  }

  if (b.kind === "quickReplies") {
    if (b.quickReplies.length > BLOCK_LIMITS.quickReplies) {
      issues.push(`${b.quickReplies.length} quick replies, max ${BLOCK_LIMITS.quickReplies}`);
    }
    b.quickReplies.forEach((q, i) => {
      over(`Quick reply ${i + 1} title`, q.title, BLOCK_LIMITS.quickReplyTitle);
      if (!q.title.trim()) issues.push(`Quick reply ${i + 1} needs a title`);
    });
  }

  if (b.kind === "raw") {
    try {
      JSON.parse(b.raw);
    } catch (err) {
      issues.push(`Not valid JSON — ${(err as Error).message}`);
    }
  }

  return issues;
}
