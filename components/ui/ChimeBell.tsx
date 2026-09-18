"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function ChimeBell() {
  const [isPlaying, setIsPlaying] = useState(false);

  const playMallChime = () => {
    if (isPlaying) return;
    setIsPlaying(true);

    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContext();

      // Pola 3 nada lonceng khas pengumuman (Ding-Dong-Ding ala mall/stasiun)
      // Frekuensi dalam Hertz: C6 (1046.50), A5 (880.00), E5 (659.25)
      const notes = [
        { freq: 1046.50, delay: 0 },
        { freq: 880.00, delay: 0.35 },
        { freq: 659.25, delay: 0.70 },
      ];

      notes.forEach(({ freq, delay }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Pakai 'sine' wave dipadu harmoni biar mirip lonceng elektronik
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

        // Atur volume awal & efek fade-out yang halus (panjang gema)
        const startTime = audioCtx.currentTime + delay;
        const duration = 1.5;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });

      // Reset status tombol setelah suara selesai
      setTimeout(() => {
        setIsPlaying(false);
      }, 2200);

    } catch (e) {
      console.error("Gagal memutar audio:", e);
      setIsPlaying(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={playMallChime}
      disabled={isPlaying}
      className="gap-2 border-border/40 hover:bg-accent/50"
    >
      <Bell className={`w-4 h-4 ${isPlaying ? "animate-bounce text-primary" : ""}`} />
      {isPlaying ? "Memutar Bel..." : "Tes Bel Mall"}
    </Button>
  );
}