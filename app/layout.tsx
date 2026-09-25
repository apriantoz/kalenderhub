import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
      suppressHydrationWarning
      className={`${geist.className} h-full antialiased scrollbar-gutter-stable`}
    >
      <body className="min-h-full flex flex-col bg-slate-200 dark:bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <Toaster /></ThemeProvider>
      </body>
    </html>
  );
}