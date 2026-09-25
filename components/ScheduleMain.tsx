"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LiveLabMonitor } from "@/components/live-lab-monitor";
import { getConflictingScheduleIds, Schedule } from "@/lib/schedule";
import { ScheduleHeader } from "@/components/ScheduleHeader";
import { ScheduleFilterBar } from "@/components/ScheduleFilterBar";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import { ScheduleSkeleton } from "@/components/ScheduleSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScheduleChart } from "@/components/ScheduleChart";
import { RoomUsageChart } from "@/components/RoomUsageChart";
import { FooterHub } from "@/components/FooterHub";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar1Icon, InfoIcon, TrendingUpIcon } from "lucide-react";
import { toast } from "sonner";

export default function ScheduleMain() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setNow] = useState(() => new Date());

  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [searchSubject, setSearchSubject] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    courseName: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const reloadSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      toast.error("Gagal memuat ulang data jadwal.");
    } else {
      setSchedules(data || []);
    }
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
        if (error) {
          toast.error("Gagal mengambil data dari database.");
        } else {
          setSchedules(data || []);
        }
        setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    const channel = supabase
      .channel("public-schedules")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedules" },
        () => {
          reloadSchedules();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const matchProdi = !selectedProdi || item.prodi === selectedProdi;
      const matchRoom = !selectedRoom || item.room === selectedRoom;
      
      const courseTitle = item.course_name || item.courseName || "";
      const matchSubject = !searchSubject || courseTitle.toLowerCase().includes(searchSubject.toLowerCase());

      return matchProdi && matchRoom && matchSubject;
    });
  }, [schedules, selectedProdi, selectedRoom, searchSubject]);

  const conflictingIds = useMemo(() => {
    return getConflictingScheduleIds(schedules);
  }, [schedules]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    toast.success("Berhasil keluar dari mode Admin.");
    router.refresh();
  };

  const handleDeleteClick = (id: string, courseName?: string) => {
    const targetItem = schedules.find((s) => s.id === id);
    const resolvedName =
      courseName || targetItem?.course_name || targetItem?.courseName || "Jadwal";
    setDeleteTarget({ id, courseName: resolvedName });
  };

  // 🔔 EKSEKUSI HAPUS DENGAN TOAST NOTIFICATION
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    const targetName = deleteTarget.courseName;
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      toast.error(`Gagal menghapus jadwal "${targetName}".`);
    } else {
      toast.success(`Jadwal "${targetName}" berhasil dihapus.`);
      reloadSchedules();
    }
    
    setDeleteTarget(null);
  };

  const handleResetFilter = () => {
    setSelectedProdi("");
    setSelectedRoom("");
    setSearchSubject("");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 overflow-x-hidden">
      <ScheduleHeader
        isAdmin={isAdmin}
        onReloadSchedules={reloadSchedules}
        onLogout={handleLogout}
      />

      <Tabs defaultValue="monitor">
        <TabsList variant="line">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4" />
            <span>Status</span>
          </TabsTrigger>
          <TabsTrigger value="statistik" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            <span>Statistik</span>
          </TabsTrigger>
          <TabsTrigger value="jadwal" className="flex items-center gap-2">
            <Calendar1Icon className="h-4 w-4" />
            <span>Jadwal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="my-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 w-full">
              <Spinner className="size-10" />
            </div>
          ) : (
            <LiveLabMonitor schedules={schedules} />
          )}
        </TabsContent>

        <TabsContent value="statistik" className="my-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 w-full">
              <Spinner className="size-10" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <ScheduleChart schedules={filteredSchedules} />
              <RoomUsageChart schedules={schedules} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="jadwal">
          {loading ? (
            <div className="my-4">
              <ScheduleSkeleton />
            </div>
          ) : (
            <div className="w-full my-4 space-y-4">
              <ScheduleFilterBar
                selectedProdi={selectedProdi}
                selectedRoom={selectedRoom}
                searchSubject={searchSubject}
                onProdiChange={setSelectedProdi}
                onRoomChange={setSelectedRoom}
                onSearchSubjectChange={setSearchSubject}
                onResetFilter={handleResetFilter}
                filteredSchedules={filteredSchedules}
              />
              <ScheduleTimeline
                filteredSchedules={filteredSchedules}
                allSchedules={schedules}
                conflictingIds={conflictingIds}
                isAdmin={isAdmin}
                onReloadSchedules={reloadSchedules}
                onDeleteClick={handleDeleteClick}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FooterHub />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus jadwal?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus jadwal perkuliahan{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget?.courseName}&rdquo;
              </span>{" "}
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}