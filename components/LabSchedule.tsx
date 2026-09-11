"use client";

import { useState, useEffect } from "react";
import {
  DAYS_OF_WEEK,
  getCurrentDayName,
  isSessionActive,
  Session,
} from "@/lib/schedule";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Monitor, User } from "lucide-react";

interface LabScheduleProps {
  sessions: Session[];
}

export default function LabSchedule({ sessions }: LabScheduleProps) {
  const today = getCurrentDayName();
  const [selectedDay, setSelectedDay] = useState<string>(today);

  // Initializer function untuk menghindari cascading renders
  const [, setNow] = useState(() => new Date());

  // Update timer setiap menit untuk memicu re-render status live
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredSessions = sessions.filter(
    (session) => session.day === selectedDay
  );

  return (
    <div className="w-full space-y-6">
      {/* Tab / Penanda Hari Aktif */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day === today;
          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 hover:bg-secondary text-muted-foreground"
              }`}
            >
              {day}
              {/* Badge Hari Ini */}
              {isToday && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Header Info Hari */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">
          Jadwal Hari {selectedDay}
        </h2>
        {selectedDay === today && (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600 gap-1.5 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Hari Ini
          </Badge>
        )}
      </div>

      {/* List Sesi/Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            Tidak ada jadwal perkuliahan untuk hari {selectedDay}.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const active = isSessionActive(
              session.day,
              session.startTime || session.start_time,
              session.endTime || session.end_time
            );

            return (
              <Card
                key={session.id}
                className={`relative overflow-hidden transition-all border-2 ${
                  active
                    ? "border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/50"
                    : "hover:border-primary/50"
                }`}
              >
                {/* Visual Bar Penanda Berlangsung */}
                {active && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
                )}

                <CardHeader className="pb-3 pt-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold leading-snug">
                      {session.courseName}
                    </CardTitle>
                    {active ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse">
                        Sedang Berlangsung
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Terjadwal</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Monitor className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      {session.labName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    <span>{session.lecturer}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="font-semibold text-foreground">
                      {session.startTime} - {session.endTime} WITA
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}