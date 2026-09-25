"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Schedule, DAYS_OF_WEEK } from "@/lib/schedule";
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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";

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

  const [courseName, setCourseName] = useState(schedule?.course_name || schedule?.courseName || "");
  const [prodi, setProdi] = useState(schedule?.prodi || "");
  const [semester, setSemester] = useState(String(schedule?.semester ?? SEMESTERS[0]));
  const [day, setDay] = useState(schedule?.day || DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState(schedule?.start_time || schedule?.startTime || "08:00");
  const [endTime, setEndTime] = useState(schedule?.end_time || schedule?.endTime || "10:00");
  const [room, setRoom] = useState(schedule?.room || schedule?.labName || LAB_ROOMS[0]);

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!courseName || !prodi || !room || !semester) {
      setErrorMsg("Semua field wajib diisi, bosku!");
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg("Jam selesai harus lebih besar dari jam mulai, bosku!");
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
        
        if (val && schedule) {
          setCourseName(schedule.course_name || schedule.courseName || "");
          setProdi(schedule.prodi || "");
          setSemester(String(schedule.semester ?? SEMESTERS[0]));
          setDay(schedule.day || DAYS_OF_WEEK[0]);
          setStartTime(schedule.start_time || schedule.startTime || "08:00");
          setEndTime(schedule.end_time || schedule.endTime || "10:00");
          setRoom(schedule.room || schedule.labName || LAB_ROOMS[0]);
        }
      }}
    >
      {/* Menggunakan pola render dari referensi Shadcn UI terbaru Anda */}
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground/60 hover:text-foreground rounded-lg"
            title="Edit Jadwal"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />

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
              <Combobox
                items={PRODI}
                value={prodi}
                onValueChange={(val) => setProdi(val ?? "")}
              >
                <ComboboxInput placeholder="Pilih Prodi" />
                <ComboboxContent>
                  <ComboboxEmpty>Prodi tidak ditemukan</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_semester">Semester</Label>
              <Select
                value={semester}
                onValueChange={(val) => setSemester(val ?? String(SEMESTERS[0]))}
              >
                <SelectTrigger id="edit_semester" className="w-full">
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
                <SelectTrigger id="edit_day" className="w-full">
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
                <SelectTrigger id="edit_room" className="w-full">
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