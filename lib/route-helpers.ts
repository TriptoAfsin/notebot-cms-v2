/**
 * Next.js handed pages `params` / `searchParams` as Promises whose values are strings. Ported page
 * code still does `await params` and `parseInt(sp.page)`, so routes rebuild that shape.
 */

/** TanStack parses `?page=2` to the number 2; Next code expects the string "2". */
export function searchAsStrings(search: Record<string, unknown>): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(search)) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === "string" ? v : typeof v === "object" ? JSON.stringify(v) : String(v);
  }
  return out;
}

/** A value that can be awaited (like Next's Promise params) and also read directly. */
export function thenable<T extends object>(value: T): Promise<T> & T {
  return Object.assign(Promise.resolve(value), value);
}
