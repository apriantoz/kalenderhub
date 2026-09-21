"use client";

import { useMemo, useState, useEffect } from "react";
import { Schedule, getCurrentDayName, isSessionActive } from "@/lib/schedule";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitorPlay, Clock, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { LAB_ROOMS } from "@/lib/room-constants";

interface LiveLabMonitorProps {
  schedules: Schedule[];
}

export function LiveLabMonitor({ schedules }: LiveLabMonitorProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const todayName = getCurrentDayName();

  // Update timer tiap 30 detik agar status real-time akurat
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Ambil daftar semua ruangan unik dari database
  const allRooms = useMemo(() => {
    const dbRooms = schedules.map((s) => s.room).filter(Boolean);
    return Array.from(new Set([...LAB_ROOMS, ...dbRooms])).sort();
  }, [schedules]);

  // Filter jadwal khusus hari ini
  const todaySchedules = useMemo(() => {
    return schedules.filter((s) => s.day === todayName);
  }, [schedules, todayName]);

  // Petakan status ruangan hari ini secara real-time
  const roomStatuses = useMemo(() => {
    return allRooms.map((room) => {
      const roomSchedules = todaySchedules.filter((s) => s.room === room);
      
      // Cari yang sedang aktif sekarang
      const activeSchedule = roomSchedules.find((s) =>
        isSessionActive(s.day, s.start_time, s.end_time)
      );

      // Cari jadwal berikutnya hari ini (yang jam mulainya di atas jam sekarang)
      const nowString = currentTime.toTimeString().slice(0, 5);
      const upcomingSchedule = roomSchedules
        .filter((s) => s.start_time && s.start_time > nowString)
        .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))[0];

      return {
        room,
        activeSchedule,
        upcomingSchedule,
        totalToday: roomSchedules.length,
      };
    });
  }, [allRooms, todaySchedules, currentTime]);

  return (
    <Card>
      <CardHeader className="pb-4 border-b rounded-t-xl flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <MonitorPlay className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Monitor Status Ruangan ({todayName})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/80 mt-0.5">
              Pemantauan penggunaan laboratorium komputer secara langsung berdasarkan waktu sistem.
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-3 py-1.5 rounded-md border">
            <Clock className="h-3.5 w-3.5" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WITA</span>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-1">
        {allRooms.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 text-center py-6 italic">
            Belum ada data ruangan atau jadwal terdaftar.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {roomStatuses.map(({ room, activeSchedule, upcomingSchedule, totalToday }) => (
              <div
                key={room}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between backdrop-blur-xs ${
                  activeSchedule
                    ? "border-indigo-500/30 bg-indigo-900/30"
                    : " hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Header Ruangan & Badge Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded border border-indigo-500/30">
                        <Building2 className="h-4 w-4 text-indigo-400" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">Ruang {room}</span>
                    </div>

                    {activeSchedule ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium border-indigo-500/30"
                      >
                        <span className="h-1.5 w-1.5 text-indigo-500 rounded-full bg-indigo-500 animate-ping" />
                        Sedang Digunakan
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-muted/30 text-muted-foreground text-[10px] font-medium gap-1 py-0.5"
                      >
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground/70" />
                        Tersedia / Kosong
                      </Badge>
                    )}
                  </div>

                  {/* Konten Detail Kelas */}
                  {activeSchedule ? (
                    <div className="space-y-1.5 my-2 p-2.5 rounded-lg">
                      <p className="text-xs font-semibold line-clamp-1">
                        {activeSchedule.course_name || activeSchedule.courseName}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{activeSchedule.prodi}</span>
                        <span className="font-mono font-medium">
                          {activeSchedule.start_time} - {activeSchedule.end_time}
                        </span>
                      </div>
                    </div>
                  ) : upcomingSchedule ? (
                    <div className="space-y-1 my-2 p-2.5 rounded-lg bg-amber-900/50">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 font-medium">
                        <AlertCircle className="h-3 w-3 text-amber-400 animate-ping" />
                        <span>Kelas Berikutnya:</span>
                      </div>
                      <p className="text-xs font-medium line-clamp-1">
                        {upcomingSchedule.course_name || upcomingSchedule.courseName} ({upcomingSchedule.prodi})
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground/80">
                        Mulai pukul {upcomingSchedule.start_time}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 italic py-3 text-center">
                      Tidak ada kelas lagi hari ini.
                    </p>
                  )}
                </div>

                {/* Footer Kecil */}
                <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] text-muted-foreground/80">
                  <span>Total Sesi Hari Ini:</span>
                  <span className="font-mono font-semibold">
                    {totalToday} Sesi
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}