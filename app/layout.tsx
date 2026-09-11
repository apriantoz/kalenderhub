import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import{ Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KalenderHub - Pengelola Jadwal Kelas",
  description: "Aplikasi manajemen jadwal perkuliahan dan laboratorium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full bg-background antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}