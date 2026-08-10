import { getDeliveriesAction, getWebhooksAction } from "@/actions/webhooks.action";
import { WebhooksView } from "./webhooks-view";

export default async function WebhooksPage() {
  const [hooks, deliveries] = await Promise.all([getWebhooksAction(), getDeliveriesAction()]);
  return <WebhooksView hooks={hooks} deliveries={deliveries} />;
}
