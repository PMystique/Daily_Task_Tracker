export type Category = 
  | 'life' 
  | 'work' 
  | 'school' 
  | 'finance' 
  | 'career' 
  | 'family-social' 
  | 'side-hustle' 
  | 'health' 
  | 'learning-skills' 
  | string;

export type Priority = 'urgent' | 'important' | 'normal' | 'low';

export type Frequency = 'one-time' | 'daily' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  status: 'pending' | 'completed';
  priority: Priority;
  tags: string[];
  frequency: Frequency;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm format
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  estimatedMinutes?: number;
  calendarEventId?: string;
  notes?: string;
  reminderMinutesBefore?: number; // e.g. 15, 30, 60
  subtasks?: SubTask[];
  
  // Goal & Task relationship
  isGoal?: boolean; // True if this item is a top-level Goal / Project
  goalId?: string; // ID of the parent Goal this task belongs to (if not independent)
  goalTitle?: string; // Title of the parent Goal for display
  
  // AI Copilot & Performance fields
  postponeCount?: number;
  lastActivityDate?: string;
}

export type RoutineType = 'morning' | 'evening' | 'weekend';

export interface RoutineItem {
  id: string;
  routineType: RoutineType;
  timeSlot: string; // e.g. "04:00 AM", "04:30 AM - 06:30 AM"
  title: string;
  details?: string;
  completedDates: string[]; // YYYY-MM-DD array of days completed
  order: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO or "09:00 AM"
  endTime: string;
  date: string; // YYYY-MM-DD
  category: Category;
  location?: string;
  description?: string;
  importedAsTaskId?: string;
}

export type NotificationMode = 'all' | 'popup' | 'silent' | 'disabled';

export interface NotificationSetting {
  enabled: boolean;
  mode: NotificationMode;
  permissionStatus: NotificationPermission | 'default';
  leadTimeMinutes: number;
  soundEnabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  role: string;
}

export interface FilterState {
  search: string;
  category: Category | 'all';
  tags: string[];
  status: 'all' | 'pending' | 'completed' | 'overdue';
  frequency: 'all' | Frequency;
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt';
  goalFilter?: 'all' | 'goals-only' | 'tasks-only' | string; // 'all', 'goals-only', 'tasks-only', or specific goalId
}
