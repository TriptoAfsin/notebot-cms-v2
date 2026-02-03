import { getSubmissionConfig } from "@/actions/app-settings";
import { SubmitForm } from "./submit-form";

export default async function SubmitPage() {
  const config = await getSubmissionConfig();
  return <SubmitForm config={config} />;
}
