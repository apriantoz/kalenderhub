import { Skeleton } from "@/components/ui/skeleton";

export function ScheduleSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Skeleton untuk Filter Bar & Tombol Export */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-full md:w-48 rounded-md" />
          <Skeleton className="h-10 w-full md:w-48 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full md:w-32 rounded-md" />
      </div>

      {/* Skeleton untuk Timeline Jadwal (Meniru card per hari/sesi) */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl border bg-card space-y-3">
          <Skeleton className="h-6 w-32 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card space-y-3">
          <Skeleton className="h-6 w-32 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}