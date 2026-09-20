"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { MessageSquarePlus, Send, AlertCircle } from "lucide-react";
import { FieldGroup, Field } from "@/components/ui/field";

export function AdminMessageDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");

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

      const data = await res.json();

      if (res.ok) {
        alert("Laporan kendala berhasil dikirim ke Telegram Admin!");
        setMessageText("");
        setSenderName("");
        setRoomName("");
        setErrorMessage("");
        setIsOpen(false);
      } else {
        setErrorMessage(data.error || "Gagal mengirim laporan ke server.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/40 hover:bg-accent/50"
            type="button"
          >
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            Lapor / Hubungi Admin
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Kirim Pesan ke Admin Lab</DialogTitle>
            <DialogDescription>
              Laporkan kendala fasilitas lab atau tanyakan jadwal khusus langsung kepada pengelola Gedung Desain Hub.
            </DialogDescription>
          </DialogHeader>

          {/* Kotak Error agar langsung kelihatan di UI */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <FieldGroup className="grid gap-4 py-1">
            <Field className="grid gap-2">
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
            </Field>

            <Field className="grid gap-2">
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
            </Field>

            <Field className="grid gap-2">
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
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !messageText.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}