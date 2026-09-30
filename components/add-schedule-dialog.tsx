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
import {
  Plus,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/schedule";
import { LAB_ROOMS } from "@/lib/room-constants";
import { PRODI } from "@/lib/prodi-constants";
import { SEMESTERS } from "@/lib/semester-constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";

// Helper Default Otomatis Berdasarkan Bulan & Tahun Saat Ini
const getDefaultAcademicInfo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; 

  let term = "Gasal";
  let academicYear = `${year}/${year + 1}`;

  // Januari - Juni masuk Semester Genap tahun ajaran sebelumnya/tahun berjalan
  if (month >= 1 && month <= 6) {
    term = "Genap";
    academicYear = `${year - 1}/${year}`;
  }

  return { term, academicYear };
};

// Fungsi helper untuk mengambil initial value dengan aman (SSR / Client check)
const getInitialTermType = () => {
  if (typeof window === "undefined") return "Gasal";
  const savedTerm = localStorage.getItem("admin_active_term");
  if (savedTerm) return savedTerm;
  return getDefaultAcademicInfo().term;
};

const getInitialAcademicYear = () => {
  if (typeof window === "undefined") return "2025/2026";
  const savedYear = localStorage.getItem("admin_active_academic_year");
  if (savedYear) return savedYear;
  return getDefaultAcademicInfo().academicYear;
};

interface AddScheduleDialogProps {
  onSuccess: () => void;
}

export function AddScheduleDialog({ onSuccess }: AddScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // State Form (Menggunakan lazy initial state untuk menghindari useEffect setState)
  const [courseName, setCourseName] = useState("");
  const [prodi, setProdi] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [termType, setTermType] = useState<string>(getInitialTermType);
  const [academicYear, setAcademicYear] = useState<string>(getInitialAcademicYear);
  const [day, setDay] = useState(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState<string>(LAB_ROOMS[0]);

  // Handle ketika dialog dibuka (jika ingin merefresh nilai dari localStorage saat dialog dibuka kembali)
  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (val) {
      setTermType(getInitialTermType());
      setAcademicYear(getInitialAcademicYear());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validasi field kosong
    if (!courseName || !prodi || !room || !semester || !termType || !academicYear) {
      setErrorMsg("Semua field wajib diisi, bosku!");
      return;
    }

    // Validasi jam
    if (startTime >= endTime) {
      setErrorMsg("Jam selesai harus lebih besar dari jam mulai, bosku!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("schedules").insert([
      {
        course_name: courseName,
        prodi,
        semester: Number(semester),
        term_type: termType,
        academic_year: academicYear,
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
      setProdi("");
      setSemester("");

      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
        onSuccess();
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className={buttonVariants({ size: "sm" }) + " gap-2"}
      >
        <Plus className="h-4 w-4" /> Tambah Jadwal
      </DialogTrigger>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Perkuliahan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Gagal!</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
              <CheckCircle2Icon />
              <AlertTitle>Sukses!</AlertTitle>
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
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
              <Label htmlFor="semester">Semester</Label>
              <Combobox
                items={SEMESTERS}
                value={semester}
                onValueChange={(val) => setSemester(val ?? "")}
              >
                <ComboboxInput placeholder="Semester" />
                <ComboboxContent>
                  <ComboboxEmpty>Semester tidak sesuai</ComboboxEmpty>
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
          </div>

          {/* Jenis Semester & Tahun Ajaran */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="term_type">Jenis Semester</Label>
              <Select
                value={termType}
                onValueChange={(val) => setTermType(val ?? "Gasal")}
              >
                <SelectTrigger id="term_type" className="w-full">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasal">Gasal</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_year">Tahun Ajaran</Label>
              <Input
                id="academic_year"
                placeholder="Contoh: 2025/2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="day">Hari</Label>
              <Select
                value={day}
                onValueChange={(val) => setDay(val ?? DAYS_OF_WEEK[0])}
              >
                <SelectTrigger id="day" className="w-full">
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
              <Select
                value={room}
                onValueChange={(val) => setRoom(val ?? LAB_ROOMS[0])}
              >
                <SelectTrigger id="room" className="w-full">
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