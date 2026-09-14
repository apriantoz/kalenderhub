"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/schedule-utils";
import { LAB_ROOMS } from "@/lib/room-constants";
import { PRODI } from "@/lib/prodi-constants";
import { SEMESTERS } from "@/lib/semester-constants"; // <-- Import dari file konstan

interface AddScheduleDialogProps {
  onSuccess: () => void;
}

export function AddScheduleDialog({ onSuccess }: AddScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [courseName, setCourseName] = useState("");
  const [prodi, setProdi] = useState<string>(PRODI[0]);
  const [semester, setSemester] = useState<string>(String(SEMESTERS[0]));
  const [day, setDay] = useState(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState<string>(LAB_ROOMS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!courseName || !prodi || !room || !semester) {
      setErrorMsg("Semua field wajib diisi, bosku!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("schedules").insert([
      {
        course_name: courseName,
        prodi,
        semester: Number(semester), // Konversi ke number agar sesuai tipe integer di database
        day,
        start_time: startTime,
        end_time: endTime,
        room,
      },
    ]);

    setLoading(false);

    if (error) {
      setErrorMsg("Gagal menyimpan: " + error.message);
    } else {
      setSuccessMsg("Jadwal berhasil ditambahkan!");
      setCourseName("");
      setProdi(PRODI[0]);
      setSemester(String(SEMESTERS[0]));
      
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
        onSuccess();
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); setErrorMsg(null); setSuccessMsg(null); }}>
      <DialogTrigger className={buttonVariants({ size: "sm" }) + " gap-2 cursor-pointer"}>
        <Plus className="h-4 w-4" /> Tambah Jadwal
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Perkuliahan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
            <Label htmlFor="course_name">Nama Mata Kuliah</Label>
            <Input
              id="course_name"
              placeholder="Contoh: Pemrograman Web"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prodi">Program Studi</Label>
              <Select value={prodi} onValueChange={(val) => setProdi(val ?? PRODI[0])}>
                <SelectTrigger id="prodi">
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
              <Label htmlFor="semester">Semester</Label>
              <Select value={semester} onValueChange={(val) => setSemester(val ?? String(SEMESTERS[0]))}>
                <SelectTrigger id="semester">
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
              <Label htmlFor="day">Hari</Label>
              <Select value={day} onValueChange={(val) => setDay(val ?? DAYS_OF_WEEK[0])}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Pilih Hari" />
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
              <Label htmlFor="room">Ruangan Lab</Label>
              <Select value={room} onValueChange={(val) => setRoom(val ?? LAB_ROOMS[0])}>
                <SelectTrigger id="room">
                  <SelectValue placeholder="Pilih Ruangan" />
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
              <Label htmlFor="start_time">Jam Mulai</Label>
              <Input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Jam Selesai</Label>
              <Input
                id="end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}