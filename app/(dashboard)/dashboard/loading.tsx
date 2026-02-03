import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-8 w-8 rounded-lg mb-2" />
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
