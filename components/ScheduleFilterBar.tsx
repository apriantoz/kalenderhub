"use client";

import { Button } from "@/components/ui/button";
import {
  Filter,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { LAB_ROOMS } from "@/lib/room-constants";
import { PRODI } from "@/lib/prodi-constants";
import { Schedule } from "@/lib/schedule-utils";

interface ScheduleFilterBarProps {
  selectedProdi: string;
  selectedRoom: string;
  onProdiChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onResetFilter: () => void;
  filteredSchedules: Schedule[];
}

export function ScheduleFilterBar({
  selectedProdi,
  selectedRoom,
  onProdiChange,
  onRoomChange,
  onResetFilter,
  filteredSchedules,
}: ScheduleFilterBarProps) {
  const prodiOptions = PRODI;
  const roomOptions = LAB_ROOMS;

  return (
    <div className="w-full space-y-4">
        <Card>
      <CardHeader className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md border text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <div>
            <CardTitle className="text-xs font-semibold tracking-tight">
              Filter & Rekap
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground/80">
              Filter jadwal berdasarkan program studi atau ruangan.
            </CardDescription>
          </div>
        </div>

        <CardAction>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filter Prodi */}
            <Select
              value={selectedProdi}
              onValueChange={(val) => onProdiChange(val ?? "")}
            >
              <SelectTrigger className="w-full md:w-50 text-xs bg-background/40">
                <SelectValue placeholder="Semua Program Studi" />
              </SelectTrigger>
              <SelectContent className="bg-background/50 backdrop-blur-md">
                {prodiOptions.map((prodi) => (
                  <SelectItem key={prodi} value={prodi} className="text-xs">
                    {prodi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Ruangan */}
            <Select
              value={selectedRoom}
              onValueChange={(val) => onRoomChange(val ?? "")}
            >
              <SelectTrigger className="w-full md:w-50 text-xs bg-background/40">
                <SelectValue placeholder="Semua Ruangan" />
              </SelectTrigger>
              <SelectContent className="bg-background/50 backdrop-blur-md">
                {roomOptions.map((room) => (
                  <SelectItem key={room} value={room} className="text-xs">
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Filter */}
            {(selectedProdi !== "" || selectedRoom !== "") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilter}
                className="h-9 text-xs gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}

            {/* Export Rekap Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9 text-xs w-full md:w-auto cursor-pointer bg-background/40"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </Button>
                }
              />
              <DropdownMenuContent
                align="end"
                className="w-48 bg-background/50 backdrop-blur-md"
              >
                <DropdownMenuItem
                  onClick={() => exportToExcel(filteredSchedules)}
                  className="cursor-pointer gap-2 text-xs py-2"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <span>Excel (.xlsx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportToPDF(filteredSchedules)}
                  className="cursor-pointer gap-2 text-xs py-2"
                >
                  <FileText className="h-4 w-4 text-rose-400" />
                  <span>PDF (.pdf)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardAction>
      </CardHeader>
    </Card>
    </div>
    
  )
}