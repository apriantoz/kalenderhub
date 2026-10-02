"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DAYS_OF_WEEK } from "@/lib/schedule";
import { LAB_ROOMS } from "@/lib/room-constants";
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
import { Pencil, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";

interface CourseItem {
  id: string;
  name: string;
  prodi_code: string;
  semester: number;
}

interface EditScheduleDialogProps {
  schedule: {
    id: string;
    course_id?: string;
    courses?: { name: string; prodi_code: string; semester: number };
    term_type?: string;
    academic_year?: string;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
  };
  onSuccess: () => void;
}

export function EditScheduleDialog({
  schedule,
  onSuccess,
}: EditScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data dari Database
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [studyProgramsMap, setStudyProgramsMap] = useState<Record<string, string>>({});

  // State Form
  const [selectedCourseId, setSelectedCourseId] = useState(schedule?.course_id || "");
  const [selectedCourseName, setSelectedCourseName] = useState(schedule?.courses?.name || "");
  const [prodi, setProdi] = useState("");
  const [semester, setSemester] = useState("");
  const [termType, setTermType] = useState(schedule?.term_type || "Gasal");
  const [academicYear, setAcademicYear] = useState(schedule?.academic_year || "2025/2026");
  const [day, setDay] = useState(schedule?.day || DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState(schedule?.start_time || "08:00");
  const [endTime, setEndTime] = useState(schedule?.end_time || "10:00");
  const [room, setRoom] = useState(schedule?.room || LAB_ROOMS[0]);

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

        // Jika schedule memiliki course_id, tentukan prodi & semester awalnya
        if (schedule?.course_id && courseData) {
          const currentCourse = courseData.find((c) => c.id === schedule.course_id);
          if (currentCourse) {
            setSelectedCourseName(currentCourse.name);
            setSemester(currentCourse.semester ? currentCourse.semester.toString() : "");
            setProdi(currentCourse.prodi_code ? (prodiMap[currentCourse.prodi_code] || currentCourse.prodi_code) : "");
          }
        }

        setFetchingData(false);
      }
    }

    fetchMasterData();

    return () => {
      isMounted = false;
    };
  }, [open, schedule]);

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

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedCourseId || !room || !termType || !academicYear) {
      setErrorMsg("Mohon pilih Mata Kuliah yang valid dan lengkapi field lainnya, bosku!");
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
        course_id: selectedCourseId,
        term_type: termType,
        academic_year: academicYear,
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

  const courseNames = coursesList.map((c) => c.name);

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

      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Jadwal Perkuliahan
            {fetchingData && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </DialogTitle>
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

          {/* Mata Kuliah Combobox */}
          <div className="space-y-2">
            <Label htmlFor="edit_course_name">Nama Mata Kuliah</Label>
            <Combobox
              items={courseNames}
              value={selectedCourseName}
              onValueChange={(val) => handleCourseSelect(val ?? "")}
            >
              <ComboboxInput placeholder="Pilih Mata Kuliah dari database" />
              <ComboboxContent>
                <ComboboxEmpty>Mata kuliah tidak ditemukan.</ComboboxEmpty>
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
            <div className="space-y-2">
              <Label htmlFor="edit_prodi">Program Studi (Otomatis)</Label>
              <Input
                id="edit_prodi"
                disabled
                value={prodi}
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_semester">Semester (Otomatis)</Label>
              <Input
                id="edit_semester"
                disabled
                value={semester}
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          {/* Jenis Semester & Tahun Ajaran */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_term_type">Jenis Semester</Label>
              <Select
                value={termType}
                onValueChange={(val) => setTermType(val ?? "Gasal")}
              >
                <SelectTrigger id="edit_term_type" className="w-full">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasal">Gasal</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_academic_year">Tahun Ajaran</Label>
              <Input
                id="edit_academic_year"
                placeholder="Contoh: 2025/2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
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