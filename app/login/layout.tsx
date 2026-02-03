import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession =
    cookieStore.get("better-auth.session_token") ||
    cookieStore.get("__Secure-better-auth.session_token");

  if (hasSession) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
