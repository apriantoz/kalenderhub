// schedule.ts (Updated untuk Skema Relasional)

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  prodi_code: string;
  semester: number;
}

export interface Session {
  id: string;
  course_id: string;
  room: string;
  day: string;
  start_time: string; // Tipe waktu dari database (biasanya string format "HH:mm:ss")
  end_time: string;
  term_type: string;     // Jenis Semester (Gasal / Genap)
  academic_year: string; // Tahun Ajaran (Contoh: 2025/2026)
  
  // Data hasil JOIN dengan tabel courses (biasanya didapat saat melakukan query relasi di Supabase)
  courses?: Course;
  
  // Properti opsional pendukung (untuk fallback jika di frontend kamu masih sering pakai bentuk flat)
  labName?: string;
  courseName?: string;
  course_name?: string;
  lecturer?: string;
  prodi?: string;
  semester?: number;
  startTime?: string;
  endTime?: string;
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

  const today = getCurrentDayName(false);
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
 * Mendapatkan Set ID dari jadwal-jadwal yang saling bentrok.
 */
export function getConflictingScheduleIds(schedules: Session[]): Set<string> {
  const conflictingIds = new Set<string>();
  
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const itemA = schedules[i];
      const itemB = schedules[j];

      const dayA = itemA.day?.trim().toLowerCase() || '';
      const dayB = itemB.day?.trim().toLowerCase() || '';
      
      const roomA = (itemA.room || itemA.labName || '').trim().toLowerCase();
      const roomB = (itemB.room || itemB.labName || '').trim().toLowerCase();

      const sameDay = dayA === dayB;
      const sameRoom = roomA === roomB;

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