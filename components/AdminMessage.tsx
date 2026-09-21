"use client";

import { useState, useRef } from "react";
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
import { MessageSquarePlus, Send, AlertCircle } from "lucide-react";
import { FieldGroup, Field } from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export function AdminMessageDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    // Validasi apakah Turnstile sudah diverifikasi
    if (!turnstileToken) {
      setErrorMessage("Selesaikan verifikasi keamanan (Turnstile) terlebih dahulu.");
      return;
    }

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
          token: turnstileToken, // Kirim token ke backend untuk divalidasi via siteverify
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.add({
          type: "success",
          description: "Laporan kendala berhasil dikirim ke Telegram Admin.",
        });

        setMessageText("");
        setSenderName("");
        setRoomName("");
        setTurnstileToken(null);
        setErrorMessage("");
        setIsOpen(false);
      } else {
        setErrorMessage(data.error || "Gagal mengirim laporan ke server.");
        // Reset widget turnstile jika gagal agar user bisa generate token baru
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Terjadi kesalahan koneksi ke server.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setErrorMessage("");
          setTurnstileToken(null);
        }
      }}
    >
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

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gagal</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
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
                disabled={isSubmitting}
                className="bg-background/50 border-border/50 h-9 text-sm"
              />
            </Field>

            <Field className="grid gap-2">
              <Label htmlFor="room" className="text-xs text-muted-foreground">
                Lokasi Lab / Ruangan (Opsional)
              </Label>
              <Input
                id="room"
                placeholder="Contoh: Ruang 1A"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                disabled={isSubmitting}
                className="bg-background/50 border-border/50 h-9 text-sm"
              />
            </Field>

            <Field className="grid gap-2">
              <Label htmlFor="message" className="text-xs text-muted-foreground">
                Pesan / Kendala <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Tuliskan kendala fasilitas (misal: TV mati, AC kurang dingin)..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[100px] bg-background/50 border-border/50 resize-none text-sm"
              />
            </Field>

            {/* Widget Cloudflare Turnstile */}
            <div className="flex justify-center pt-1">
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setErrorMessage("");
                }}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setErrorMessage("Verifikasi keamanan gagal dimuat.")}
                options={{theme:"dark"}}
              />
            </div>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !messageText.trim() || !turnstileToken}
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