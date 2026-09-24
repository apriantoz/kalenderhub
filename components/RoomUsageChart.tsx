"use client";

import { useMemo } from "react";
import { DoorClosed, BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Schedule } from "@/lib/schedule";
import { LAB_ROOMS } from "@/lib/room-constants";

interface RoomUsageChartProps {
  schedules: Schedule[];
}

const chartConfig = {
  usage: {
    label: "Sesi Pemakaian",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function RoomUsageChart({ schedules }: RoomUsageChartProps) {
  // Hitung jumlah jadwal terpakai untuk setiap ruangan di LAB_ROOMS
  const chartData = useMemo(() => {
    return LAB_ROOMS.map((room) => {
      const count = schedules.filter((s) => s.room === room).length;
      return {
        room: `Lab ${room}`,
        usage: count,
      };
    });
  }, [schedules]);

  // Cari ruangan yang paling sibuk/banyak terpakai
  const busiestRoom = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.usage - a.usage)[0];
  }, [chartData]);

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Statistik Penggunaan Ruangan
            </CardTitle>
            <CardDescription className="text-xs">
              Intensitas pemakaian ruang lab
            </CardDescription>
          </div>
          <div className="p-2 border rounded-lg bg-muted/50 text-muted-foreground">
            <DoorClosed className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>

<CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
              top: 10,
              bottom: 25, // Tambah ruang di bawah agar teks yang miring tidak terpotong
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="room"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tick={{ fontSize: 10 }}
              angle={-25} // Miringkan teks sedikit agar muat di layar kecil
              textAnchor="end" // Titik jangkar teks menyesuaikan kemiringan
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, "dataMax + 1"]}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="usage"
              fill="var(--color-usage)"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-xs">
          <div className="grid gap-1 min-h-[38px]">
            {busiestRoom && busiestRoom.usage > 0 ? (
              <div className="flex items-center gap-1.5 font-medium leading-none">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                Terpadat: {busiestRoom.room} ({busiestRoom.usage} sesi)
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-medium leading-none text-muted-foreground">
                Belum ada data pemakaian ruangan
              </div>
            )}
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Menampilkan seluruh Lab ({LAB_ROOMS.join(", ")})
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}