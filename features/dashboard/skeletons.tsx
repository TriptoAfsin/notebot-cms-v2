import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Route pending states. Each mirrors the page it stands in for (same title block, same card
 * edges, same row height) so the swap to real content moves nothing: the only change the eye
 * sees is grey turning into text. They render inside the dashboard shell's <Outlet/>, so the
 * sidebar and header never leave the screen.
 */

function Wrap({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-label="Loading" aria-busy="true" className={cn("page-in", className)}>
      {children}
    </div>
  );
}

/** h1 + optional sub line on the left, action buttons on the right. */
function TitleBlock({ sub = false, actions = 1 }: { sub?: boolean; actions?: number }) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-44" />
        {sub && <Skeleton className="h-4 w-72 max-w-[70vw]" />}
      </div>
      {actions > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} className={cn("h-8", i === actions - 1 ? "w-28" : "w-24")} />
          ))}
        </div>
      )}
    </div>
  );
}

const COLS = ["w-10", "w-28", "w-40", "w-48", "w-8", "w-16", "w-16"];

/** List pages: title, search + filter row, bordered table, pagination. */
export function TableSkeleton() {
  return (
    <Wrap>
      <TitleBlock />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-8 w-full sm:max-w-sm" />
        <Skeleton className="h-8 w-full sm:w-64" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex h-9 items-center gap-6 border-b bg-muted/40 px-3">
          {COLS.map((w, i) => <Skeleton key={i} className={cn("h-2.5", w, i > 3 && "hidden md:block")} />)}
        </div>
        {Array.from({ length: 10 }).map((_, r) => (
          <div key={r} className="flex h-[41px] items-center gap-6 border-b px-3 last:border-0">
            {COLS.map((w, i) => (
              <Skeleton key={i} className={cn("h-3", w, i > 3 && "hidden md:block")} style={{ opacity: 1 - r * 0.07 }} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
    </Wrap>
  );
}

/** Create / edit pages: title and one card of labelled fields. */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <Wrap className="max-w-2xl">
      <Skeleton className="mb-5 h-7 w-40" />
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    </Wrap>
  );
}

/** Settings-style pages (submission form settings, taxonomy): title + stacked cards. */
export function SettingsSkeleton() {
  return (
    <Wrap className="max-w-3xl">
      <TitleBlock sub actions={0} />
      <div className="space-y-4">
        {[3, 2].map((rows, c) => (
          <Card key={c}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-5 w-9 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </Wrap>
  );
}

/** Dashboard: greeting, four KPI tiles, content strip, the requests chart. */
export function DashboardSkeleton() {
  return (
    <Wrap>
      <TitleBlock sub actions={3} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 py-0">
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-2.5 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="mt-5 h-11 w-full rounded-lg" />
      <Card className="mt-5">
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full rounded-lg" />
        </CardContent>
      </Card>
    </Wrap>
  );
}

/** Analytics: four stat tiles, tab buttons, one table card. */
export function AnalyticsSkeleton() {
  return (
    <Wrap>
      <TitleBlock sub />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 py-0">
            <CardContent className="space-y-2 p-4 py-8">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="my-6 flex gap-2">
        {[20, 24, 28].map((w) => <Skeleton key={w} className="h-8" style={{ width: w * 4 }} />)}
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} className="flex h-[38px] items-center gap-6 border-b px-4 last:border-0">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="hidden h-3 w-24 md:block" />
            <Skeleton className="hidden h-3 w-72 md:block" />
          </div>
        ))}
      </div>
    </Wrap>
  );
}

/** Submissions review queue: list column + detail pane. */
export function QueueSkeleton() {
  return (
    <Wrap>
      <TitleBlock sub actions={3} />
      <div className="grid min-h-[560px] overflow-hidden rounded-lg border bg-card md:grid-cols-[360px_1fr]">
        <div className="border-b p-2.5 md:border-b-0 md:border-r">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="mt-2 h-8 w-full" />
          <div className="mt-3 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-md px-2 py-2.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden space-y-4 p-6 md:block">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-3 w-80" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </Wrap>
  );
}

/** Bot flow map: stats rail + canvas. */
export function MapSkeleton() {
  return (
    <Wrap>
      <TitleBlock sub actions={1} />
      <div className="grid h-[calc(100vh-220px)] min-h-[480px] overflow-hidden rounded-lg border bg-card lg:grid-cols-[264px_1fr]">
        <div className="hidden space-y-5 border-r p-4 lg:block">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
        <div className="pattern-dots relative">
          {[[8, 12], [8, 40], [34, 26], [34, 58], [60, 18], [60, 46], [60, 74]].map(([x, y], i) => (
            <Skeleton key={i} className="absolute h-9 w-36" style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
      </div>
    </Wrap>
  );
}
