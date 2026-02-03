import { getSubmissionConfig } from "@/actions/app-settings";
import { SubmissionSettingsForm } from "./settings-form";

export default async function SubmissionSettingsPage() {
  const config = await getSubmissionConfig();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Submission Form Settings</h1>
      <SubmissionSettingsForm config={config} />
    </div>
  );
}
