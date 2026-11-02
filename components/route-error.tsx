import { useEffect } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);
  const unauthorized = error instanceof Error && error.message === "Unauthorized";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold">{unauthorized ? "Your session has ended" : "Something went wrong"}</h1>
        <p className="text-sm text-muted-foreground">
          {unauthorized ? "Sign in again to continue." : "This page failed to load. Try again, or go back to the dashboard."}
        </p>
        <div className="flex justify-center gap-2">
          {unauthorized ? (
            <Button onClick={() => router.navigate({ to: "/login" })}>Sign in</Button>
          ) : (
            <Button
              onClick={() => {
                reset();
                router.invalidate();
              }}
            >
              Try again
            </Button>
          )}
          <Button variant="outline" onClick={() => router.navigate({ to: "/dashboard" })}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
