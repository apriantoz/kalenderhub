export interface Schedule {
  id: string;
  course_name: string;
  prodi: string;
  room: string;
  day: string;
  start_time: string;
  end_time: string;
}

export const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/**
 * Mendapatkan nama hari ini dalam Bahasa Indonesia
 */
export function getCurrentDayName(): string {
  const dayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, dst.
  const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS_OF_WEEK[mappedIndex] || 'Senin';
}

/**
 * Memeriksa apakah jadwal sedang berlangsung detik ini
 */
export function isSessionActive(day: string, startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;

  const today = getCurrentDayName();
  if (day.trim().toLowerCase() !== today.toLowerCase()) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

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