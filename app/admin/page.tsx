"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AcademicSettingsCard } from "@/components/academic-settings-card";
import { ConflictResolverDialog } from "@/components/conflict-resolver-dialog";
import { getConflictingScheduleIds, Schedule } from "@/lib/schedule";
import {
  ShieldCheck,
  Calendar,
  Layers,
  AlertTriangle,
  Wrench,
  Settings,
  Info,
  Activity,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabMaintenanceCard } from "@/components/LabMaintenanceCard";
import { StudyProgramManagerCard } from "@/components/StudyProgramManagerCard"; // Komponen baru manajemen prodi & courses
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("day", { ascending: true });

    if (error) {
      toast.error("Gagal memuat data jadwal.");
    } else {
      setSchedules(data || []);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("day", { ascending: true });

      if (isMounted) {
        if (!error && data) {
          setSchedules(data);
        }
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hitung jadwal yang bentrok secara global
  const conflictingIds = getConflictingScheduleIds(schedules);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Panel Administrator Desain Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Laboratorium & Akademik
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola tahun ajaran aktif, jenis semester, kurikulum prodi, dan pemeliharaan lab komputer ISI Bali.
          </p>
        </div>

        {/* Tombol Resolusi Konflik Global di Header Admin jika ada yang bentrok */}
        {!loading && conflictingIds.size > 0 && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 animate-bounce" />
            <div className="text-xs">
              <p className="font-semibold text-rose-600 dark:text-rose-400">
                Ada Konflik Ruangan!
              </p>
              <p className="text-muted-foreground">
                {conflictingIds.size} sesi jadwal saling bertabrakan.
              </p>
            </div>
            <ConflictResolverDialog
              schedules={schedules}
              conflictingIds={conflictingIds}
              onReloadSchedules={fetchSchedules}
            />
          </div>
        )}
      </div>

      {/* Grid Statistik Ringkas (3 Kolom Seimbang) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jadwal Aktif
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${schedules.length} Sesi`}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Terdaftar di database sistem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laboratorium Terkelola
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Lab</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Gedung Desain Hub ISI Bali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Sistem
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              Operasional
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Sistem siap mengelola perkuliahan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigasi Tab Utama Panel Admin */}
      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList variant="default" className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-[600px] h-auto sm:h-11 p-1 gap-1">
          <TabsTrigger value="maintenance" className="gap-2 text-xs font-medium py-2">
            <Wrench className="h-4 w-4" /> Pemeliharaan Lab
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="gap-2 text-xs font-medium py-2">
            <BookOpen className="h-4 w-4" /> Kurikulum & Prodi
          </TabsTrigger>
          <TabsTrigger value="academic" className="gap-2 text-xs font-medium py-2">
            <Settings className="h-4 w-4" /> Akademik & Sistem
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pemeliharaan Lab */}
        <TabsContent value="maintenance" className="space-y-6 pt-4">
          <LabMaintenanceCard />
        </TabsContent>

        {/* Tab 2: Kurikulum & Prodi (Baru) */}
        <TabsContent value="curriculum" className="space-y-6 pt-4">
          <StudyProgramManagerCard />
        </TabsContent>

        {/* Tab 3: Akademik & Konfigurasi Sistem */}
        <TabsContent value="academic" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AcademicSettingsCard />

            <Card className="w-full">
              <CardHeader className="border-b pb-4 flex flex-row items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Pintasan & Informasi Sistem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Gunakan tab ini untuk memperbarui{" "}
                  <strong className="text-foreground">Tahun Ajaran Aktif</strong>{" "}
                  dan <strong className="text-foreground">Jenis Semester</strong>{" "}
                  (Gasal/Genap). Perubahan konfigurasi ini akan langsung mereset referensi semester pada tampilan utama kalender.
                </p>
                <div className="p-4 bg-muted/50 rounded-lg border border-border/50 space-y-2">
                  <h4 className="font-medium text-foreground text-xs uppercase tracking-wider">
                    Catatan Penting:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      Sistem mendeteksi bentrok jadwal secara otomatis berdasarkan ruangan lab dan waktu.
                    </li>
                    <li>
                      Pastikan data program studi dan mata kuliah di tab <strong className="text-foreground">Kurikulum & Prodi</strong> selalu terbarui agar pilihan filter jadwal akurat.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}