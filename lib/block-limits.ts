/**
 * Validates a Messenger block array against the Send API's real constraints.
 *
 * Deliberately in `lib/` and not in the server action: the bot-flow editor runs this on every
 * keystroke, and anything exported from a `"use server"` module becomes a server action — callable
 * only as an async round-trip, never during render. Both the client editor and the action import it
 * from here, so the rules cannot drift between what the form shows and what the save enforces.
 *
 * No imports, so it is safe in a client bundle.
 */

export const BLOCK_LIMITS = {
  buttonTitle: 20,
  buttonsPerGroup: 3,
  templateText: 640,
  text: 2000,
  quickReplies: 13,
  quickReplyTitle: 20,
  cardTitle: 80,
  payload: 1000,
} as const;

export type BlockIssue = { path: string; problem: string };

/**
 * Narrowing helpers.
 *
 * These blocks arrive as parsed JSON, so every field is genuinely `unknown` — casting to `any` would
 * silence the type system exactly where the input is least trustworthy.
 */
type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj | null => (v !== null && typeof v === "object" ? (v as Obj) : null);
const asStr = (v: unknown): string | null => (typeof v === "string" ? v : null);
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export function validateBlocks(blocks: unknown): BlockIssue[] {
  const issues: BlockIssue[] = [];
  if (!Array.isArray(blocks)) return [{ path: "root", problem: "must be an array of message objects" }];
  if (blocks.length === 0) return [{ path: "root", problem: "must contain at least one message" }];

  blocks.forEach((block, i) => {
    const at = `[${i}]`;
    if (!block || typeof block !== "object") {
      issues.push({ path: at, problem: "each entry must be a message object" });
      return;
    }
    const b = block as Obj;
    const text = asStr(b.text);
    const attachment = asObj(b.attachment);
    if (text === null && !attachment) {
      issues.push({ path: at, problem: "needs a `text` or an `attachment`" });
    }
    if (text !== null && text.length > BLOCK_LIMITS.text) {
      issues.push({ path: `${at}.text`, problem: `${text.length} characters, max ${BLOCK_LIMITS.text}` });
    }

    const quickReplies = asArr(b.quick_replies);
    if (quickReplies.length) {
      if (quickReplies.length > BLOCK_LIMITS.quickReplies) {
        issues.push({
          path: `${at}.quick_replies`,
          problem: `${quickReplies.length}, max ${BLOCK_LIMITS.quickReplies}`,
        });
      }
      quickReplies.forEach((raw, j) => {
        const title = asStr(asObj(raw)?.title);
        if (title !== null && title.length > BLOCK_LIMITS.quickReplyTitle) {
          issues.push({
            path: `${at}.quick_replies[${j}].title`,
            problem: `"${title}" is ${title.length} characters, max ${BLOCK_LIMITS.quickReplyTitle}`,
          });
        }
      });
    }

    const tpl = asObj(attachment?.payload);
    if (tpl) {
      const tplText = asStr(tpl.text);
      if (tplText !== null && tplText.length > BLOCK_LIMITS.templateText) {
        issues.push({
          path: `${at}.attachment.payload.text`,
          problem: `${tplText.length} characters, max ${BLOCK_LIMITS.templateText}`,
        });
      }
      const buttons = asArr(tpl.buttons);
      if (buttons.length > BLOCK_LIMITS.buttonsPerGroup) {
        issues.push({
          path: `${at}.attachment.payload.buttons`,
          problem: `${buttons.length} buttons — Meta shows only the first ${BLOCK_LIMITS.buttonsPerGroup}`,
        });
      }
      buttons.forEach((raw, j) => {
        const btn = asObj(raw);
        const title = asStr(btn?.title);
        if (title !== null && title.length > BLOCK_LIMITS.buttonTitle) {
          issues.push({
            path: `${at}.buttons[${j}].title`,
            problem: `"${title}" is ${title.length} characters, max ${BLOCK_LIMITS.buttonTitle}`,
          });
        }
        const payload = asStr(btn?.payload);
        if (btn?.type === "postback" && payload !== null && payload.length > BLOCK_LIMITS.payload) {
          issues.push({ path: `${at}.buttons[${j}].payload`, problem: `${payload.length} characters, max ${BLOCK_LIMITS.payload}` });
        }
      });

      // Generic-template cards carry their own titles.
      asArr(tpl.elements).forEach((raw, j) => {
        const title = asStr(asObj(raw)?.title);
        if (title !== null && title.length > BLOCK_LIMITS.cardTitle) {
          issues.push({ path: `${at}.elements[${j}].title`, problem: `${title.length} characters, max ${BLOCK_LIMITS.cardTitle}` });
        }
      });
    }
  });

  return issues;
}
