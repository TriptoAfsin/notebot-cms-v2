import { getRequest } from "@tanstack/react-start/server";

/**
 * Drop-in for Next's `headers()` from "next/headers": the headers of the request currently being
 * handled. Valid inside server functions, server routes and loaders running on the server.
 */
export async function headers(): Promise<Headers> {
  return getRequest().headers;
}
