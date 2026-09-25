"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddScheduleDialog } from "@/components/add-schedule-dialog";
import { LogIn, LogOut } from "lucide-react";
import { AdminMessageDialog } from "./AdminMessage";
import { ModeToggle } from "./ModeTogle";

interface ScheduleHeaderProps {
  isAdmin: boolean;
  onReloadSchedules: () => void;
  onLogout: () => void;
}

export function ScheduleHeader({
  isAdmin,
  onReloadSchedules,
  onLogout,
}: ScheduleHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">KalenderHub</h1>
        <p className="text-muted-foreground/80">
          Lihat dan kelola jadwal perkuliahan mingguan.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isAdmin ? (
          <>
            <AddScheduleDialog onSuccess={onReloadSchedules} />
            <Button
              variant="outline"
              size={'sm'}
              onClick={onLogout}
            >
              <LogOut className="mr-1.5 h-4 w-4 text-primary" />Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="outline" size={'sm'}>
              <LogIn className="mr-1.5 h-4 w-4 text-primary"/>Login
            </Button>
          </Link>
        )}
        <AdminMessageDialog/>
        <ModeToggle/>
      </div>
    </div>
  );
}