"use client";

import { useMemo } from "react";
import {
  DAYS_OF_WEEK,
  getCurrentDayName,
  isSessionActive,
  Schedule,
} from "@/lib/schedule";
import { EditScheduleDialog } from "@/components/edit-schedule-dialog";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  AlertTriangle,
  Radio,
  CogIcon,
  Monitor,
  Calendar1Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleTimelineProps {
  filteredSchedules: Schedule[];
  conflictingIds: Set<string>;
  isAdmin: boolean;
  onReloadSchedules: () => void;
  onDeleteClick: (id: string, courseName: string) => void;
}

export function ScheduleTimeline({
  filteredSchedules,
  conflictingIds,
  isAdmin,
  onReloadSchedules,
  onDeleteClick,
}: ScheduleTimelineProps) {
  const todayName = getCurrentDayName(false);

  // Mengelompokkan jadwal berdasarkan hari menggunakan useMemo
  const schedulesByDay = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      map[day] = filteredSchedules.filter(
        (s) => s.day?.trim().toLowerCase() === day.toLowerCase(),
      );
    });
    return map;
  }, [filteredSchedules]);

  return (
    <div className="w-full max-w-full space-y-4 box-border">
      {DAYS_OF_WEEK.map((day) => {
        const isToday = day.toLowerCase() === todayName.toLowerCase();
        const daySchedules = schedulesByDay[day] || [];

        return (
          <Card
            key={day}
            className="w-full transition-all duration-200 overflow-hidden"
          >
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
              <CardTitle className="w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold text-base tracking-tight">
                    {day}
                  </h3>
                  <Badge variant="secondary">{daySchedules.length} Sesi</Badge>
                </div>
              </CardTitle>
              <CardDescription />
              <CardAction className="self-start sm:self-auto">
                {isToday && (
                  <Badge className="inline-flex animate-pulse">
                    <Calendar1Icon />
                    Hari ini
                  </Badge>
                )}
              </CardAction>
            </CardHeader>

            <CardContent className="pt-6 overflow-hidden">
              {daySchedules.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 italic py-4 text-center">
                  Tidak ada jadwal perkuliahan pada hari ini.
                </p>
              ) : (
                <div className="flex flex-col w-full">
                  {daySchedules.map((item, index) => {
                    const isConflict = conflictingIds.has(item.id);

                    const startTime = item.start_time || item.startTime;
                    const endTime = item.end_time || item.endTime;
                    const courseName =
                      item.course_name ||
                      item.courseName ||
                      "Tanpa Nama Mata Kuliah";
                    const roomName = item.room || item.labName || "-";

                    const isActive = isSessionActive(
                      item.day,
                      startTime,
                      endTime,
                    );
                    const isLast = index === daySchedules.length - 1;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 group w-full min-w-0"
                      >
                        {/* Kolom Garis & Dot Timeline */}
                        <div className="relative flex flex-col items-center shrink-0 w-4">
                          <div
                            className={cn(
                              "absolute top-0 w-[2px] bg-slate-300 group-hover:bg-slate-300 transition-colors",
                              isLast ? "h-3" : "bottom-0",
                            )}
                          />
                          <div
                            className={cn(
                              "h-3.5 w-3.5 rounded-full border-2 transition-all group-hover:scale-125 z-10 shrink-0 mt-1.5",
                              isActive
                                ? "bg-primary"
                                : isConflict
                                  ? "border-rose-400 bg-rose-500 animate-pulse"
                                  : "border-slate-300 bg-muted group-hover:border-slate-400",
                            )}
                          />
                        </div>

                        {/* Konten Timeline */}
                        <div className="flex-1 pb-6 min-w-0 overflow-hidden">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b w-full min-w-0">
                            {/* Bagian Kiri: Mata Kuliah & Info Ruang/Prodi */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <h4 className="font-medium text-sm leading-snug break-words group-hover:text-primary transition-colors max-w-full">
                                  {courseName}
                                </h4>

                                {isActive && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-medium gap-1 shrink-0"
                                  >
                                    <Radio className="h-3 w-3 animate-ping text-primary" />
                                    Sedang Berlangsung
                                  </Badge>
                                )}

                                {isConflict && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px] font-medium gap-1 animate-pulse shrink-0"
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    Bentrok Jadwal
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                                <span className="font-medium text-muted-foreground">
                                  <Monitor className="h-3 w-3 inline-block mr-1" />
                                  Ruang {roomName}
                                </span>
                                {item.prodi && (
                                  <>
                                    <span>&bull;</span>
                                    <span>{item.prodi}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Waktu & Tombol Aksi Admin */}
                            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                              <span
                                className={cn(
                                  "text-xs font-mono px-2.5 py-1 rounded-md font-medium border",
                                  isActive
                                    ? "bg-primary text-white"
                                    : isConflict
                                      ? "bg-rose-600 text-white"
                                      : "text-muted-foreground",
                                )}
                              >
                                {startTime} - {endTime}
                              </span>

                              {isAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground/60 rounded-lg"
                                      >
                                        <CogIcon className="h-4 w-4" />
                                      </Button>
                                    }
                                  />
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-36 text-xs bg-background/50 backdrop-blur-md"
                                  >
                                    <EditScheduleDialog
                                      schedule={item}
                                      onSuccess={onReloadSchedules}
                                    />
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() =>
                                        onDeleteClick(item.id, courseName)
                                      }
                                      className="cursor-pointer gap-2 py-1.5 text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-950/40"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Hapus</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
