import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const geist = Geist({ subsets: ["latin"] });

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
    <html
      lang="id"
      className={`${geist.className} h-full dark antialiased`}
    >
      <body className="min-h-full flex flex-col bg-fixed">
        {" "}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
