// schedule.ts (atau schedule-utils.ts)

export interface Session {
  id: string;
  labName?: string;
  room?: string;
  courseName?: string;
  course_name?: string;
  lecturer?: string;
  prodi?: string;
  semester?: number;
  day: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
}

// Alias untuk kompatibilitas jika file lain mengimport tipe 'Schedule'
export type Schedule = Session;

export const DAYS_OF_WEEK = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu"
];

/**
 * Mendapatkan nama hari ini dalam Bahasa Indonesia.
 * Jika akhir pekan (Sabtu/Minggu), mengembalikan 'Libur' agar aman dari pencocokan jadwal reguler.
 */
export function getCurrentDayName(includeWeekend: boolean = false): string {
  const dayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, dst.
  
  if (!includeWeekend && (dayIndex === 0 || dayIndex === 6)) {
    return 'Libur';
  }
  
  const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS_OF_WEEK[mappedIndex] || 'Senin';
}

/**
 * Mengubah string waktu 'HH:mm' atau 'HH:mm:ss' menjadi total menit dalam sehari.
 */
function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  return hours * 60 + minutes;
}

/**
 * Memeriksa apakah sesi jadwal sedang berlangsung saat ini.
 */
export function isSessionActive(
  day: string,
  startTime?: string,
  endTime?: string
): boolean {
  if (!startTime || !endTime) return false;

  const today = getCurrentDayName(false); // Default Senin-Jumat, sesuaikan jika lab buka Sabtu
  if (day.trim().toLowerCase() !== today.toLowerCase()) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Memeriksa apakah dua rentang waktu saling bertabrakan/overlap.
 */
function isTimeOverlapping(
  startA?: string, 
  endA?: string, 
  startB?: string, 
  endB?: string
): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

/**
 * Mendapatkan Set ID dari jadwal-jadwal yang saling bentrok (sama hari, sama ruangan, waktu tumpang tindih).
 * Mendukung properti fleksibel (snake_case / camelCase).
 */
export function getConflictingScheduleIds(schedules: Session[]): Set<string> {
  const conflictingIds = new Set<string>();
  
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const itemA = schedules[i];
      const itemB = schedules[j];

      // Normalisasi field day & room
      const dayA = itemA.day?.trim().toLowerCase() || '';
      const dayB = itemB.day?.trim().toLowerCase() || '';
      
      const roomA = (itemA.room || itemA.labName || '').trim().toLowerCase();
      const roomB = (itemB.room || itemB.labName || '').trim().toLowerCase();

      const sameDay = dayA === dayB;
      const sameRoom = roomA === roomB;

      // Ambil waktu dengan fallback camelCase / snake_case
      const startA = itemA.start_time || itemA.startTime;
      const endA = itemA.end_time || itemA.endTime;
      const startB = itemB.start_time || itemB.startTime;
      const endB = itemB.end_time || itemB.endTime;

      if (sameDay && sameRoom && isTimeOverlapping(startA, endA, startB, endB)) {
        conflictingIds.add(itemA.id);
        conflictingIds.add(itemB.id);
      }
    }
  }
  
  return conflictingIds;
}