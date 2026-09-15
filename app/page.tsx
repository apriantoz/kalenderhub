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
  Monitor,
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { LAB_ROOMS } from "@/lib/room-constants";
import { PRODI } from "@/lib/prodi-constants";
import { Badge } from "@/components/ui/badge";
import { ScheduleChart } from "@/components/ScheduleChart";
import { RoomUsageChart } from "@/components/RoomUsageChart";
import { FooterHub } from "@/components/FooterHub";
import { Spinner } from "@/components/ui/spinner";

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

  // Opsi Dropdown dari Constant
  const prodiOptions = PRODI;
  const roomOptions = LAB_ROOMS;

  // Data Jadwal Terfilter
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const matchProdi = !selectedProdi || item.prodi === selectedProdi;
      const matchRoom = !selectedRoom || item.room === selectedRoom;
      return matchProdi && matchRoom;
    });
  }, [schedules, selectedProdi, selectedRoom]);

  // Deteksi bentrok tetap dihitung dari seluruh data jadwal
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
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">KalenderHub</h1>
          <p className="text-muted-foreground/80">
            Lihat dan kelola jadwal perkuliahan mingguan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <AddScheduleDialog onSuccess={reloadSchedules} />
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="cursor-pointer">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bar Filter & Export */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md border text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-xs font-semibold tracking-tight">
                Filter & Rekap
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground/80">
                Filter jadwal berdasarkan program studi atau ruangan.
              </CardDescription>
            </div>
          </div>

          <CardAction>
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Filter Prodi */}
              <Select
                value={selectedProdi}
                onValueChange={(val) => setSelectedProdi(val ?? "")}
              >
                <SelectTrigger className="w-full md:w-50 text-xs bg-background/40">
                  <SelectValue placeholder="Semua Program Studi" />
                </SelectTrigger>
                <SelectContent className="bg-background/50 backdrop-blur-md">
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
                <SelectTrigger className="w-full md:w-50 text-xs bg-background/40">
                  <SelectValue placeholder="Semua Ruangan" />
                </SelectTrigger>
                <SelectContent className="bg-background/50 backdrop-blur-md">
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
                  className="h-9 text-xs gap-1.5 text-muted-foreground"
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
                      className="gap-2 h-9 text-xs w-full md:w-auto cursor-pointer bg-background/40"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export</span>
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-background/50 backdrop-blur-md"
                >
                  <DropdownMenuItem
                    onClick={() => exportToExcel(filteredSchedules)}
                    className="cursor-pointer gap-2 text-xs py-2"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    <span>Excel (.xlsx)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => exportToPDF(filteredSchedules)}
                    className="cursor-pointer gap-2 text-xs py-2"
                  >
                    <FileText className="h-4 w-4 text-rose-400" />
                    <span>PDF (.pdf)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Timeline Layout per Hari */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
            <Spinner className="size-10" />
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day === todayName;
            const daySchedules = filteredSchedules.filter((s) => s.day === day);

            return (
              <Card key={day} className="transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                  <CardTitle>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-base tracking-tight">
                        {day}
                      </h3>
                      <span className="text-xs text-muted-foreground font-medium px-2.5 py-0.5 rounded-full border">
                        {daySchedules.length} Sesi
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription />
                  <CardAction>
                    {isToday && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-500 border border-indigo-500 px-3 py-1 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                        Hari Ini
                      </span>
                    )}
                  </CardAction>
                </CardHeader>

                <CardContent className="pt-6">
                  {daySchedules.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 italic py-4 text-center">
                      Tidak ada jadwal perkuliahan pada hari ini.
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {daySchedules.map((item, index) => {
                        const isConflict = conflictingIds.has(item.id);
                        const isActive = isSessionActive(
                          item.day,
                          item.start_time,
                          item.end_time,
                        );
                        const isLast = index === daySchedules.length - 1;

                        return (
                          <div key={item.id} className="flex gap-4 group">
                            {/* Kolom Garis & Dot menyatu */}
                            <div className="relative flex flex-col items-center shrink-0 w-4">
                              {/* Garis Vertikal Lurus */}
                              <div
                                className={cn(
                                  "absolute top-0 w-[2px] bg-slate-300 group-hover:bg-slate-300 transition-colors",
                                  isLast ? "h-3" : "bottom-0",
                                )}
                              />

                              {/* Titik Dot */}
                              <div
                                className={cn(
                                  "h-3.5 w-3.5 rounded-full border-2 transition-all group-hover:scale-125 z-10 shrink-0 mt-1.5",
                                  isActive
                                    ? "border-indigo-400 bg-indigo-500"
                                    : isConflict
                                      ? "border-rose-400 bg-rose-500 animate-pulse"
                                      : "border-slate-300 bg-muted group-hover:border-slate-400",
                                )}
                              />
                            </div>

                            {/* Konten Timeline */}
                            <div className="flex-1 pb-6 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  {/* Nama Matkul & Status Badges Sejajar */}
                                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                                    <h4 className="font-medium text-sm leading-snug truncate group-hover:text-slate-700 transition-colors">
                                      {item.course_name}
                                    </h4>

                                    {isActive && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] font-medium gap-1 shrink-0"
                                      >
                                        <Radio className="h-3 w-3 animate-ping text-indigo-400" />
                                        Sedang Berlangsung
                                      </Badge>
                                    )}

                                    {isConflict && (
                                      <Badge
                                        variant="destructive"
                                        className="text-[10px] font-medium gap-1 animate-pulse shrink-0"
                                      >
                                        <AlertTriangle className="h-3 w-3" />
                                        Bentrok Jadwal
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                                    <span className="font-medium/90">
                                      <Monitor className="h-3 w-3 inline-block mr-1" />
                                      Ruang {item.room}
                                    </span>
                                    <span>&bull;</span>
                                    <span>{item.prodi}</span>
                                  </div>
                                </div>

                                {/* Waktu & Tombol Aksi Admin */}
                                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                                  <span
                                    className={cn(
                                      "text-xs font-mono px-2.5 py-1 rounded-md font-medium border",
                                      isActive
                                        ? "bg-indigo-600 border-indigo-500 text-white"
                                        : isConflict
                                          ? "bg-rose-600 border-rose-500 text-white"
                                          : "text-muted-foreground",
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
                                            className="h-8 w-8 text-muted-foreground/60 rounded-lg"
                                          >
                                            <CogIcon className="h-4 w-4" />
                                          </Button>
                                        }
                                      />
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-36 text-xs bg-background/50 backdrop-blur-md"
                                      >
                                        <EditScheduleDialog
                                          schedule={item}
                                          onSuccess={reloadSchedules}
                                        />
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          variant="destructive"
                                          onClick={() =>
                                            handleDelete(
                                              item.id,
                                              item.course_name,
                                            )
                                          }
                                          className="cursor-pointer gap-2 py-1.5 text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-950/40"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {!loading && <ScheduleChart schedules={filteredSchedules} />}
        {!loading && <RoomUsageChart schedules={schedules} />}{" "}
      </div>
      {/* Komponen Monitor Lab Real-Time di Bagian Bawah */}
      {!loading && <LiveLabMonitor schedules={schedules} />}
      <FooterHub />
    </div>
  );
}
