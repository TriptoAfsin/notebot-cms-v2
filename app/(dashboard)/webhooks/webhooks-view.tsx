"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Plus, Send, Webhook } from "lucide-react";
import { toast } from "sonner";

import {
  createWebhookAction, deleteWebhookAction, testWebhookAction, toggleWebhookAction,
} from "@/actions/webhooks.action";
import { DeleteDialog } from "@/components/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { WEBHOOK_EVENTS } from "@/lib/webhooks";
import { cn } from "@/lib/utils";

type Hook = {
  id: number; label: string; url: string; secret: string;
  events: string[]; enabled: boolean; disabledReason: string | null;
  consecutiveFailures: number; createdAt: Date | string;
};
type Delivery = {
  id: number; webhookId: number; event: string;
  responseStatus: number | null; error: string | null;
  attempts: number; durationMs: number | null; createdAt: Date | string;
};

export function WebhooksView({ hooks, deliveries }: { hooks: Hook[]; deliveries: Delivery[] }) {
  const [pending, startTransition] = useTransition();
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const create = (formData: FormData) => {
    startTransition(async () => {
      const result = await createWebhookAction(formData);
      if (result?.success && "secret" in result) {
        setSecret(result.secret as string);
        toast.success("Webhook created");
      } else {
        toast.error("Could not create the webhook");
      }
    });
  };

  const test = (id: number) => {
    startTransition(async () => {
      const result = await testWebhookAction(id);
      if (result && "success" in result && result.success) {
        toast.success(`Delivered — HTTP ${(result as { status?: number }).status}`);
      } else {
        toast.error(("error" in (result ?? {}) ? (result as { error?: string }).error : null) ?? "Test failed");
      }
    });
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Push form submissions and content changes to another system instead of making it poll.
        </p>
      </div>

      {secret && (
        <Card className="mb-6 border-primary/40 bg-primary/5">
          <CardHeader><CardTitle className="text-base">Signing secret</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your receiver uses this to verify the{" "}
              <code className="font-mono text-xs">X-NoteBot-Signature</code> header. It stays
              visible in the table below, so this is a convenience, not your only chance.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <code className="flex-1 overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-xs">{secret}</code>
              <Button variant="outline" onClick={() => copy(secret)}>
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" onClick={() => setSecret(null)}>Done</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Add an endpoint</CardTitle></CardHeader>
        <CardContent>
          <form action={create} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" placeholder="n8n submissions" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" type="url" placeholder="https://example.com/hooks/notebot" required />
              </div>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Events</legend>
              <p className="text-xs text-muted-foreground">Select none to receive everything.</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                {WEBHOOK_EVENTS.map((e) => (
                  <label key={e} className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" name="events" value={e} className="h-3.5 w-3.5 rounded border-input" />
                    <code className="font-mono">{e}</code>
                  </label>
                ))}
              </div>
            </fieldset>
            <Button type="submit" disabled={pending}>
              <Plus className="h-4 w-4 mr-1.5" />
              {pending ? "Saving…" : "Add endpoint"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg border overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-40">Events</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-52">Secret</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hooks.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.label}</TableCell>
                <TableCell className="max-w-[16rem] truncate font-mono text-xs" title={h.url}>{h.url}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {h.events?.length ? h.events.join(", ") : "all"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      h.enabled
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    )}
                    title={h.disabledReason ?? undefined}
                  >
                    {h.enabled ? "enabled" : "disabled"}
                  </Badge>
                  {h.consecutiveFailures > 0 && (
                    <span className="block text-[11px] text-muted-foreground mt-1">
                      {h.consecutiveFailures} failure{h.consecutiveFailures === 1 ? "" : "s"} in a row
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => copy(h.secret)}
                    className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                    title="Copy signing secret"
                  >
                    {h.secret.slice(0, 14)}… <Copy className="h-3 w-3" />
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon-xs" title="Send a test delivery"
                      onClick={() => test(h.id)} disabled={pending || !h.enabled}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="xs"
                      onClick={() => startTransition(async () => { await toggleWebhookAction(h.id, !h.enabled); })}>
                      {h.enabled ? "Disable" : "Enable"}
                    </Button>
                    <DeleteDialog itemName={`webhook “${h.label}”`} onDelete={() => deleteWebhookAction(h.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {hooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  <Webhook className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  No endpoints yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <h2 className="text-sm font-medium mb-2">Recent deliveries</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Every attempt is recorded. Without this an endpoint quietly returning 500 looks identical
        to one that was never called.
      </p>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">When</TableHead>
              <TableHead className="w-16">Hook</TableHead>
              <TableHead>Event</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-20">Tries</TableHead>
              <TableHead className="w-24">Took</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((d) => {
              const ok = (d.responseStatus ?? 0) >= 200 && (d.responseStatus ?? 0) < 300;
              return (
                <TableRow key={d.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs">#{d.webhookId}</TableCell>
                  <TableCell><code className="font-mono text-xs">{d.event}</code></TableCell>
                  <TableCell className={cn("text-xs font-medium", ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
                    {d.responseStatus === 0 ? "—" : d.responseStatus}
                  </TableCell>
                  <TableCell className="text-xs">{d.attempts}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.durationMs ? `${d.durationMs} ms` : "—"}</TableCell>
                  <TableCell className="max-w-[16rem] truncate text-xs text-destructive" title={d.error ?? ""}>
                    {d.error ?? ""}
                  </TableCell>
                </TableRow>
              );
            })}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-xs text-muted-foreground">
                  Nothing delivered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
