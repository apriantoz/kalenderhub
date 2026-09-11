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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin mau hapus jadwal ini, bosku?")) return;
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
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 h-9 text-xs w-full md:w-auto cursor-pointer bg-background/50 border-border/60 hover:bg-muted/50"
              )}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Rekap</span>
            </DropdownMenuTrigger>
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

      {/* Grid Jadwal Hari (5 Kolom untuk Senin-Jumat) */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day === todayName;
            const daySchedules = filteredSchedules.filter((s) => s.day === day);

            return (
              <Card
                key={day}
                className={`flex flex-col transition-all duration-200 rounded-xl border-border/60 ${
                  isToday
                    ? "border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30 bg-card"
                    : "bg-card/60 hover:border-border"
                }`}
              >
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between rounded-t-xl">
                  <CardTitle className="text-base font-semibold tracking-tight">
                    {day}
                  </CardTitle>
                  {isToday && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] font-medium gap-1.5 py-0.5 px-2.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Hari Ini
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  {daySchedules.length === 0 ? (
                    <p className="text-xs text-muted-foreground/70 text-center py-8 italic">
                      Tidak ada jadwal
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {daySchedules.map((item) => {
                        const isConflict = conflictingIds.has(item.id);
                        const isActive = isSessionActive(
                          item.day,
                          item.start_time,
                          item.end_time,
                        );

                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-lg border transition-all duration-150 group relative ${
                              isActive
                                ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20"
                                : isConflict
                                  ? "border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20"
                                  : "bg-muted/30 border-border/40 hover:bg-muted/50 hover:border-border/80"
                            }`}
                          >
                            {/* Status Indicator */}
                            {(isActive || isConflict) && (
                              <div className="flex items-center gap-2 mb-2">
                                {isActive && (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                    <Radio className="h-3 w-3 animate-pulse text-emerald-500" />
                                    Sedang Berlangsung
                                  </span>
                                )}
                                {isConflict && (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                                    Bentrok Ruangan & Jam!
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Judul & Jam */}
                            <div className="flex justify-between items-start gap-2 mb-1.5 pr-14">
                              <span className="font-semibold text-sm leading-snug">
                                {item.course_name}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                              <span className="text-[11px] text-muted-foreground font-medium">
                                {item.prodi}
                              </span>
                              <span
                                className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
                                  isActive
                                    ? "bg-emerald-600 text-white"
                                    : isConflict
                                      ? "bg-rose-600 text-white"
                                      : "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900"
                                }`}
                              >
                                {item.start_time} - {item.end_time}
                              </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground/80 mt-1">
                              📍 {item.room}
                            </p>

                            {/* Tombol Admin */}
                            {isAdmin && (
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-0.5 rounded-md border border-border/50 shadow-sm">
                                <EditScheduleDialog
                                  schedule={item}
                                  onSuccess={reloadSchedules}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
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
      )}

      {/* Komponen Monitor Lab Real-Time di Bagian Bawah */}
      {!loading && <LiveLabMonitor schedules={schedules} />}
    </div>
  );
}