"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Settings, CheckCircle2, AlertCircle } from "lucide-react";

export function AcademicSettingsCard() {
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [termType, setTermType] = useState("Gasal");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Ambil pengaturan saat komponen dimuat
  useEffect(() => {
    async function fetchSettings() {
      setFetching(true);
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value");

      if (!error && data) {
        data.forEach((item) => {
          if (item.key === "active_academic_year") setAcademicYear(item.value);
          if (item.key === "active_term_type") setTermType(item.value);
        });
      }
      setFetching(false);
    }

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Upsert tahun ajaran
      const { error: err1 } = await supabase
        .from("app_settings")
        .upsert({ key: "active_academic_year", value: academicYear }, { onConflict: "key" });

      // Upsert jenis semester
      const { error: err2 } = await supabase
        .from("app_settings")
        .upsert({ key: "active_term_type", value: termType }, { onConflict: "key" });

      if (err1 || err2) throw new Error(err1?.message || err2?.message);

      setMessage({ type: "success", text: "Pengaturan akademik berhasil diperbarui, bosku!" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui";
      setMessage({ type: "error", text: "Gagal menyimpan: " + errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card className="w-full max-w-xl">
        <CardContent className="py-6 text-sm text-muted-foreground text-center">
          Memuat pengaturan akademik...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-4 border-b">
        <Settings className="h-5 w-5 text-primary" />
        <CardTitle className="text-base font-semibold">Pengaturan Periode Akademik</CardTitle>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-4 pt-4">
          {message && (
            <div
              className={`flex items-center gap-2 p-3 text-sm rounded-md border ${
                message.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/20"
                  : "text-destructive bg-destructive/10 border-destructive/20"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="academic_year">Tahun Ajaran Aktif</Label>
            <Input
              id="academic_year"
              placeholder="Contoh: 2025/2026"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Format umum: YYYY/YYYY (misal: 2025/2026 atau 2026/2027)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="term_type">Jenis Semester Aktif</Label>
            <Select value={termType} onValueChange={(val) => setTermType(val ?? "Gasal")}>
              <SelectTrigger id="term_type" className="w-full">
                <SelectValue placeholder="Pilih Jenis Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gasal">Gasal</SelectItem>
                <SelectItem value="Genap">Genap</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Menentukan periode semester berjalan saat ini untuk seluruh laboratorium Desain Hub.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-2 border-t">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}