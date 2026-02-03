import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background pattern-dots px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-foreground">404</h1>
          <p className="text-lg text-muted-foreground">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground/80">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="lg">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
