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
    const b = block as Record<string, any>;
    const hasText = typeof b.text === "string";
    const hasAttachment = b.attachment && typeof b.attachment === "object";
    if (!hasText && !hasAttachment) {
      issues.push({ path: at, problem: "needs a `text` or an `attachment`" });
    }
    if (hasText && b.text.length > BLOCK_LIMITS.text) {
      issues.push({ path: `${at}.text`, problem: `${b.text.length} characters, max ${BLOCK_LIMITS.text}` });
    }

    if (Array.isArray(b.quick_replies)) {
      if (b.quick_replies.length > BLOCK_LIMITS.quickReplies) {
        issues.push({
          path: `${at}.quick_replies`,
          problem: `${b.quick_replies.length}, max ${BLOCK_LIMITS.quickReplies}`,
        });
      }
      b.quick_replies.forEach((q: any, j: number) => {
        if (typeof q?.title === "string" && q.title.length > BLOCK_LIMITS.quickReplyTitle) {
          issues.push({
            path: `${at}.quick_replies[${j}].title`,
            problem: `"${q.title}" is ${q.title.length} characters, max ${BLOCK_LIMITS.quickReplyTitle}`,
          });
        }
      });
    }

    const tpl = b.attachment?.payload;
    if (tpl && typeof tpl === "object") {
      if (typeof tpl.text === "string" && tpl.text.length > BLOCK_LIMITS.templateText) {
        issues.push({
          path: `${at}.attachment.payload.text`,
          problem: `${tpl.text.length} characters, max ${BLOCK_LIMITS.templateText}`,
        });
      }
      const buttons = Array.isArray(tpl.buttons) ? tpl.buttons : [];
      if (buttons.length > BLOCK_LIMITS.buttonsPerGroup) {
        issues.push({
          path: `${at}.attachment.payload.buttons`,
          problem: `${buttons.length} buttons — Meta shows only the first ${BLOCK_LIMITS.buttonsPerGroup}`,
        });
      }
      buttons.forEach((btn: any, j: number) => {
        if (typeof btn?.title === "string" && btn.title.length > BLOCK_LIMITS.buttonTitle) {
          issues.push({
            path: `${at}.buttons[${j}].title`,
            problem: `"${btn.title}" is ${btn.title.length} characters, max ${BLOCK_LIMITS.buttonTitle}`,
          });
        }
        if (btn?.type === "postback" && typeof btn.payload === "string" && btn.payload.length > BLOCK_LIMITS.payload) {
          issues.push({ path: `${at}.buttons[${j}].payload`, problem: `${btn.payload.length} characters, max ${BLOCK_LIMITS.payload}` });
        }
      });

      // Generic-template cards carry their own titles.
      const elements = Array.isArray(tpl.elements) ? tpl.elements : [];
      elements.forEach((el: any, j: number) => {
        if (typeof el?.title === "string" && el.title.length > BLOCK_LIMITS.cardTitle) {
          issues.push({ path: `${at}.elements[${j}].title`, problem: `${el.title.length} characters, max ${BLOCK_LIMITS.cardTitle}` });
        }
      });
    }
  });

  return issues;
}
