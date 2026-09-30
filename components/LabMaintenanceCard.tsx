"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LAB_ROOMS } from "@/lib/room-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wrench, Calendar, Trash2, PlusCircle, BookmarkCheck, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MaintenanceItem {
  id: number;
  room_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  category?: string; // 'maintenance' | 'event'
}

export function LabMaintenanceCard() {
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [category, setCategory] = useState("event");
  const [startDate, setStartDate] = useState(getTodayString);
  const [endDate, setEndDate] = useState(getTodayString);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMaintenances() {
      const { data, error } = await supabase
        .from("lab_maintenances")
        .select("*")
        .order("start_date", { ascending: true });

      if (isMounted) {
        if (!error && data) {
          setMaintenances(data);
        }
        setLoading(false);
      }
    }

    loadMaintenances();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshMaintenances = async () => {
    const { data, error } = await supabase
      .from("lab_maintenances")
      .select("*")
      .order("start_date", { ascending: true });

    if (!error && data) {
      setMaintenances(data);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (endDate < val) {
      setEndDate(val);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || !startDate || !endDate || !reason.trim()) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("lab_maintenances").insert({
      room_name: roomName,
      category,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim(),
    });

    if (error) {
      toast.error("Gagal menyimpan agenda lab.");
    } else {
      toast.success(
        category === "event"
          ? `Kegiatan di ${roomName} berhasil dijadwalkan.`
          : `Lab ${roomName} berhasil dimasukkan ke Mode Pemeliharaan.`
      );
      setRoomName("");
      setReason("");
      setCategory("event");
      const today = getTodayString();
      setStartDate(today);
      setEndDate(today);
      refreshMaintenances();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number, room: string) => {
    const { error } = await supabase.from("lab_maintenances").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus agenda lab.");
    } else {
      toast.success(`Agenda untuk ${room} berhasil dihapus/diselesaikan.`);
      refreshMaintenances();
    }
  };

  const isEvent = category === "event";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-4 border-b">
        <BookmarkCheck className="h-5 w-5 text-primary" />
        <CardTitle className="text-base font-semibold">
          Kunci Ruangan (Kegiatan Internal & Pemeliharaan)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Form Input Reservasi / Maintenance */}
        <form onSubmit={handleAddMaintenance} className="space-y-4 p-4 bg-muted/40 rounded-xl border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PlusCircle className="h-3.5 w-3.5 text-primary" /> Form Reservasi Khusus / Maintenance
            </h4>
            <Badge variant="secondary" className="text-[10px] font-mono">
              12 Lab Ready
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tipe Reservasi */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-medium">
                Tipe Reservasi
              </Label>
              <Select value={category} onValueChange={(val) => setCategory(val ?? "event")}>
                <SelectTrigger id="category" className="h-9 w-full text-xs bg-background">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event" className="text-xs">
                    📅 Kegiatan Internal / Acara Kampus
                  </SelectItem>
                  <SelectItem value="maintenance" className="text-xs">
                    🛠️ Perbaikan / Maintenance Hardware
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pilih Ruangan Lab */}
            <div className="space-y-1.5">
              <Label htmlFor="room_name" className="text-xs font-medium">
                Pilih Ruangan Lab
              </Label>
              <Select value={roomName} onValueChange={(val) => setRoomName(val ?? "")}>
                <SelectTrigger id="room_name" className="h-9 w-full text-xs bg-background">
                  <SelectValue placeholder="Pilih Lab Desain Hub" />
                </SelectTrigger>
                <SelectContent>
                  {LAB_ROOMS.map((room) => (
                    <SelectItem key={room} value={room} className="text-xs">
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nama Kegiatan / Alasan */}
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-medium">
                Nama Kegiatan / Alasan
              </Label>
              <Input
                id="reason"
                className="h-9 text-xs bg-background"
                placeholder={
                  isEvent
                    ? "E.g. Workshop Animasi 3D / LSP"
                    : "E.g. Perbaikan AC / Install PC"
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-1.5">
              <Label htmlFor="start_date" className="text-xs font-medium flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-muted-foreground" /> Mulai Tanggal
              </Label>
              <Input
                id="start_date"
                type="date"
                className="h-9 text-xs bg-background"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>

            {/* Tanggal Selesai */}
            <div className="space-y-1.5">
              <Label htmlFor="end_date" className="text-xs font-medium flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-muted-foreground" /> Sampai Tanggal
              </Label>
              <Input
                id="end_date"
                type="date"
                min={startDate}
                className="h-9 text-xs bg-background"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Tombol Submit */}
            <div className="flex items-end justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className={`w-full h-9 text-xs font-medium ${
                  isEvent
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {submitting ? "Menyimpan..." : isEvent ? "Kunci untuk Acara" : "Kunci Maintenance"}
              </Button>
            </div>
          </div>
        </form>

        {/* Daftar Lab Terkunci / Terjadwal */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daftar Lab Terkunci / Kegiatan Aktif ({maintenances.length})
          </h4>

          {loading ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              Memuat data agenda lab...
            </p>
          ) : maintenances.length === 0 ? (
            <div className="p-6 text-center rounded-lg border border-dashed text-xs text-muted-foreground">
              Tidak ada reservasi kegiatan internal maupun pemeliharaan aktif. Seluruh 12 lab siap digunakan kuliah reguler.
            </div>
          ) : (
            <div className="space-y-2">
              {maintenances.map((item) => {
                const itemIsEvent = item.category === "event";

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                      itemIsEvent
                        ? "bg-blue-500/5 border-blue-500/20"
                        : "bg-amber-500/5 border-amber-500/20"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            itemIsEvent
                              ? "border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                              : "border-amber-500 text-amber-600 dark:text-amber-400 font-semibold"
                          }
                        >
                          {itemIsEvent ? (
                            <Calendar className="h-3 w-3 mr-1" />
                          ) : (
                            <Wrench className="h-3 w-3 mr-1" />
                          )}
                          {item.room_name}
                        </Badge>
                        <span className="text-muted-foreground font-mono">
                          {item.start_date} s/d {item.end_date}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{item.reason}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => handleDelete(item.id, item.room_name)}
                      title="Hapus Agenda"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}