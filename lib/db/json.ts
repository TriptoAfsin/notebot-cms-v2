/**
 * JSON value types for jsonb columns. `Record<string, unknown>` can't be proven serializable, so
 * TanStack Start rejects server functions that return rows typed with it; these types can be.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };
