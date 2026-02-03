import { redirect } from "next/navigation";

// This file exists because app/(dashboard)/page.tsx handles "/" via the route group.
// Next.js prioritizes app/page.tsx over app/(dashboard)/page.tsx, so we must redirect.
export default function RootPage() {
  redirect("/dashboard");
}
