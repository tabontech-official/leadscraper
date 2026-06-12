import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-80 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-56 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Filters skeleton */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-[150px] animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-[150px] animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-[130px] animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-[150px] animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-[300px] animate-pulse rounded-md bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-5 flex-1 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-8 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
