"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Send } from "lucide-react";

export function AdminMessageDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: senderName.trim() || "Mahasiswa / Dosen",
          room: roomName.trim() || "Gedung Desain Hub",
          message: messageText,
        }),
      });

      if (res.ok) {
        alert("Laporan kendala berhasil dikirim ke Telegram Admin!");
        setMessageText("");
        setSenderName("");
        setRoomName("");
        setIsOpen(false);
      } else {
        const errorData = await res.json();
        alert(`Gagal mengirim laporan: ${errorData.error || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/40 hover:bg-accent/50"
            type="button"
          >
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            Lapor / Hubungi Admin
          </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kirim Pesan ke Admin Lab</DialogTitle>
          <DialogDescription>
            Laporkan kendala fasilitas lab atau tanyakan jadwal khusus langsung kepada pengelola Gedung Desain Hub.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs text-muted-foreground">
              Nama / Identitas (Opsional)
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Budi (Mahasiswa Animasi)"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="bg-background/50 border-border/50 h-9 text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room" className="text-xs text-muted-foreground">
              Lokasi Lab / Ruangan (Opsional)
            </Label>
            <Input
              id="room"
              placeholder="Contoh: Lab Komputer 03"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-background/50 border-border/50 h-9 text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message" className="text-xs text-muted-foreground">
              Pesan / Kendala <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tuliskan kendala fasilitas (misal: Proyektor mati, AC kurang dingin)..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[100px] bg-background/50 border-border/50 resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSendMessage}
            disabled={isSubmitting || !messageText.trim()}
            className="w-full gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Mengirim ke Telegram..." : "Kirim Laporan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}