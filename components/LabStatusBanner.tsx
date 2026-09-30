"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Wrench, Calendar, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MaintenanceItem {
  id: number;
  room_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  category?: string;
}

export function LabStatusBanner() {
  const [activeLocks, setActiveLocks] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchActiveLocks() {
      // Ambil tanggal hari ini format YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];

      // Ambil lab yang sedang terkunci (start_date <= today AND end_date >= today)
      const { data, error } = await supabase
        .from("lab_maintenances")
        .select("*")
        .gte("end_date", today)
        .lte("start_date", today);

      if (isMounted) {
        if (!error && data) {
          setActiveLocks(data);
        }
        setLoading(false);
      }
    }

    fetchActiveLocks();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || activeLocks.length === 0) return null;

  return (
    <div className="w-full space-y-2 mb-4">
      {activeLocks.map((item) => {
        const isEvent = item.category === "event";

        return (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-xs shadow-sm ${
              isEvent
                ? "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200"
                : "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isEvent
                    ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                }`}
              >
                {isEvent ? (
                  <Calendar className="h-4 w-4" />
                ) : (
                  <Wrench className="h-4 w-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-semibold text-[10px] ${
                      isEvent
                        ? "border-blue-500/40 text-blue-600 dark:text-blue-400"
                        : "border-amber-500/40 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <AlertOctagon className="h-3 w-3 mr-1 inline" />
                    {item.room_name} ({isEvent ? "Kegiatan Internal" : "Pemeliharaan"})
                  </Badge>
                  <span className="text-[11px] opacity-80 font-mono">
                    {item.start_date} s/d {item.end_date}
                  </span>
                </div>
                <p className="font-semibold text-sm mt-0.5">{item.reason}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}