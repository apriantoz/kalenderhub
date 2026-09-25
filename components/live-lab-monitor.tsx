"use client";

import { useMemo, useState, useEffect } from "react";
import { Schedule, getCurrentDayName, isSessionActive } from "@/lib/schedule";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitorPlay, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { LAB_ROOMS } from "@/lib/room-constants";

interface LiveLabMonitorProps {
  schedules: Schedule[];
}

export function LiveLabMonitor({ schedules }: LiveLabMonitorProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const todayName = getCurrentDayName();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const allRooms = useMemo(() => {
    const dbRooms = schedules
      .map((s) => s.room)
      .filter((r): r is string => Boolean(r));
    return Array.from(new Set([...LAB_ROOMS, ...dbRooms])).sort();
  }, [schedules]);

  const todaySchedules = useMemo(() => {
    return schedules.filter((s) => s.day === todayName);
  }, [schedules, todayName]);

  const roomStatuses = useMemo(() => {
    return allRooms.map((room) => {
      const roomSchedules = todaySchedules.filter((s) => s.room === room);
      const activeSchedule = roomSchedules.find((s) =>
        isSessionActive(s.day, s.start_time, s.end_time),
      );
      const nowString = currentTime.toTimeString().slice(0, 5);
      const upcomingSchedule = roomSchedules
        .filter((s) => s.start_time && s.start_time > nowString)
        .sort((a, b) =>
          (a.start_time || "").localeCompare(b.start_time || ""),
        )[0];

      return {
        room,
        activeSchedule,
        upcomingSchedule,
        totalToday: roomSchedules.length,
      };
    });
  }, [allRooms, todaySchedules, currentTime]);

  const sortedRooms = useMemo(() => {
    return [...roomStatuses].sort((a, b) => {
      if (a.activeSchedule && !b.activeSchedule) return -1;
      if (!a.activeSchedule && b.activeSchedule) return 1;
      return (a.room || "").localeCompare(b.room || "");
    });
  }, [roomStatuses]);

  return (
    <Card className="border-border/60 shadow-sm flex flex-col h-full">
      <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary text-primary">
            <MonitorPlay className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold tracking-tight">
              Live Status Lab ({todayName})
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground leading-none mt-0.5">
              Pemantauan real-time ketersediaan seluruh ruangan lab komputer.
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-3 py-1 rounded-lg border border-primary bg-primary/10">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Makassar",
              })}{" "}
              WITA
            </span>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-center">
        {allRooms.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 text-center py-6 italic">
            Belum ada data ruangan atau jadwal terdaftar.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {sortedRooms.map(
              ({ room, activeSchedule, upcomingSchedule, totalToday }) => {
                return (
                  <div
                    key={room}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between bg-card ${
                      activeSchedule
                        ? "border-primary/40 bg-primary/5 shadow-xs"
                        : "border-border/80 hover:border-primary/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div>
                          <span className="font-extrabold text-sm tracking-tight leading-tight block">
                            Ruang {room}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {totalToday} Sesi Hari Ini
                          </span>
                        </div>

                        {activeSchedule ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold border-primary/30 bg-primary-500/10 text-primary dark:text-primary gap-1 px-2 py-0.5"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                            Digunakan
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold gap-1 px-2 py-0.5"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            Tersedia
                          </Badge>
                        )}
                      </div>

                      {activeSchedule ? (
                        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-mono tracking-wider text-primary font-bold">
                              Sedang Berlangsung
                            </span>
                            <span className="font-mono text-[11px] font-bold text-primary dark:text-primary">
                              {activeSchedule.start_time} -{" "}
                              {activeSchedule.end_time}
                            </span>
                          </div>
                          <p className="text-md font-bold text-primary dark:text-primary-foreground/80 line-clamp-1">
                            {activeSchedule.course_name ||
                              activeSchedule.courseName}
                          </p>
                          <span className="text-[11px] text-muted-foreground block line-clamp-1">
                            {activeSchedule.prodi}
                          </span>
                        </div>
                      ) : upcomingSchedule ? (
                        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-0.5">
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            <AlertCircle className="h-3 w-3" />
                            <span>
                              Berikutnya ({upcomingSchedule.start_time} WITA):
                            </span>
                          </div>
                          <p className="text-xs font-semibold line-clamp-1">
                            {upcomingSchedule.course_name ||
                              upcomingSchedule.courseName}
                          </p>
                        </div>
                      ) : (
                        <div className="py-3 text-center bg-muted/20 rounded-lg border border-dashed border-border/60">
                          <p className="text-[11px] text-muted-foreground/60 italic">
                            Tidak ada jadwal tersisa hari ini.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Status</span>
                      <span
                        className={`font-semibold font-mono ${activeSchedule ? "text-primary" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        {activeSchedule ? "OCCUPIED" : "READY"}
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
