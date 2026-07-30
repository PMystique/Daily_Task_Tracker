import { Task, RoutineItem, CalendarEvent, NotificationSetting, UserProfile } from '../types';
import { INITIAL_TASKS, INITIAL_ROUTINE_ITEMS, INITIAL_CALENDAR_EVENTS } from '../data/initialData';

const KEYS = {
  TASKS: 'task_tracker_tasks_v3',
  ROUTINES: 'task_tracker_routines_v3',
  CALENDAR: 'task_tracker_calendar_v3',
  NOTIFICATIONS: 'task_tracker_notification_settings_v3',
  THEME: 'task_tracker_theme_v2',
  CUSTOM_CATEGORIES: 'task_tracker_custom_categories_v2',
  REMOVED_DEFAULT_CATEGORIES: 'task_tracker_removed_default_categories_v1',
  USER_PROFILE: 'task_tracker_user_profile_v2',
};

export interface CustomCategory {
  id: string;
  label: string;
  color?: string;
}

export const loadRemovedDefaultCategories = (): string[] => {
  try {
    const data = localStorage.getItem(KEYS.REMOVED_DEFAULT_CATEGORIES);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load removed default categories:', err);
    return [];
  }
};

export const saveRemovedDefaultCategories = (ids: string[]): void => {
  try {
    localStorage.setItem(KEYS.REMOVED_DEFAULT_CATEGORIES, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save removed default categories:', err);
  }
};

export const loadCustomCategories = (): CustomCategory[] => {
  try {
    const data = localStorage.getItem(KEYS.CUSTOM_CATEGORIES);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load custom categories:', err);
    return [];
  }
};

export const saveCustomCategories = (categories: CustomCategory[]): void => {
  try {
    localStorage.setItem(KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save custom categories:', err);
  }
};

export const loadTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(KEYS.TASKS);
    if (!data) return INITIAL_TASKS;
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load tasks:', err);
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
};

export const loadRoutines = (): RoutineItem[] => {
  try {
    const data = localStorage.getItem(KEYS.ROUTINES);
    if (!data) return INITIAL_ROUTINE_ITEMS;
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load routines:', err);
    return INITIAL_ROUTINE_ITEMS;
  }
};

export const saveRoutines = (routines: RoutineItem[]): void => {
  try {
    localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
  } catch (err) {
    console.error('Failed to save routines:', err);
  }
};

export const loadCalendarEvents = (): CalendarEvent[] => {
  try {
    const data = localStorage.getItem(KEYS.CALENDAR);
    if (!data) return INITIAL_CALENDAR_EVENTS;
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load calendar events:', err);
    return INITIAL_CALENDAR_EVENTS;
  }
};

export const saveCalendarEvents = (events: CalendarEvent[]): void => {
  try {
    localStorage.setItem(KEYS.CALENDAR, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save calendar events:', err);
  }
};

export const loadNotificationSettings = (): NotificationSetting => {
  const defaultSetting: NotificationSetting = {
    enabled: true,
    mode: 'all',
    permissionStatus: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    leadTimeMinutes: 15,
    soundEnabled: true,
  };
  try {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!data) return defaultSetting;
    const parsed = JSON.parse(data);
    return {
      ...defaultSetting,
      ...parsed,
      mode: parsed.mode || (parsed.enabled ? 'all' : 'disabled'),
      permissionStatus: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    };
  } catch (err) {
    return defaultSetting;
  }
};

export const saveNotificationSettings = (settings: NotificationSetting): void => {
  try {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save notification settings:', err);
  }
};

export const loadUserProfile = (): UserProfile => {
  const defaultProfile: UserProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    avatarColor: 'bg-indigo-600',
    role: 'Pro Member',
  };
  try {
    const data = localStorage.getItem(KEYS.USER_PROFILE);
    if (!data) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(data) };
  } catch (err) {
    return defaultProfile;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
};

export const loadTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem(KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to dark mode for comfortable late night planning
    return 'dark';
  } catch (err) {
    return 'dark';
  }
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch (err) {
    console.error('Failed to save theme:', err);
  }
};

export const resetAllToDefault = () => {
  localStorage.removeItem(KEYS.TASKS);
  localStorage.removeItem(KEYS.ROUTINES);
  localStorage.removeItem(KEYS.CALENDAR);
  localStorage.removeItem(KEYS.NOTIFICATIONS);
};
