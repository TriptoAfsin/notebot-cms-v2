import { getApiKeysAction } from "@/actions/api-keys.action";
import { ApiKeysView } from "./api-keys-view";

export default async function ApiKeysPage() {
  const keys = await getApiKeysAction();
  return <ApiKeysView keys={keys} />;
}
