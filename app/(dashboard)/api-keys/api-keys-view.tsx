"use client";

import { useState, useTransition } from "react";
import { BookOpen, Check, Copy, KeyRound, Plus, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { createApiKeyAction, revokeApiKeyAction } from "@/actions/api-keys.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DeleteDialog } from "@/components/delete-dialog";
import { cn } from "@/lib/utils";
import { ApiUsage } from "./api-usage";

type Key = {
  id: number;
  label: string;
  prefix: string;
  createdBy: string | null;
  lastUsedAt: Date | string | null;
  expiresAt: Date | string | null;
  revokedAt: Date | string | null;
  createdAt: Date | string;
};

const when = (v: Date | string | null) => (v ? new Date(v).toLocaleString() : "—");

/** revoked beats expired beats active — the most restrictive fact is the useful one */
function keyState(k: Key) {
  if (k.revokedAt) return "revoked" as const;
  if (k.expiresAt && new Date(k.expiresAt).getTime() <= Date.now()) return "expired" as const;
  return "active" as const;
}

const EXPIRY_CHOICES = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "never", label: "Never" },
] as const;

export function ApiKeysView({ keys, baseUrl }: { keys: Key[]; baseUrl: string }) {
  const [tab, setTab] = useState<"keys" | "usage">("keys");
  const [pending, startTransition] = useTransition();
  const [minted, setMinted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [label, setLabel] = useState("");

  const create = (formData: FormData) => {
    startTransition(async () => {
      const result = await createApiKeyAction(formData);
      if (result?.success && "key" in result) {
        setMinted(result.key as string);
        setLabel("");
        toast.success("Key created — copy it now");
      } else {
        toast.error("Could not create the key");
      }
    });
  };

  const copy = async () => {
    if (!minted) return;
    try {
      await navigator.clipboard.writeText(minted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed — select the key and copy manually");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">API keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          For machine callers posting to{" "}
          <code className="font-mono text-xs">/api/v1/ingest/note</code> — n8n, a script, or an AI
          agent.
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-md border p-0.5">
        {([["keys", "Keys", KeyRound], ["usage", "API usage", BookOpen]] as const).map(([id, text, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {text}
          </button>
        ))}
      </div>

      {tab === "usage" && <ApiUsage baseUrl={baseUrl} />}

      {tab === "keys" && (
      <>
      {minted && (
        <Card className="mb-6 border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Copy this key now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Only a hash is stored, so this is the only time it can be shown. If it is lost,
              revoke it and create another.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <code className="flex-1 overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-xs">
                {minted}
              </code>
              <Button type="button" onClick={copy} variant="outline">
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setMinted(null)}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Create a key</CardTitle></CardHeader>
        <CardContent>
          <form action={create} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="label">What is it for?</Label>
              <Input
                id="label"
                name="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="n8n ingest"
                required
              />
            </div>
            <div className="space-y-2 sm:w-40">
              <Label htmlFor="expiresInDays">Expires</Label>
              <select
                id="expiresInDays"
                name="expiresInDays"
                defaultValue="90"
                className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm"
              >
                {EXPIRY_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={pending}>
              <Plus className="h-4 w-4 mr-1.5" />
              {pending ? "Creating…" : "Create key"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead className="w-40">Key</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-44">Expires</TableHead>
              <TableHead className="w-44">Last used</TableHead>
              <TableHead className="w-44">Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="font-medium">{k.label}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{k.prefix}…</TableCell>
                <TableCell>
                  {(() => {
                    const state = keyState(k);
                    const style =
                      state === "active"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : state === "expired"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-destructive/30 bg-destructive/10 text-destructive";
                    return <Badge variant="outline" className={style}>{state}</Badge>;
                  })()}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {k.expiresAt ? when(k.expiresAt) : "never"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{when(k.lastUsedAt)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {when(k.createdAt)}
                  {k.createdBy ? <span className="block">by {k.createdBy}</span> : null}
                </TableCell>
                <TableCell>
                  {!k.revokedAt && (
                    <DeleteDialog
                      itemName={`API key “${k.label}”`}
                      onDelete={() => revokeApiKeyAction(k.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {keys.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  <KeyRound className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  No keys yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Revoking keeps the row so audit entries that reference the key still resolve. A revoked or
        expired key stops working immediately — expiry is checked on every request, not by a
        scheduled sweep.
      </p>
      </>
      )}
    </div>
  );
}
