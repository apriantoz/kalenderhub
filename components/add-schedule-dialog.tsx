"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/schedule";
import { LAB_ROOMS } from "@/lib/room-constants";
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

const getDefaultAcademicInfo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; 

  let term = "Gasal";
  let academicYear = `${year}/${year + 1}`;

  if (month >= 1 && month <= 6) {
    term = "Genap";
    academicYear = `${year - 1}/${year}`;
  }

  return { term, academicYear };
};

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

interface CourseItem {
  id: string;
  name: string;
  prodi_code: string;
  semester: number;
}

export function AddScheduleDialog({ onSuccess }: AddScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data dari Database
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [studyProgramsMap, setStudyProgramsMap] = useState<Record<string, string>>({}); // prodi_code -> prodi_name

  // State Form
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [prodi, setProdi] = useState("");
  const [semester, setSemester] = useState("");
  const [termType, setTermType] = useState<string>(getInitialTermType);
  const [academicYear, setAcademicYear] = useState<string>(getInitialAcademicYear);
  const [day, setDay] = useState(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState<string>(LAB_ROOMS[0]);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    async function fetchMasterData() {
      setFetchingData(true);
      
      const { data: prodiData } = await supabase
        .from("study_programs")
        .select("code, name");

      const { data: courseData } = await supabase
        .from("courses")
        .select("id, name, prodi_code, semester")
        .order("name", { ascending: true });

      if (isMounted) {
        const prodiMap: Record<string, string> = {};
        prodiData?.forEach((p) => {
          prodiMap[p.code] = p.name;
        });
        setStudyProgramsMap(prodiMap);
        setCoursesList(courseData || []);
        setFetchingData(false);
      }
    }

    fetchMasterData();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      setTermType(getInitialTermType());
      setAcademicYear(getInitialAcademicYear());
      setErrorMsg(null);
      setSuccessMsg(null);
      setSelectedCourseId("");
      setSelectedCourseName("");
      setProdi("");
      setSemester("");
    }
  };

  // Ketika mata kuliah dipilih dari combobox
  const handleCourseSelect = (courseNameInput: string) => {
    setSelectedCourseName(courseNameInput);
    const found = coursesList.find((c) => c.name === courseNameInput);
    if (found) {
      setSelectedCourseId(found.id);
      setSemester(found.semester ? found.semester.toString() : "");
      setProdi(found.prodi_code ? (studyProgramsMap[found.prodi_code] || found.prodi_code) : "");
    } else {
      setSelectedCourseId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedCourseId || !room || !termType || !academicYear) {
      setErrorMsg("Mohon pilih Mata Kuliah yang valid dari daftar dan lengkapi field lainnya, bosku!");
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg("Jam selesai harus lebih besar dari jam mulai, bosku!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("schedules").insert([
      {
        course_id: selectedCourseId,
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
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
        onSuccess();
      }, 1000);
    }
  };

  const courseNames = coursesList.map((c) => c.name);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className={buttonVariants({ size: "sm" }) + " gap-2"}
      >
        <Plus className="h-4 w-4" /> Tambah Jadwal
      </DialogTrigger>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Tambah Jadwal Perkuliahan
            {fetchingData && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </DialogTitle>
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

          {/* Mata Kuliah Combobox */}
          <div className="space-y-2">
            <Label htmlFor="course_name">Nama Mata Kuliah</Label>
            <Combobox
              items={courseNames}
              value={selectedCourseName}
              onValueChange={(val) => handleCourseSelect(val ?? "")}
            >
              <ComboboxInput placeholder="Pilih Mata Kuliah dari database" />
              <ComboboxContent>
                <ComboboxEmpty>Mata kuliah tidak ditemukan di database.</ComboboxEmpty>
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

          <div className="grid grid-cols-2 gap-3">
            {/* Prodi otomatis terisi */}
            <div className="space-y-2">
              <Label htmlFor="prodi">Program Studi (Otomatis)</Label>
              <Input
                id="prodi"
                disabled
                value={prodi}
                placeholder="Pilih MK dulu"
                className="bg-muted cursor-not-allowed"
              />
            </div>

            {/* Semester otomatis terisi */}
            <div className="space-y-2">
              <Label htmlFor="semester">Semester (Otomatis)</Label>
              <Input
                id="semester"
                disabled
                value={semester}
                placeholder="Pilih MK dulu"
                className="bg-muted cursor-not-allowed"
              />
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