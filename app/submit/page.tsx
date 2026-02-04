import { getSubmissionConfig } from "@/actions/app-settings.action";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const config = await getSubmissionConfig();
  return <SubmitForm config={config} />;
}
