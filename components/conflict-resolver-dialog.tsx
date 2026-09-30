"use client";

import { useState } from "react";
import { Schedule } from "@/lib/schedule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, Monitor, Clock } from "lucide-react";
import { EditScheduleDialog } from "@/components/edit-schedule-dialog";

interface ConflictResolverDialogProps {
  schedules: Schedule[];
  conflictingIds: Set<string>;
  onReloadSchedules: () => void;
}

export function ConflictResolverDialog({
  schedules,
  conflictingIds,
  onReloadSchedules,
}: ConflictResolverDialogProps) {
  const [open, setOpen] = useState(false);

  // Ambil hanya jadwal yang masuk dalam daftar konflik
  const conflictingSchedules = schedules.filter((s) => conflictingIds.has(s.id));

  if (conflictingSchedules.length === 0) {
    return null; // Sembunyikan tombol jika tidak ada konflik sama sekali
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm" className="gap-2 animate-pulse">
            <ShieldAlert className="h-4 w-4" />
            <span>Konflik Jadwal ({conflictingSchedules.length})</span>
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
            Pusat Resolusi Bentrok Ruangan Lab
          </DialogTitle>
          <DialogDescription>
            Sistem mendeteksi {conflictingSchedules.length} sesi praktikum yang menggunakan ruangan dan waktu yang sama secara bersamaan. Silakan edit atau sesuaikan jadwal di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {conflictingSchedules.map((item) => {
            const startTime = item.start_time || item.startTime || "";
            const endTime = item.end_time || item.endTime || "";
            const courseName = item.course_name || item.courseName || "Tanpa Nama";
            const roomName = item.room || item.labName || "-";

            // Cari pasangan bentroknya untuk informasi spesifik
            const conflictingPartner = schedules.find(
              (s) =>
                s.id !== item.id &&
                s.day?.trim().toLowerCase() === item.day?.trim().toLowerCase() &&
                (s.room || s.labName) === roomName &&
                ((s.start_time || s.startTime || "") < endTime &&
                  (s.end_time || s.endTime || "") > startTime)
            );

            return (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                      {item.day}
                    </Badge>
                    <span className="text-xs font-mono font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {startTime} - {endTime}
                    </span>
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      <Monitor className="h-3 w-3" /> {roomName}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-foreground">{courseName}</h4>
                  
                  <p className="text-xs text-muted-foreground">
                    Prodi: <span className="font-medium text-foreground">{item.prodi || "-"}</span>
                    {conflictingPartner && (
                      <span className="block text-rose-600 dark:text-rose-400 mt-0.5 font-medium">
                        Tabrakan dengan: {conflictingPartner.prodi} - {conflictingPartner.course_name || conflictingPartner.courseName}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <EditScheduleDialog
                    schedule={item}
                    onSuccess={() => {
                      onReloadSchedules();
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}