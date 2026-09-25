"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Filter,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
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
  CardAction,
} from "@/components/ui/card";
import { LAB_ROOMS } from "@/lib/room-constants";
import { PRODI } from "@/lib/prodi-constants";
import { Schedule } from "@/lib/schedule";

interface ScheduleFilterBarProps {
  selectedProdi: string;
  selectedRoom: string;
  searchSubject: string;
  onProdiChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onSearchSubjectChange: (value: string) => void;
  onResetFilter: () => void;
  filteredSchedules: Schedule[];
}

export function ScheduleFilterBar({
  selectedProdi,
  selectedRoom,
  searchSubject,
  onProdiChange,
  onRoomChange,
  onSearchSubjectChange,
  onResetFilter,
  filteredSchedules,
}: ScheduleFilterBarProps) {
  const prodiOptions = PRODI;
  const roomOptions = LAB_ROOMS;

  const isFiltered =
    selectedProdi !== "" || selectedRoom !== "" || searchSubject !== "";

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4">
          {/* Sisi Kiri: Input Pencarian Mata Kuliah yang Luas & Menonjol */}
          <div className="flex items-center gap-2 w-full md:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari berdasarkan nama mata kuliah..."
                value={searchSubject}
                onChange={(e) => onSearchSubjectChange(e.target.value)}
                className="pl-9 text-xs w-full"
              />
            </div>
          </div>

          {/* Sisi Kanan: Filter Select & Tombol Aksi */}
          <CardAction>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filter Prodi */}
              <Select
                value={selectedProdi}
                onValueChange={(val) => onProdiChange(val ?? "")}
              >
                <SelectTrigger className="w-full sm:w-[150px] text-xs h-10 bg-background">
                  <SelectValue placeholder="Semua Prodi" />
                </SelectTrigger>
                <SelectContent>
                  {prodiOptions.map((prodi) => (
                    <SelectItem key={prodi} value= {prodi} className="text-xs">
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
                <SelectTrigger className="w-full sm:w-[150px] text-xs h-10 bg-background">
                  <SelectValue placeholder="Semua Ruangan" />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((room) => (
                    <SelectItem key={room} value={room} className="text-xs">
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tombol Reset & Export */}
              {isFiltered && (
                <Button
                  variant="ghost"
                  onClick={onResetFilter}
                  className="text-xs text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                    >
                      <Download className="h-3.5 w-3.5 text-primary" /><span className="text-xs">Download</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-44">
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
  );
}