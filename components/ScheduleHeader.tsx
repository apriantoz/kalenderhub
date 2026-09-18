"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddScheduleDialog } from "@/components/ui/add-schedule-dialog";
import { LogIn, LogOut } from "lucide-react";

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
              className="cursor-pointer"
              variant="outline"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="cursor-pointer">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}