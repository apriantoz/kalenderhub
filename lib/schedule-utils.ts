export interface Schedule {
  id: string;
  course_name: string;
  prodi: string;
  semester: number;
  room: string;
  day: string;
  start_time: string;
  end_time: string;
}

export const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

/**
 * Mendapatkan nama hari ini dalam Bahasa Indonesia (Hanya Senin - Jumat)
 */
export function getCurrentDayName(): string {
  const dayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, ..., 5 = Jumat, 6 = Sabtu
  
  // 2. UBAH DI SINI: Jika hari ini Sabtu (6) atau Minggu (0), kembalikan string kosong atau handle khusus
  if (dayIndex === 0 || dayIndex === 6) {
    return 'Libur'; // Anda bisa ganti jadi string lain atau biarkan 'Libur' agar tidak match dengan jadwal mana pun
  }
  
  // Karena dayIndex 1-5 (Senin-Jumat), kurangi 1 agar pas dengan index array 0-4
  const mappedIndex = dayIndex - 1;
  return DAYS_OF_WEEK[mappedIndex] || 'Senin';
}

/**
 * Memeriksa apakah jadwal sedang berlangsung detik ini
 */
export function isSessionActive(day: string, startTime?: string, endTime?: string): boolean {
  if (!startTime || !endTime) return false;

  const today = getCurrentDayName();
  
  // Jika hari ini Sabtu/Minggu (kembalikan 'Libur'), otomatis langsung return false di sini
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

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

export function getConflictingScheduleIds(schedules: Schedule[]): Set<string> {
  const conflictingIds = new Set<string>();
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const itemA = schedules[i];
      const itemB = schedules[j];
      const sameDay = itemA.day.trim().toLowerCase() === itemB.day.trim().toLowerCase();
      const sameRoom = itemA.room.trim().toLowerCase() === itemB.room.trim().toLowerCase();

      if (sameDay && sameRoom && isTimeOverlapping(itemA.start_time, itemA.end_time, itemB.start_time, itemB.end_time)) {
        conflictingIds.add(itemA.id);
        conflictingIds.add(itemB.id);
      }
    }
  }
  return conflictingIds;
}