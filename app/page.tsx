"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AddScheduleDialog } from "@/components/ui/add-schedule-dialog";
import { EditScheduleDialog } from "@/components/ui/edit-schedule-dialog";
import { LiveLabMonitor } from "@/components/ui/live-lab-monitor";
import {
  getConflictingScheduleIds,
  getCurrentDayName,
  isSessionActive,
  Schedule,
  DAYS_OF_WEEK,
} from "@/lib/schedule-utils";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Loader2,
  LogIn,
  LogOut,
  AlertTriangle,
  Radio,
  Filter,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileText,
  CogIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setNow] = useState(() => new Date());

  // State Filter
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const router = useRouter();
  const todayName = getCurrentDayName();

  // Timer refresh tiap 1 menit untuk update status "Sedang Berlangsung"
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const reloadSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("start_time", { ascending: true });

    if (!error) setSchedules(data || []);
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!ignore) setIsAdmin(!!session);

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (!ignore) {
        if (!error) setSchedules(data || []);
        setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  // Opsi Dropdown Dinamis dari data yang ada
  const prodiOptions = useMemo(() => {
    const list = Array.from(
      new Set(schedules.map((s) => s.prodi).filter(Boolean)),
    );
    return list.sort();
  }, [schedules]);

  const roomOptions = useMemo(() => {
    const list = Array.from(
      new Set(schedules.map((s) => s.room).filter(Boolean)),
    );
    return list.sort();
  }, [schedules]);

  // Data Jadwal Terfilter
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const matchProdi = !selectedProdi || item.prodi === selectedProdi;
      const matchRoom = !selectedRoom || item.room === selectedRoom;
      return matchProdi && matchRoom;
    });
  }, [schedules, selectedProdi, selectedRoom]);

  // Deteksi bentrok tetap dihitung dari seluruh data jadwal (bukan hanya terfilter)
  const conflictingIds = useMemo(() => {
    return getConflictingScheduleIds(schedules);
  }, [schedules]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    router.refresh();
  };

  const handleDelete = async (id: string, courseName: string) => {
    if (!confirm(`Yakin mau hapus jadwal "${courseName}", bosku?`)) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) reloadSchedules();
  };

  const handleResetFilter = () => {
    setSelectedProdi("");
    setSelectedRoom("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Jadwal Kelas Semester
          </h1>
          <p className="text-muted-foreground">
            Lihat dan kelola jadwal perkuliahan mingguan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <AddScheduleDialog onSuccess={reloadSchedules} />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" /> Login Admin
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bar Filter & Export */}
      <div className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold px-1 text-muted-foreground">
          <div className="p-1.5 rounded-md bg-muted/60 border border-border/40">
            <Filter className="h-3.5 w-3.5 text-foreground/80" />
          </div>
          <span>Filter & Rekap</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filter Prodi */}
          <Select
            value={selectedProdi}
            onValueChange={(val) => setSelectedProdi(val ?? "")}
          >
            <SelectTrigger className="w-full md:w-[200px] h-9 text-xs bg-background/50 border-border/60">
              <SelectValue placeholder="Semua Program Studi" />
            </SelectTrigger>
            <SelectContent>
              {prodiOptions.map((prodi) => (
                <SelectItem key={prodi} value={prodi} className="text-xs">
                  {prodi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter Ruangan */}
          <Select
            value={selectedRoom}
            onValueChange={(val) => setSelectedRoom(val ?? "")}
          >
            <SelectTrigger className="w-full md:w-[170px] h-9 text-xs bg-background/50 border-border/60">
              <SelectValue placeholder="Semua Ruangan" />
            </SelectTrigger>
            <SelectContent>
              {roomOptions.map((room) => (
                <SelectItem key={room} value={room} className="text-xs">
                  {room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filter */}
          {(selectedProdi !== "" || selectedRoom !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilter}
              className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}

          {/* Export Rekap Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9 text-xs w-full md:w-auto cursor-pointer bg-background/50 border-border/60 hover:bg-muted/50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Rekap</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => exportToExcel(filteredSchedules)}
                className="cursor-pointer gap-2 text-xs py-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export Excel (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportToPDF(filteredSchedules)}
                className="cursor-pointer gap-2 text-xs py-2"
              >
                <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span>Export PDF (.pdf)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timeline Layout per Hari (Clean, Simple, & Minimalist) */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/60" />
        </div>
      ) : (
        <div className="space-y-10">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day === todayName;
            const daySchedules = filteredSchedules.filter((s) => s.day === day);

            return (
              <div
                key={day}
                className={cn(
                  "rounded-2xl border p-6 md:p-8 transition-all duration-200",
                  isToday
                    ? "border-emerald-500/40 bg-card/80 shadow-sm ring-1 ring-emerald-500/20"
                    : "border-border/40 bg-card/30"
                )}
              >
                {/* Header Hari */}
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-base tracking-tight text-foreground">
                      {day}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium px-2.5 py-0.5 rounded-full bg-muted/60">
                      {daySchedules.length} Sesi
                    </span>
                  </div>
                  {isToday && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Hari Ini
                    </span>
                  )}
                </div>

                {/* List Jadwal Timeline */}
                {daySchedules.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 italic py-6 text-center">
                    Tidak ada jadwal perkuliahan pada hari ini.
                  </p>
                ) : (
                  <div className="relative pl-5 md:pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                    {daySchedules.map((item) => {
                      const isConflict = conflictingIds.has(item.id);
                      const isActive = isSessionActive(
                        item.day,
                        item.start_time,
                        item.end_time
                      );

                      return (
                        <div key={item.id} className="relative pl-6 group">
                          {/* Titik Indikator Timeline (Sejajar Pas dengan Garis) */}
                          <div
                            className={cn(
                              "absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background transition-transform group-hover:scale-125 z-10",
                              isActive
                                ? "border-emerald-500 bg-emerald-500"
                                : isConflict
                                ? "border-rose-500 bg-rose-500"
                                : "border-muted-foreground/40 bg-muted"
                            )}
                          />

                          {/* Baris Konten Bersih (Tanpa Card Box) */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-border/20 last:border-0 last:pb-0">
                            <div className="space-y-1 flex-1">
                              {/* Status Badges kecil jika aktif/bentrok */}
                              {(isActive || isConflict) && (
                                <div className="flex items-center gap-2 mb-1">
                                  {isActive && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                      <Radio className="h-3 w-3 animate-pulse text-emerald-500" />
                                      Sedang Berlangsung
                                    </span>
                                  )}
                                  {isConflict && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                                      <AlertTriangle className="h-3 w-3 text-rose-500" />
                                      Bentrok Jadwal
                                    </span>
                                  )}
                                </div>
                              )}

                              <h4 className="font-medium text-sm text-foreground leading-snug">
                                {item.course_name}
                              </h4>
                              
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">📍 {item.room}</span>
                                <span>&bull;</span>
                                <span>{item.prodi}</span>
                              </div>
                            </div>

                            {/* Waktu & Tombol Aksi Admin */}
                            <div className="flex items-center justify-between md:justify-end gap-4">
                              <span
                                className={cn(
                                  "text-xs font-mono px-2.5 py-1 rounded-md font-medium",
                                  isActive
                                    ? "bg-emerald-600 text-white"
                                    : isConflict
                                    ? "bg-rose-600 text-white"
                                    : "bg-muted/70 text-muted-foreground"
                                )}
                              >
                                {item.start_time} - {item.end_time}
                              </span>

                              {isAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground/60 hover:text-foreground rounded-lg"
                                      >
                                        <CogIcon className="h-4 w-4" />
                                      </Button>
                                    }
                                  />
                                  <DropdownMenuContent align="end" className="w-36 text-xs">
                                    <EditScheduleDialog
                                      schedule={item}
                                      onSuccess={reloadSchedules}
                                    />
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() =>
                                        handleDelete(item.id, item.course_name)
                                      }
                                      className="cursor-pointer gap-2 py-1.5 text-xs text-rose-600 focus:text-rose-600"
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
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Komponen Monitor Lab Real-Time di Bagian Bawah */}
      {!loading && <LiveLabMonitor schedules={schedules} />}
    </div>
  );
}