export interface Session {
  id: string;
  labName?: string;
  room?: string;
  courseName?: string;
  course_name?: string;
  lecturer?: string;
  prodi?: string;
  day: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
}

export const DAYS_OF_WEEK = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu"
];

export function getCurrentDayName(): string {
  const dayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, dst.
  const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS_OF_WEEK[mappedIndex];
}

export function isSessionActive(
  day: string,
  startTime?: string,
  endTime?: string
): boolean {
  if (!startTime || !endTime) return false;

  const today = getCurrentDayName();
  // Pengecekan nama hari (case-insensitive & trim space)
  if (day.trim().toLowerCase() !== today.toLowerCase()) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Bersihkan format HH:mm:ss menjadi HH:mm
  const cleanStart = startTime.split(':').slice(0, 2).join(':');
  const cleanEnd = endTime.split(':').slice(0, 2).join(':');

  const [startH, startM] = cleanStart.split(':').map(Number);
  const [endH, endM] = cleanEnd.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}