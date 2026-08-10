"use client";

import { useState } from "react";
import { BookOpen, Check, Copy, ExternalLink, Sparkles, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * How to actually use a key.
 *
 * A key with no documentation beside it means the next person reverse-engineers the request from
 * the route handler. The agent tab exists because that is how content will mostly be added —
 * the prompt tells the agent to fetch /skill.md, which is the same document committed to the v1
 * repo, so an agent needs one curl rather than a repo checkout.
 */

const AGENTS = [
  { id: "claude", label: "Claude Code", note: "Claude Code loads Agent Skills natively, so the file works as-is with no editing." },
  { id: "codex", label: "Codex", note: "Codex reads AGENTS.md; save the skill there or reference it from your existing one." },
  { id: "gemini", label: "Gemini CLI", note: "Gemini CLI reads GEMINI.md; save the skill there or reference it." },
  { id: "opencode", label: "OpenCode", note: "OpenCode reads AGENTS.md at the project root." },
] as const;

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard refused; the text is selectable */ }
  };
  return (
    <div className="rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-xs text-muted-foreground">{label ?? ""}</span>
        <Button variant="ghost" size="xs" onClick={copy}>
          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed font-mono">{code}</pre>
    </div>
  );
}

export function ApiUsage({ baseUrl }: { baseUrl: string }) {
  const [agent, setAgent] = useState<(typeof AGENTS)[number]["id"]>("claude");
  const [example, setExample] = useState<"note" | "link" | "dup">("note");
  const active = AGENTS.find((a) => a.id === agent)!;

  const agentPrompt = `Set yourself up to add content to NoteBot.

1. Download the NoteBot content skill from ${baseUrl}/skill.md
2. Save it to .claude/skills/notebot-content/SKILL.md. The folder must be named
   notebot-content — Claude Code matches it against the skill's name field.
3. Read it, then tell me what you can now do with NoteBot.

Use this configuration:
  NOTEBOT_BASE_URL = ${baseUrl}
  NOTEBOT_API_KEY  = paste-your-nbk-key-here

Keep the key in an environment variable. Do not write it into any file that
gets committed, and do not repeat it back to me.`;

  const examples = {
    note: `# Add a note under an existing topic
curl -X POST "${baseUrl}/api/v1/ingest/note" \\
  -H "x-api-key: $NOTEBOT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "1",
    "subject": { "slug": "fpc" },
    "topic":   { "slug": "fpcDegradation" },
    "title": "Hand Note(Jeba Fariha, TME-51, 2026)",
    "url": "https://drive.google.com/file/d/FILE_ID/view"
  }'

# 201 Created
# { "ok": true, "duplicate": false, "created": { "note": true },
#   "note": { "id": 2451 }, "route": "app/notes/1/fpc" }`,
    link: `# Subject-level link — omit "topic" entirely.
# Creates the subject too if the slug is unknown; pass displayName or it is
# named after its slug.
curl -X POST "${baseUrl}/api/v1/ingest/note" \\
  -H "x-api-key: $NOTEBOT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "3",
    "subject": { "slug": "tc_i", "displayName": "TC-I" },
    "title": "QB Solve(Akash, NTEC)",
    "url": "https://drive.google.com/file/d/FILE_ID/view"
  }'`,
    dup: `# Posting the same Drive file twice under the same topic is safe.
# Idempotency is keyed on the Drive FILE ID, so ?usp=sharing does not matter.
curl -X POST "${baseUrl}/api/v1/ingest/note" \\
  -H "x-api-key: $NOTEBOT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "level":"1", "subject":{"slug":"fpc"}, "topic":{"slug":"fpcDegradation"},
        "title":"Hand Note(Jeba Fariha, TME-51, 2026)",
        "url":"https://drive.google.com/file/d/FILE_ID/view?usp=sharing" }'

# 200 OK — nothing was created
# { "ok": true, "duplicate": true, "created": { "note": false } }`,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Use NoteBot from your AI agent
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick your agent, then paste the prompt into its CLI. It will fetch the NoteBot skill,
            install it where that tool expects, and be able to add content on your behalf.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((a) => (
              <Button
                key={a.id}
                variant={agent === a.id ? "default" : "outline"}
                size="sm"
                onClick={() => setAgent(a.id)}
              >
                {a.label}
              </Button>
            ))}
          </div>
          <CodeBlock code={agentPrompt} label={`Open your ${active.label} terminal and paste this prompt`} />
          <p className="text-xs text-muted-foreground">{active.note}</p>
          <p className="text-xs text-muted-foreground">
            Swap the placeholder for a real key from the <strong>Keys</strong> tab.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">Calling the API directly</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Authenticate with{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">x-api-key: nbk_…</code>{" "}
                against{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{baseUrl}/api/v1</code>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <a href="/skill.md" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Terminal className="h-3.5 w-3.5 mr-1.5" />
                  SKILL.md
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {([["note", "Add a note"], ["link", "Subject-level link"], ["dup", "Retry safety"]] as const).map(
              ([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setExample(id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    example === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              )
            )}
          </div>
          <CodeBlock code={examples[example]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Things that will bite you
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium">Messenger cuts button titles at 20 characters</dt>
              <dd className="text-muted-foreground">
                Subject and topic display names become buttons, so both are cut — silently. A note
                title under a topic is a text bubble and is not cut.
              </dd>
            </div>
            <div>
              <dt className="font-medium">A 4th button in a group is discarded</dt>
              <dd className="text-muted-foreground">Meta allows three, with no error for the rest.</dd>
            </div>
            <div>
              <dt className="font-medium">Slugs are matched case-insensitively</dt>
              <dd className="text-muted-foreground">
                Some subjects are stored upper-case (<code className="font-mono text-xs">IAE</code>).
                v1 and v2 also disagree on a few: <code className="font-mono text-xs">tc1</code>→
                <code className="font-mono text-xs">tc_i</code>,{" "}
                <code className="font-mono text-xs">econo</code>→
                <code className="font-mono text-xs">economics</code>.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Writing straight to the database needs a cache flush</dt>
              <dd className="text-muted-foreground">
                This API flushes for you. A script does not, and the change looks like it failed for
                up to an hour. Students keep their own copy for 6 hours on top of that.
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
