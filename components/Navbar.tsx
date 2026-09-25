"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/ModeTogle"; // Sesuaikan path import ModeToggle Anda
import { AddScheduleDialog } from "@/components/add-schedule-dialog"; // Sesuaikan path-nya
import { AdminMessageDialog } from "@/components/AdminMessage"; // Sesuaikan path-nya

interface NavbarProps {
  isAdmin: boolean;
  onReloadSchedules: () => void;
  onLogout: () => void;
}

export function Navbar({ isAdmin, onReloadSchedules, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <h1 className="text-3xl font-bold tracking-tight">KalenderHub</h1>
          </Link>
          <p className="text-sm text-muted-foreground">
            Lihat dan kelola jadwal perkuliahan mingguan.
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-3">
          {isAdmin ? (
            <>
              <AddScheduleDialog onSuccess={onReloadSchedules} />
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                <LogOut className="mr-1.5 h-4 w-4 text-primary" /> Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                <LogIn className="mr-1.5 h-4 w-4 text-primary" /> Login
              </Button>
            </Link>
          )}
          <AdminMessageDialog/>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}