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
  Calendar1Icon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleTimelineProps {
  filteredSchedules: Schedule[];
  allSchedules: Schedule[]; // <-- Data utuh untuk referensi pencarian detail bentrok
  conflictingIds: Set<string>;
  isAdmin: boolean;
  onReloadSchedules: () => void;
  onDeleteClick: (id: string, courseName: string) => void;
}

export function ScheduleTimeline({
  filteredSchedules,
  allSchedules,
  conflictingIds,
  isAdmin,
  onReloadSchedules,
  onDeleteClick,
}: ScheduleTimelineProps) {
  const todayName = getCurrentDayName(false);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-full box-border">
      {DAYS_OF_WEEK.map((day) => {
        const isToday = day.toLowerCase() === todayName.toLowerCase();
        const daySchedules = schedulesByDay[day] || [];

        return (
          <Card
            key={day}
            className="w-full transition-all duration-200 overflow-hidden flex flex-col"
          >
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
              <CardTitle className="w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-sm tracking-tight">
                    {day}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                    {daySchedules.length} Sesi
                  </Badge>
                </div>
              </CardTitle>
              
              <CardAction className="self-start sm:self-auto">
                {isToday && (
                  <Badge className="inline-flex animate-pulse text-[10px] px-1.5 py-0.5">
                    <Calendar1Icon className="h-3 w-3 mr-1" />
                    Hari ini
                  </Badge>
                )}
              </CardAction>
            </CardHeader>

            <CardContent className="pt-4 overflow-hidden flex-1">
              {daySchedules.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 italic py-4 text-center">
                  Tidak ada jadwal.
                </p>
              ) : (
                <div className="flex flex-col w-full">
                  {daySchedules.map((item, index) => {
                    const isConflict = conflictingIds.has(item.id);

                    const startTime = item.start_time || item.startTime || "";
                    const endTime = item.end_time || item.endTime || "";
                    
                    // Ambil nama mata kuliah dari relasi courses, dengan fallback ke properti lama
                    const courseName =
                      item.courses?.name ||
                      item.course_name ||
                      item.courseName ||
                      "Tanpa Nama Mata Kuliah";

                    // Ambil prodi dari relasi courses atau fallback properti lama
                    const prodiName =
                      item.courses?.prodi_code ||
                      item.prodi ||
                      "";

                    const roomName = item.room || item.labName || "-";

                    let conflictDetail = "";
                    if (isConflict) {
                      const conflictingPartner = allSchedules.find(
                        (s) =>
                          s.id !== item.id &&
                          s.day?.trim().toLowerCase() === item.day?.trim().toLowerCase() &&
                          (s.room || s.labName) === roomName &&
                          ((s.start_time || s.startTime || "") < endTime &&
                            (s.end_time || s.endTime || "") > startTime)
                      );

                      if (conflictingPartner) {
                        const partnerCourse =
                          conflictingPartner.courses?.name ||
                          conflictingPartner.course_name ||
                          conflictingPartner.courseName ||
                          "Matkul Lain";
                        const partnerProdi =
                          conflictingPartner.courses?.prodi_code ||
                          conflictingPartner.prodi ||
                          "Prodi Lain";
                        conflictDetail = ` (${partnerProdi} - ${partnerCourse})`;
                      }
                    }

                    const isActive = isSessionActive(
                      item.day,
                      startTime,
                      endTime,
                    );
                    const isLast = index === daySchedules.length - 1;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 group w-full min-w-0"
                      >
                        {/* Timeline Bullet & Line */}
                        <div className="relative flex flex-col items-center shrink-0 w-3">
                          <div
                            className={cn(
                              "absolute top-0 w-0.5 bg-slate-300 group-hover:bg-slate-300 transition-colors",
                              isLast ? "h-3" : "bottom-0",
                            )}
                          />
                          <div
                            className={cn(
                              "h-3 w-3 rounded-full border-2 transition-all group-hover:scale-125 z-10 shrink-0 mt-1",
                              isActive
                                ? "bg-primary border-primary"
                                : isConflict
                                  ? "border-rose-400 bg-rose-500 animate-pulse"
                                  : "border-slate-300 bg-muted group-hover:border-slate-400",
                            )}
                          />
                        </div>

                        {/* Timeline Content */}
                        <div className="flex-1 pb-5 min-w-0 overflow-hidden">
                          <div className="flex flex-col gap-2 pb-3 border-b w-full min-w-0">
                            <div className="space-y-1 w-full min-w-0">
                              <h4 className="font-medium text-xs leading-snug break-words group-hover:text-primary transition-colors">
                                {courseName}
                              </h4>

                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground/80">
                                <span className="font-medium text-muted-foreground flex items-center">
                                  <Monitor className="h-3 w-3 inline-block mr-1" />
                                  {roomName}
                                </span>
                                {prodiName && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="truncate max-w-[100px]">{prodiName}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <span
                                className={cn(
                                  "text-[10px] font-mono px-2 py-0.5 rounded font-medium border shrink-0",
                                  isActive
                                    ? "bg-primary text-white border-primary"
                                    : isConflict
                                      ? "bg-rose-600 text-white border-rose-600"
                                      : "text-muted-foreground bg-muted",
                                )}
                              >
                                {startTime} - {endTime}
                              </span>

                              {isAdmin && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <EditScheduleDialog
                                    schedule={item}
                                    onSuccess={onReloadSchedules}
                                  />

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-rose-400 hover:text-rose-500 hover:bg-rose-950/20 rounded"
                                    onClick={() =>
                                      onDeleteClick(item.id, courseName)
                                    }
                                    title="Hapus Jadwal"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {(isActive || isConflict) && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {isActive && (
                                  <Badge
                                    variant="ghost"
                                    className="text-[9px] h-4 px-1 font-medium gap-1 text-primary bg-primary/10"
                                  >
                                    <Radio className="h-2 w-2 animate-ping text-primary" />
                                    Berlangsung
                                  </Badge>
                                )}

                                {isConflict && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[9px] h-4 px-1 font-medium gap-1 animate-pulse truncate max-w-full"
                                    title={`Bentrok dengan${conflictDetail}`}
                                  >
                                    <AlertTriangle className="h-2 w-2 shrink-0" />
                                    <span className="truncate">Bentrok{conflictDetail}</span>
                                  </Badge>
                                )}
                              </div>
                            )}
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