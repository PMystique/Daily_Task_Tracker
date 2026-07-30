import { RoutineItem, DayOfWeek } from '../types';

export const DAYS_OF_WEEK: { code: DayOfWeek; label: string; full: string }[] = [
  { code: 'Mon', label: 'Mon', full: 'monday' },
  { code: 'Tue', label: 'Tue', full: 'tuesday' },
  { code: 'Wed', label: 'Wed', full: 'wednesday' },
  { code: 'Thu', label: 'Thu', full: 'thursday' },
  { code: 'Fri', label: 'Fri', full: 'friday' },
  { code: 'Sat', label: 'Sat', full: 'saturday' },
  { code: 'Sun', label: 'Sun', full: 'sunday' },
];

/**
 * Returns the short DayOfWeek code for a given Date or ISO date string (defaults to today).
 */
export const getDayOfWeekCode = (dateInput?: Date | string): DayOfWeek => {
  const date = dateInput
    ? typeof dateInput === 'string'
      ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T12:00:00`)
      : dateInput
    : new Date();

  const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon, ...
  const map: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[dayIndex];
};

/**
 * Helper to detect if a routine item is a time block (has a time range like "09:00 AM - 02:00 PM" or explicitly flagged).
 */
export const isTimeBlockRoutine = (item: RoutineItem): boolean => {
  if (item.isTimeBlock) return true;
  if (!item.timeSlot) return false;
  const timeSlotLower = item.timeSlot.toLowerCase();
  return (
    timeSlotLower.includes('-') ||
    timeSlotLower.includes(' to ') ||
    timeSlotLower.includes('until') ||
    timeSlotLower.includes('block')
  );
};

/**
 * Parses a string for day names like "Thursday", "Mon, Wed", "every Friday" and returns DayOfWeek[].
 */
export const parseDaysFromText = (text: string): DayOfWeek[] => {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const matchedDays: DayOfWeek[] = [];

  DAYS_OF_WEEK.forEach((d) => {
    if (textLower.includes(d.full) || new RegExp(`\\b${d.code.toLowerCase()}\\b`, 'i').test(textLower)) {
      if (!matchedDays.includes(d.code)) {
        matchedDays.push(d.code);
      }
    }
  });

  return matchedDays;
};

/**
 * Parses a time slot string like "07:00 AM", "04:30 AM - 06:30 AM", "14:00", or "7:30pm"
 * into total minutes from midnight (0 to 1439) for precise chronological sorting.
 */
export const parseTimeSlotToMinutes = (timeSlot: string): number => {
  if (!timeSlot) return 0;
  
  // Extract first time pattern in string
  const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

/**
 * Sorts routine items chronologically by their scheduled time.
 * Falls back to order property or title if times are identical.
 */
export const sortRoutinesChronologically = (routines: RoutineItem[]): RoutineItem[] => {
  return [...routines].sort((a, b) => {
    const timeA = parseTimeSlotToMinutes(a.timeSlot);
    const timeB = parseTimeSlotToMinutes(b.timeSlot);
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return (a.order || 0) - (b.order || 0);
  });
};

/**
 * Returns whether today is a weekend (Saturday or Sunday).
 */
export const isTodayWeekend = (): boolean => {
  const day = new Date().getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Checks if a routine item matches the given date/day environment.
 */
export const isRoutineActiveOnDay = (
  item: RoutineItem,
  dateInput?: Date | string
): boolean => {
  const todayCode = getDayOfWeekCode(dateInput);
  const isWeekend = todayCode === 'Sat' || todayCode === 'Sun';

  // Specific days take precedence if non-empty
  if (item.specificDays && item.specificDays.length > 0) {
    return item.specificDays.includes(todayCode);
  }

  const freq = item.frequency || (item.routineType === 'weekend' ? 'weekends' : 'everyday');
  if (freq === 'everyday') return true;
  if (isWeekend) {
    return freq === 'weekends';
  } else {
    return freq === 'weekdays';
  }
};

/**
 * Filters routines based on frequency filter setting.
 */
export const filterRoutinesByFrequency = (
  routines: RoutineItem[],
  filterMode: 'auto' | 'all' | 'everyday' | 'weekdays' | 'weekends' | DayOfWeek = 'auto'
): RoutineItem[] => {
  if (filterMode === 'all') return routines;

  if (filterMode === 'everyday') {
    return routines.filter(
      (r) => (!r.specificDays || r.specificDays.length === 0) && (r.frequency || 'everyday') === 'everyday'
    );
  }

  if (filterMode === 'weekdays') {
    return routines.filter((r) => {
      if (r.specificDays && r.specificDays.length > 0) {
        return r.specificDays.some((d) => d !== 'Sat' && d !== 'Sun');
      }
      const freq = r.frequency || (r.routineType === 'weekend' ? 'weekends' : 'everyday');
      return freq === 'everyday' || freq === 'weekdays';
    });
  }

  if (filterMode === 'weekends') {
    return routines.filter((r) => {
      if (r.specificDays && r.specificDays.length > 0) {
        return r.specificDays.some((d) => d === 'Sat' || d === 'Sun');
      }
      const freq = r.frequency || (r.routineType === 'weekend' ? 'weekends' : 'everyday');
      return freq === 'everyday' || freq === 'weekends';
    });
  }

  // If filterMode is a specific day code (e.g. 'Thu')
  if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(filterMode)) {
    const dayCode = filterMode as DayOfWeek;
    return routines.filter((r) => {
      if (r.specificDays && r.specificDays.length > 0) {
        return r.specificDays.includes(dayCode);
      }
      const isWknd = dayCode === 'Sat' || dayCode === 'Sun';
      const freq = r.frequency || (r.routineType === 'weekend' ? 'weekends' : 'everyday');
      if (freq === 'everyday') return true;
      return isWknd ? freq === 'weekends' : freq === 'weekdays';
    });
  }

  // 'auto' mode: detects current day of week
  return routines.filter((r) => isRoutineActiveOnDay(r));
};


