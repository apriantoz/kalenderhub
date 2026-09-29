"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ModeTogle";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const turnstileRef = useRef<TurnstileInstance>(null);

  // Fungsi saat tombol "Lihat Jadwal" diklik
  const handleOpenSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  // Fungsi lanjut setelah verifikasi berhasil
  const handleVerifySuccess = (token: string) => {
    setTurnstileToken(token);
    setErrorMessage("");
    setIsLoading(true);

    // Redirect ke halaman jadwal setelah sukses verifikasi
    setTimeout(() => {
      router.push("/schedule");
    }, 600);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-hidden">
      {/* 1. Dot Matrix / Noise Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.12)_1px,transparent_0)] dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)]"
        style={{
          backgroundSize: "24px 24px",
        }}
      />

      {/* 2. Soft Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header Minimalis */}
      <header className="relative z-10 w-full max-w-6xl px-6 py-6 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
          KalenderHub
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            Masuk
          </Link>
          <ModeToggle />
        </div>
      </header>

      {/* 3. Hero Content */}
      <section className="relative z-10 flex-1 w-full max-w-4xl flex flex-col items-center justify-center text-center px-6 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border text-xs font-medium shadow-sm animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-primary"></span>
          V1.0
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] bg-linear-to-br from-cyan-800 to-cyan-300 bg-clip-text text-transparent">
          Kalender Hub
        </h1>

        <p className="max-w-xl text-lg text-gray-600 font-normal">
          Jadwal penggunaan ruang kelas.
        </p>

        {/* Tombol Aksi (CTA) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <button
            onClick={handleOpenSchedule}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-medium text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Lihat Jadwal
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer Minimalis */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-gray-400 border-t">
        &copy; {new Date().getFullYear()} Kalender Hub. All rights reserved.
      </footer>

      {/* --- SHADCN DIALOG TURNSTILE --- */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setIsLoading(false);
            setTurnstileToken(null);
            setErrorMessage("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verifikasi Keamanan</DialogTitle>
            <DialogDescription>
              Selesaikan verifikasi di bawah untuk melanjutkan ke halaman jadwal ruang kelas.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <p className="text-xs text-destructive text-center">{errorMessage}</p>
          )}

          {/* Widget Turnstile */}
          <div className="flex justify-center my-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onSuccess={handleVerifySuccess}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setErrorMessage("Verifikasi keamanan gagal dimuat.")}
              options={{ theme: "auto" }}
            />
          </div>

          {isLoading && (
            <p className="text-xs text-primary font-medium text-center animate-pulse">
              Verifikasi berhasil! Mengalihkan ke jadwal...
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}