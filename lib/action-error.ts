/**
 * First human-readable message from an action result: a plain `error` string, or the first
 * message in a Zod `fieldErrors` map. Lets a form say "Pick a topic" instead of "Failed".
 */
export function firstError(result: unknown): string | undefined {
  const error = (result as { error?: unknown } | null)?.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    for (const messages of Object.values(error as Record<string, unknown>)) {
      if (Array.isArray(messages) && typeof messages[0] === "string") return messages[0];
    }
  }
  return undefined;
}
