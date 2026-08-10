import { headers } from "next/headers";

import { getApiKeysAction } from "@/actions/api-keys.action";
import { ApiKeysView } from "./api-keys-view";

export default async function ApiKeysPage() {
  const keys = await getApiKeysAction();

  // Derived from the request rather than hardcoded, so the copy-paste examples work on
  // localhost and on cms.butexnotebot.com without an env var to keep in sync.
  const h = await headers();
  const host = h.get("host") ?? "cms.butexnotebot.com";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";

  return <ApiKeysView keys={keys} baseUrl={`${proto}://${host}`} />;
}
