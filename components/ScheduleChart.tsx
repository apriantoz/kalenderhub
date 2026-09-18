"use client";

import { useMemo } from "react";
import { TrendingUp, CalendarDays } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { Schedule, DAYS_OF_WEEK } from "@/lib/schedule-utils";

interface ScheduleChartProps {
  schedules: Schedule[];
}

const chartConfig = {
  total: {
    label: "Total Sesi",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ScheduleChart({ schedules }: ScheduleChartProps) {
  // Olah data schedules menjadi hitungan total kelas per hari
  const chartData = useMemo(() => {
    return DAYS_OF_WEEK.map((day) => {
      const count = schedules.filter((s) => s.day === day).length;
      return {
        day,
        total: count,
      };
    });
  }, [schedules]);

  // Hitung total seluruh sesi perkuliahan
  const totalClasses = useMemo(() => {
    return schedules.length;
  }, [schedules]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Statistik Jadwal Mingguan
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi jumlah sesi perkuliahan per hari
            </CardDescription>
          </div>
          <div className="p-2 border rounded-lg bg-muted/50 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="total"
              type="natural"
              fill="oklch(35.9% 0.144 278.697)"
              fillOpacity={0.4}
              stroke="oklch(35.9% 0.144 278.697)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-xs">
          <div className="grid gap-1">
            <div className="flex items-center gap-1.5 font-medium leading-none">
              Total {totalClasses} sesi perkuliahan aktif minggu ini
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Senin - Jumat
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}