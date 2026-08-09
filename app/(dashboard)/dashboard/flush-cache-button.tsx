"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { flushEngineCacheAction } from "@/actions/cache.action";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Manual cache flush for content that did not come through the CMS.
 *
 * CMS writes already invalidate on save, so this is deliberately not on every form — it exists
 * for scripts, migrations and direct SQL edits, which invalidate nothing.
 */
export function FlushCacheButton() {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const flush = () => {
    startTransition(async () => {
      const result = await flushEngineCacheAction("all");
      setOpen(false);
      if (result?.success) {
        toast.success("Engine cache cleared", {
          description: "Students on the web app keep their local copy for up to 24h until CACHE_VERSION is bumped.",
        });
      } else {
        toast.error(result?.error ?? "Could not clear the cache");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending}>
          <RefreshCw className={pending ? "h-4 w-4 mr-1.5 animate-spin" : "h-4 w-4 mr-1.5"} />
          {pending ? "Clearing…" : "Clear engine cache"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear the engine cache?</AlertDialogTitle>
          <AlertDialogDescription>
            Drops every cached response in the v2 engine so the next request reads the database.
            Saving content in this CMS already does this automatically — use it after a script,
            a migration or a direct database edit.
            <br /><br />
            This does not reach students who already have the web app open: it keeps its own copy
            for up to 24 hours.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); flush(); }} disabled={pending}>
            {pending ? "Clearing…" : "Clear cache"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
