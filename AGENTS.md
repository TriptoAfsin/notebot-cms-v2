# NoteBot CMS v2

Admin dashboard for BUTEX NoteBot: notes, lab reports, question banks, routines, syllabuses, results,
community submissions and the Messenger bot's bespoke flows. Ported from Next.js 16 to
**TanStack Start** (Vite + Nitro) in November 2026 to cut memory on Railway: under the same load
locally, ~103 MB vs ~390 MB, idle ~82 MB vs ~100 MB.

## Commands

```bash
npm run dev      # vite dev
npm run build    # production build -> .output/
npm start        # node --max-old-space-size=256 .output/server/index.mjs
npm run lint     # eslint (flat config); npx tsc --noEmit type-checks
```

`.env.local` points at **production** Postgres/Redis. `vite.config.ts` loads it with `??=`, so
anything already in the environment wins: run local work with explicit local env vars.

## Layout

- `src/routes/` file routes. `_dashboard.tsx` is the authenticated shell (session check in
  `beforeLoad`, sidebar counts in its loader). Each data page defines a `loadPage` server function
  and calls it from the route loader. `src/routeTree.gen.ts` is generated; commit it.
- `src/start.ts` CSRF middleware for server functions, and a client middleware that calls
  `router.invalidate()` after every POST server function (the old `revalidatePath`).
- `actions/*.action.ts` server-function wrappers that keep the old Server Action signatures
  (`packArgs`/`unpackArgs` in `lib/server-fn.ts`). Implementations live in `actions/_impl/`
  (server-only). Every wrapper uses `requireSession` except the public ones (submission form,
  tracking, invitation register, setup).
- `features/` page components (formerly `app/`). `components/ui` and `components/evilcharts` are
  vendored (shadcn, Evil Charts) and excluded from lint.
- `services/` DB queries. `services/flow-map.service.ts` mirrors the engine's payload resolver
  (notebot-engine-v2 `services/chatbot/flow.service.ts`); change both together.
- `lib/navigation.ts`, `components/link.tsx` small shims with the old `next/navigation` API.

## Gotchas

- A server function that is only ever called from other server code is **not registered** by the
  production build ("Server function info not found"). In a `loadPage` handler, import the `_impl`
  function directly instead of calling the wrapper.
- Server function return types must be serializable: jsonb columns use `JsonObject` from
  `lib/db/json.ts`, not `Record<string, unknown>`.
- `lib/email.ts` creates the Resend client lazily; never construct it at import time.
- Review decisions in the submissions queue are sent after a 5s undo window (they email the
  student). Pending decisions flush when the page is left.
- Deploys: Railway, config in `railway.json` (Railpack, npm). Start runs on Node, not Bun.

## Design ("Ledger")

Tokens in `src/styles.css`: IBM Plex Sans/Mono, emerald accent, dense tables, mono uppercase
labels. Motion: ease-out `cubic-bezier(0.23,1,0.32,1)`, under 250ms, `scale(0.97)` on press, no
animation on keyboard actions. Charts are Evil Charts with the palette in
`features/dashboard/dashboard/chart-config.ts`.
