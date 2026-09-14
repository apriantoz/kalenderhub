"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Schedule, DAYS_OF_WEEK } from "@/lib/schedule-utils";
import { LAB_ROOMS } from "@/lib/room-constants";
import { PRODI } from "@/lib/prodi-constants";
import { SEMESTERS } from "@/lib/semester-constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, AlertCircle, CheckCircle2 } from "lucide-react";

interface EditScheduleDialogProps {
  schedule: Schedule;
  onSuccess: () => void;
}

export function EditScheduleDialog({
  schedule,
  onSuccess,
}: EditScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [courseName, setCourseName] = useState(schedule.course_name);
  const [prodi, setProdi] = useState(schedule.prodi);
  const [semester, setSemester] = useState(String(schedule.semester ?? SEMESTERS[0]));
  const [day, setDay] = useState(schedule.day);
  const [startTime, setStartTime] = useState(schedule.start_time);
  const [endTime, setEndTime] = useState(schedule.end_time);
  const [room, setRoom] = useState(schedule.room);

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!courseName || !prodi || !room || !semester) {
      setErrorMsg("Semua field wajib diisi, bosku!");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("schedules")
      .update({
        course_name: courseName,
        prodi,
        semester: Number(semester),
        day,
        start_time: startTime,
        end_time: endTime,
        room,
      })
      .eq("id", schedule.id);

    setLoading(false);

    if (error) {
      setErrorMsg("Gagal mengupdate jadwal: " + error.message);
    } else {
      setSuccessMsg("Jadwal berhasil diperbarui!");

      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
        onSuccess();
      }, 1000);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        setErrorMsg(null);
        setSuccessMsg(null);
      }}
    >
      <DialogTrigger
        className="w-full flex items-center gap-2 px-2 py-2 text-xs rounded-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors outline-none select-none font-normal"
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil className="h-3.5 w-3.5" />
        <span>Edit</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Jadwal Perkuliahan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 mt-2">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit_course_name">Nama Mata Kuliah</Label>
            <Input
              id="edit_course_name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_prodi">Program Studi</Label>
              <Select
                value={prodi}
                onValueChange={(val) => setProdi(val ?? PRODI[0])}
              >
                <SelectTrigger id="edit_prodi">
                  <SelectValue placeholder="Pilih Prodi" />
                </SelectTrigger>
                <SelectContent>
                  {PRODI.map((r) => (
                    <SelectItem key={r} value={r}>
                      Prodi {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_semester">Semester</Label>
              <Select
                value={semester}
                onValueChange={(val) => setSemester(val ?? String(SEMESTERS[0]))}
              >
                <SelectTrigger id="edit_semester">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((sem) => (
                    <SelectItem key={sem} value={String(sem)}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_day">Hari</Label>
              <Select
                value={day}
                onValueChange={(val) => setDay(val ?? DAYS_OF_WEEK[0])}
              >
                <SelectTrigger id="edit_day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_room">Ruangan Lab</Label>
              <Select
                value={room}
                onValueChange={(val) => setRoom(val ?? LAB_ROOMS[0])}
              >
                <SelectTrigger id="edit_room">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAB_ROOMS.map((r) => (
                    <SelectItem key={r} value={r}>
                      Lab {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_start_time">Jam Mulai</Label>
              <Input
                id="edit_start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_time">Jam Selesai</Label>
              <Input
                id="edit_end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}