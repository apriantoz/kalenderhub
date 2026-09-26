import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-background via-muted/20 to-background text-foreground">
      {/* Badge / Pill highlight */}
      <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground shadow-sm mb-6">
        <span>✨</span> Platform Manajemen Jadwal Terpadu
      </div>

      {/* Main Title & Subtitle */}
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
          Kalender <span className="text-primary">Hub</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
          Kelola agenda, acara, dan jadwal kegiatan Anda dengan lebih rapi, efisien, dan terstruktur.
        </p>
      </div>

      {/* Action CTA */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base sm:text-lg font-medium text-primary-foreground shadow transition hover:opacity-90 hover:scale-105 active:scale-95"
        >
          Mulai Sekarang
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {/* Quick Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full text-center">
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="text-2xl mb-1">📅</div>
          <h3 className="font-semibold text-sm sm:text-base">Sinkronisasi Jadwal</h3>
          <p className="text-xs text-muted-foreground mt-1">Akses jadwal harian dan bulanan kapan saja.</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="text-2xl mb-1">🔔</div>
          <h3 className="font-semibold text-sm sm:text-base">Pengingat Cepat</h3>
          <p className="text-xs text-muted-foreground mt-1">Jangan lewatkan agenda penting Anda.</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="text-2xl mb-1">⚡</div>
          <h3 className="font-semibold text-sm sm:text-base">Ringan & Cepat</h3>
          <p className="text-xs text-muted-foreground mt-1">Navigasi mulus tanpa hambatan.</p>
        </div>
      </div>
    </main>
  );
}