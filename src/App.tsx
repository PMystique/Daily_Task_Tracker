import React, { useState, useEffect, useMemo } from 'react';
import { 
  Task, 
  RoutineItem, 
  CalendarEvent, 
  Category, 
  NotificationSetting, 
  FilterState, 
  RoutineType,
  RoutineFrequency,
  SubTask
} from './types';
import { 
  loadTasks, 
  saveTasks, 
  loadRoutines, 
  saveRoutines, 
  loadCalendarEvents, 
  saveCalendarEvents, 
  loadNotificationSettings, 
  saveNotificationSettings, 
  loadTheme, 
  saveTheme,
  loadCustomCategories,
  saveCustomCategories,
  loadRemovedDefaultCategories,
  saveRemovedDefaultCategories,
  loadUserProfile,
  saveUserProfile,
  CustomCategory
} from './utils/storage';
import { DEFAULT_CATEGORIES } from './data/categories';
import { UserProfile } from './types';
import { checkTasksForDeadlines, sendPushNotification } from './utils/notifications';

import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { CategoryTabs, MainViewMode } from './components/CategoryTabs';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskCard } from './components/TaskCard';
import { ProductivityTrends } from './components/ProductivityTrends';
import { HighDensitySideColumn } from './components/HighDensitySideColumn';
import { RoutineTracker } from './components/RoutineTracker';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { TaskModal } from './components/TaskModal';
import { GoalDetailModal } from './components/GoalDetailModal';
import { NotificationToast, ToastAlert } from './components/NotificationToast';
import { AskCoachModal, RoutineEditUpdate } from './components/AskCoachModal';
import { ProactiveCopilotCards } from './components/ProactiveCopilotCards';
import { CompactMetricRibbon } from './components/CompactMetricRibbon';

import { getCategoryLabel } from './data/categories';
import { Plus, CheckCircle2, X, Target, Clock, AlertTriangle, ListTodo, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  // Persistence state
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [routines, setRoutines] = useState<RoutineItem[]>(() => loadRoutines());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => loadCalendarEvents());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting>(() => loadNotificationSettings());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => loadCustomCategories());
  const [removedDefaultCategoryIds, setRemovedDefaultCategoryIds] = useState<string[]>(() => loadRemovedDefaultCategories());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());

  const handleUpdateUserProfile = (p: UserProfile) => {
    setUserProfile(p);
    saveUserProfile(p);
  };

  const handleRemoveCategory = (catId: string) => {
    const isDefault = DEFAULT_CATEGORIES.some((c) => c.id === catId);
    if (isDefault) {
      setRemovedDefaultCategoryIds((prev) => {
        if (prev.includes(catId)) return prev;
        const updated = [...prev, catId];
        saveRemovedDefaultCategories(updated);
        return updated;
      });
    } else {
      setCustomCategories((prev) => {
        const updated = prev.filter((c) => c.id !== catId);
        saveCustomCategories(updated);
        return updated;
      });
    }

    if (selectedCategory === catId) {
      setSelectedCategory('all');
    }

    const toast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '🗑️ Category Removed',
      message: `Removed category from workspace view.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
  };

  const handleRestoreDefaultCategories = () => {
    setRemovedDefaultCategoryIds([]);
    saveRemovedDefaultCategories([]);
    const toast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '🔄 Default Categories Restored',
      message: `All standard built-in categories have been restored.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
  };

  const handleRemoveTagFromTask = (taskId: string, tagToRemove: string) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          tags: (t.tags || []).filter((tag) => tag !== tagToRemove),
        };
      });
      saveTasks(updated);
      return updated;
    });

    const toast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '🏷️ Tag Removed',
      message: `Tag "#${tagToRemove}" removed from task.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
  };

  const handleDeleteTagGlobally = (tagToRemove: string) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((task) => {
        if (!task.tags || !task.tags.includes(tagToRemove)) return task;
        return {
          ...task,
          tags: task.tags.filter((t) => t !== tagToRemove),
        };
      });
      saveTasks(updated);
      return updated;
    });

    setFilter((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));

    const toast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '🏷️ Tag Removed Globally',
      message: `Tag "#${tagToRemove}" removed from all tasks.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
  };

  const handleSendTestNotification = () => {
    sendPushNotification('🔔 Test Notification Alert', {
      body: 'Your notification system is configured and working perfectly!',
      tag: 'test-notification',
      playSound: notificationSettings.soundEnabled !== false,
    });

    const testToast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '🔔 Test Notification Alert',
      message: 'Your notification settings and chime alerts are functioning as expected.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setToasts((prev) => [testToast, ...prev].slice(0, 4));
  };

  // UI state
  const [activeView, setActiveView] = useState<MainViewMode>('tasks');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const handleAddCustomCategory = (name: string) => {
    const cleanLabel = name.trim();
    if (!cleanLabel) return;
    const id = cleanLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!id) return;

    setCustomCategories((prev) => {
      if (prev.some((c) => c.id === id)) return prev;
      return [...prev, { id, label: cleanLabel, color: '#6366f1' }];
    });
    setSelectedCategory(id);
  };
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    category: 'all',
    tags: [],
    status: 'all',
    frequency: 'all',
    sortBy: 'dueDate',
  });

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Modal & Toast state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [selectedGoalForModal, setSelectedGoalForModal] = useState<Task | null>(null);
  const [isAskCoachOpen, setIsAskCoachOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // AI Coach & Copilot Handlers
  const handleApplyCoachPlan = (
    newGoal?: Task | null,
    newTasks?: Task[],
    newRoutines?: RoutineItem[],
    routineEdits?: RoutineEditUpdate[]
  ) => {
    if (newGoal || (newTasks && newTasks.length > 0)) {
      setTasks((prev) => {
        const addition: Task[] = [];
        if (newGoal) addition.push(newGoal);
        if (newTasks) addition.push(...newTasks);
        const updated = [...addition, ...prev];
        saveTasks(updated);
        return updated;
      });
    }

    if ((newRoutines && newRoutines.length > 0) || (routineEdits && routineEdits.length > 0)) {
      setRoutines((prev) => {
        let updated = [...prev];
        if (newRoutines && newRoutines.length > 0) {
          newRoutines.forEach((nr) => {
            const nrTitleNorm = nr.title.toLowerCase().trim();
            const existingIdx = updated.findIndex((r) => {
              const rTitleNorm = r.title.toLowerCase().trim();
              return (
                rTitleNorm === nrTitleNorm ||
                (nrTitleNorm.length > 3 && rTitleNorm.includes(nrTitleNorm)) ||
                (rTitleNorm.length > 3 && nrTitleNorm.includes(rTitleNorm))
              );
            });

            if (existingIdx !== -1) {
              updated[existingIdx] = {
                ...updated[existingIdx],
                timeSlot: nr.timeSlot || updated[existingIdx].timeSlot,
                details: nr.details !== undefined ? nr.details : updated[existingIdx].details,
                frequency: nr.frequency || updated[existingIdx].frequency,
                specificDays: nr.specificDays || updated[existingIdx].specificDays,
                isTimeBlock: nr.isTimeBlock !== undefined ? nr.isTimeBlock : updated[existingIdx].isTimeBlock,
              };
            } else {
              updated.push(nr);
            }
          });
        }
        if (routineEdits && routineEdits.length > 0) {
          updated = updated.map((r) => {
            const match = routineEdits.find(
              (e) =>
                (e.id && e.id === r.id) ||
                (e.titleToMatch && r.title.toLowerCase().includes(e.titleToMatch.toLowerCase()))
            );
            if (match) {
              return {
                ...r,
                timeSlot: match.newTimeSlot || r.timeSlot,
                title: match.newTitle || r.title,
                details: match.newDetails !== undefined ? match.newDetails : r.details,
                routineType: match.routineType || r.routineType,
                frequency: match.frequency || r.frequency,
                specificDays: match.specificDays || r.specificDays,
                isTimeBlock: match.isTimeBlock !== undefined ? match.isTimeBlock : r.isTimeBlock,
              };
            }
            return r;
          });
        }
        saveRoutines(updated);
        return updated;
      });
    }

    const parts = [];
    if (newGoal) parts.push(`Goal ("${newGoal.title}")`);
    if (newTasks && newTasks.length > 0) parts.push(`${newTasks.length} tasks`);
    if (newRoutines && newRoutines.length > 0) parts.push(`${newRoutines.length} new routines`);
    if (routineEdits && routineEdits.length > 0) parts.push(`${routineEdits.length} routine edits`);

    const newToast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '✨ AI Coach Plan Applied',
      message: parts.length > 0 ? `Successfully updated: ${parts.join(', ')}.` : 'AI schedule changes applied.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
  };

  const handleBreakTaskIntoSubtasks = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== taskId) return t;
        const nowIso = new Date().toISOString();
        const existingSubtasks = t.subtasks || [];
        const newSubtasks: SubTask[] = [
          { id: `sub-${Date.now()}-1`, title: 'Step 1: Outline core objectives & scope', completed: false, createdAt: nowIso },
          { id: `sub-${Date.now()}-2`, title: 'Step 2: Execute primary implementation phase', completed: false, createdAt: nowIso },
          { id: `sub-${Date.now()}-3`, title: 'Step 3: Review & finalize output deliverables', completed: false, createdAt: nowIso },
        ];
        return {
          ...t,
          postponeCount: 0,
          subtasks: [...existingSubtasks, ...newSubtasks],
        };
      });
      saveTasks(updated);
      return updated;
    });

    const toast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '⚡ Subtasks Generated',
      message: 'Task broken down into 3 manageable action subtasks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
  };

  const handleRescheduleOverbookedTasks = () => {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (!t.completed && t.status === 'pending' && (t.priority === 'normal' || t.priority === 'low') && (t.dueDate === todayStr || !t.dueDate)) {
          return {
            ...t,
            dueDate: tomorrowStr,
            postponeCount: (t.postponeCount || 0) + 1,
          };
        }
        return t;
      });
      saveTasks(updated);
      return updated;
    });

    const toast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '📅 Schedule Rebalanced',
      message: 'Lower-priority tasks shifted to tomorrow to protect today\'s deep focus.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
  };

  const handleAddStepToStalledGoal = (goalId: string, goalTitle: string) => {
    setEditingTask({
      title: '',
      category: selectedCategory === 'all' ? 'work' : selectedCategory,
      status: 'pending',
      priority: 'important',
      tags: ['#DEEP-WORK'],
      frequency: 'one-time',
      goalId: goalId,
      goalTitle: goalTitle,
    } as Task);
    setIsTaskModalOpen(true);
  };

  const handleOpenGoalModal = (goalTask: Task) => {
    const fullGoal = tasks.find((t) => t.id === goalTask.id) || goalTask;
    setSelectedGoalForModal(fullGoal);
    setIsGoalModalOpen(true);
  };

  const handleAddChildTaskToGoal = (goalId: string, goalTitle: string, category: string, title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      category: category as Category,
      status: 'pending',
      priority: 'normal',
      tags: ['project-specific', category],
      frequency: 'one-time',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      goalId: goalId,
      goalTitle: goalTitle,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Dynamic Light / Dark mode toggle with localStorage persistence
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
    }
    saveTheme(theme);
  }, [theme]);

  // Save changes to localStorage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  useEffect(() => {
    saveCalendarEvents(calendarEvents);
  }, [calendarEvents]);

  useEffect(() => {
    saveNotificationSettings(notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    saveCustomCategories(customCategories);
  }, [customCategories]);

  // Background timer for push notification deadline reminders
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const runDeadlineCheck = () => {
      checkTasksForDeadlines(tasks, (title, message, taskId) => {
        sendPushNotification(title, { body: message, tag: `deadline-${taskId}` });

        const newToast: ToastAlert = {
          id: `toast-${Date.now()}-${Math.random()}`,
          title,
          message,
          taskId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setToasts((prev) => {
          if (prev.some((t) => t.taskId === taskId)) return prev;
          return [newToast, ...prev].slice(0, 4);
        });
      });
    };

    runDeadlineCheck();
    const interval = setInterval(runDeadlineCheck, 30000);
    return () => clearInterval(interval);
  }, [tasks, notificationSettings]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Task actions
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'completed';
          return {
            ...t,
            status: isDone ? 'pending' : 'completed',
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Task;
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleDuplicateTask = (task: Task) => {
    const dup: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`,
      status: 'pending',
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      subtasks: task.subtasks ? task.subtasks.map((st) => ({ ...st, id: Date.now().toString() + Math.random().toString(36).substring(2, 5) })) : undefined,
    };
    setTasks((prev) => [dup, ...prev]);
  };

  // Subtask actions
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          return {
            ...t,
            subtasks: updatedSubtasks,
            status: allDone ? 'completed' : t.status,
            completedAt: allDone ? (t.completedAt || new Date().toISOString()) : (t.status === 'completed' && !allDone ? undefined : t.completedAt)
          };
        }
        return t;
      })
    );
  };

  const handleAddSubtaskToTask = (taskId: string, subtaskTitle: string) => {
    if (!subtaskTitle.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSubtask: SubTask = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
            title: subtaskTitle.trim(),
            completed: false,
          };
          const existing = t.subtasks || [];
          return {
            ...t,
            subtasks: [...existing, newSubtask],
            status: 'pending',
          };
        }
        return t;
      })
    );
  };

  const handleDeleteSubtaskFromTask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.filter((st) => st.id !== subtaskId);
          return {
            ...t,
            subtasks: updatedSubtasks,
          };
        }
        return t;
      })
    );
  };

  // Routine actions
  const handleToggleRoutineItem = (itemId: string, dateStr: string) => {
    setRoutines((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const isDone = item.completedDates.includes(dateStr);
          const newDates = isDone
            ? item.completedDates.filter((d) => d !== dateStr)
            : [...item.completedDates, dateStr];
          return { ...item, completedDates: newDates };
        }
        return item;
      })
    );
  };

  const handleAddRoutineItem = (itemData: Omit<RoutineItem, 'id' | 'completedDates'>) => {
    const newItem: RoutineItem = {
      ...itemData,
      id: `routine-${Date.now()}`,
      completedDates: [],
    };
    setRoutines((prev) => [...prev, newItem]);
  };

  const handleEditRoutineItem = (updatedItem: RoutineItem) => {
    setRoutines((prev) => prev.map((r) => (r.id === updatedItem.id ? updatedItem : r)));
  };

  const handleDeleteRoutineItem = (itemId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== itemId));
  };

  const handleResetTodayRoutine = (type: RoutineType, dateStr: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.routineType === type) {
          return { ...r, completedDates: r.completedDates.filter((d) => d !== dateStr) };
        }
        return r;
      })
    );
  };

  // Calendar sync action
  const handleSyncEventToTask = (event: CalendarEvent) => {
    const descParts: string[] = [];
    if (event.description) descParts.push(event.description);
    if (event.location) descParts.push(`📍 ${event.location}`);
    if (event.startTime) descParts.push(`⏰ ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`);

    const newTask: Task = {
      id: `task-cal-${Date.now()}`,
      title: event.title,
      description: descParts.length > 0 ? descParts.join(' • ') : undefined,
      category: event.category,
      status: 'pending',
      priority: 'important',
      tags: ['#CALENDAR-SYNC', `#${event.category.toUpperCase()}`],
      frequency: 'one-time',
      dueDate: event.date,
      dueTime: event.startTime,
      calendarEventId: event.id,
      createdAt: new Date().toISOString(),
      estimatedMinutes: 60,
    };

    setTasks((prev) => [newTask, ...prev]);

    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, importedAsTaskId: newTask.id } : e))
    );

    const toast: ToastAlert = {
      id: `toast-${Date.now()}`,
      title: '✓ Added to Tasks',
      message: `Converted "${event.title}" into an action task for ${event.date}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
  };

  const handleAddCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEv]);
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Extract tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.tags) t.tags.forEach((tag) => set.add(tag));
    });
    return Array.from(set).sort();
  }, [tasks]);

  const categoryCounts = useMemo(() => {
    const counts: Record<Category | 'all', number> = {
      all: tasks.length,
      life: 0,
      work: 0,
      school: 0,
      finance: 0,
      career: 0,
      'family-social': 0,
      'side-hustle': 0,
      health: 0,
      'learning-skills': 0,
    };
    customCategories.forEach((c) => {
      counts[c.id] = 0;
    });
    tasks.forEach((t) => {
      if (counts[t.category] !== undefined) {
        counts[t.category]++;
      } else {
        counts[t.category] = 1;
      }
    });
    return counts;
  }, [tasks, customCategories]);

  const allGoals = useMemo(() => tasks.filter((t) => t.isGoal), [tasks]);

  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks
      .filter((t) => {
        // Tab View filtering: goals tab shows only goals, tasks tab shows action tasks
        if (activeView === 'goals') {
          if (!t.isGoal) return false;
        } else if (activeView === 'tasks') {
          if (t.isGoal) return false;
        }

        if (filter.search) {
          const q = filter.search.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q) || false;
          const matchNotes = t.notes?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchDesc && !matchNotes) return false;
        }

        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }

        if (filter.status === 'pending' && t.status !== 'pending') return false;
        if (filter.status === 'completed' && t.status !== 'completed') return false;
        if (filter.status === 'overdue') {
          if (t.status === 'completed' || t.dueDate >= todayStr) return false;
        }

        if (filter.tags.length > 0) {
          const hasAllTags = filter.tags.every((tag) => t.tags?.includes(tag));
          if (!hasAllTags) return false;
        }

        if (filter.frequency !== 'all' && t.frequency !== filter.frequency) {
          return false;
        }

        if (filter.goalFilter && filter.goalFilter !== 'all') {
          if (filter.goalFilter === 'goals-only') {
            if (!t.isGoal) return false;
          } else if (filter.goalFilter === 'tasks-only') {
            if (t.isGoal || t.goalId) return false;
          } else {
            if (t.id !== filter.goalFilter && t.goalId !== filter.goalFilter) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'dueDate') {
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (filter.sortBy === 'priority') {
          const pRank: Record<string, number> = { urgent: 0, important: 1, normal: 2, low: 3 };
          return (pRank[a.priority] ?? 2) - (pRank[b.priority] ?? 2);
        }
        if (filter.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (filter.sortBy === 'createdAt') {
          return b.createdAt.localeCompare(a.createdAt);
        }
        return 0;
      });
  }, [tasks, selectedCategory, filter, activeView]);

  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayCount = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt.split('T')[0] === todayStr
  ).length;

  const handleToggleTag = (tag: string) => {
    const isSelected = filter.tags.includes(tag);
    const newTags = isSelected ? filter.tags.filter((t) => t !== tag) : [...filter.tags, tag];
    setFilter({ ...filter, tags: newTags });
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <div className="hidden md:block h-full">
        <SidebarNav
          activeView={activeView}
          onSelectView={setActiveView}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          availableTags={availableTags}
          selectedTags={filter.tags}
          onToggleTag={handleToggleTag}
          completedTasksCount={completedTodayCount}
          totalTasksCount={tasks.filter((t) => !t.isGoal).length}
          goalsCount={tasks.filter((t) => t.isGoal).length}
          pushActive={notificationSettings.enabled && notificationSettings.permissionStatus === 'granted'}
          customCategories={customCategories}
          removedDefaultCategoryIds={removedDefaultCategoryIds}
          onAddCustomCategory={handleAddCustomCategory}
          onRemoveCategory={handleRemoveCategory}
          onRestoreDefaultCategories={handleRestoreDefaultCategories}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setIsSidebarOpenMobile(false)}
          />
          <div className="relative z-10 w-64 bg-slate-900 h-full">
            <button
              onClick={() => setIsSidebarOpenMobile(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarNav
              activeView={activeView}
              onSelectView={(v) => {
                setActiveView(v);
                setIsSidebarOpenMobile(false);
              }}
              selectedCategory={selectedCategory}
              onSelectCategory={(c) => {
                setSelectedCategory(c);
                setIsSidebarOpenMobile(false);
              }}
              categoryCounts={categoryCounts}
              availableTags={availableTags}
              selectedTags={filter.tags}
              onToggleTag={handleToggleTag}
              completedTasksCount={completedTodayCount}
              totalTasksCount={tasks.filter((t) => !t.isGoal).length}
              goalsCount={tasks.filter((t) => t.isGoal).length}
              pushActive={notificationSettings.enabled && notificationSettings.permissionStatus === 'granted'}
              customCategories={customCategories}
              removedDefaultCategoryIds={removedDefaultCategoryIds}
              onAddCustomCategory={handleAddCustomCategory}
              onRemoveCategory={handleRemoveCategory}
              onRestoreDefaultCategories={handleRestoreDefaultCategories}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          notificationSettings={notificationSettings}
          onUpdateNotificationSettings={setNotificationSettings}
          userProfile={userProfile}
          onUpdateUserProfile={handleUpdateUserProfile}
          onSendTestNotification={handleSendTestNotification}
          onOpenNewTaskModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          onOpenCalendarModal={() => setActiveView('calendar')}
          onOpenAnalytics={() => setActiveView('analytics')}
          onOpenAskCoach={() => setIsAskCoachOpen(true)}
          activeView={activeView}
          onSelectView={setActiveView}
          pendingCount={tasks.filter((t) => t.status === 'pending').length}
          completedTodayCount={completedTodayCount}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        />

        {/* View Mode Content Render */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Top Horizontal Category Tabs */}
          <CategoryTabs
            activeView={activeView}
            onSelectView={setActiveView}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
            customCategories={customCategories}
            removedDefaultCategoryIds={removedDefaultCategoryIds}
            onAddCustomCategory={handleAddCustomCategory}
            onRemoveCategory={handleRemoveCategory}
            onRestoreDefaultCategories={handleRestoreDefaultCategories}
          />
          
          {/* Compact Metric Ribbon (Rebalanced Analytics Header) */}
          {(activeView === 'goals' || activeView === 'tasks') && (
            <CompactMetricRibbon
              tasks={tasks}
              routines={routines}
              onOpenFullAnalytics={() => setActiveView('analytics')}
            />
          )}
          
          {/* VIEW 1: DEDICATED GOALS & PROJECTS BOARD */}
          {activeView === 'goals' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-5">
              
              {/* Category Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {selectedCategory === 'all'
                        ? 'Goals & Projects'
                        : `${getCategoryLabel(
                            selectedCategory,
                            customCategories.map((c) => ({ id: c.id, label: c.label, color: c.color || 'indigo' }))
                          )} Goals & Projects`}
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'goal' : 'goals'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Track high-level objectives, project milestones, and overall accomplishment progress.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsAskCoachOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                    <span>Ask Coach</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingTask({ isGoal: true } as Task);
                      setIsTaskModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Goal / Project</span>
                  </button>
                </div>
              </div>

              {/* Proactive Copilot Cards */}
              <ProactiveCopilotCards
                tasks={tasks}
                onBreakTaskIntoSubtasks={handleBreakTaskIntoSubtasks}
                onRescheduleOverbookedTasks={handleRescheduleOverbookedTasks}
                onAddStepToStalledGoal={handleAddStepToStalledGoal}
              />

              {/* Task Filter Bar */}
              <TaskFilterBar
                filter={filter}
                onFilterChange={setFilter}
                availableTags={availableTags}
                totalTaskCount={tasks.filter((t) => t.isGoal).length}
                filteredTaskCount={filteredTasks.length}
                onDeleteTagGlobally={handleDeleteTagGlobally}
              />

              {/* Goals List */}
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredTasks.map((task) => {
                      const childTasks = tasks.filter((child) => child.goalId === task.id);
                      const completedChildTasks = childTasks.filter((child) => child.status === 'completed');

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onEditTask={(t) => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDeleteTask={handleDeleteTask}
                          onDuplicateTask={handleDuplicateTask}
                          onToggleSubtask={handleToggleSubtask}
                          onAddSubtask={handleAddSubtaskToTask}
                          onDeleteSubtask={handleDeleteSubtaskFromTask}
                          onOpenGoal={handleOpenGoalModal}
                          onRemoveTag={handleRemoveTagFromTask}
                          childTasksCount={childTasks.length}
                          completedChildTasksCount={completedChildTasks.length}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto shadow-inner shadow-teal-500/20">
                    <Sparkles className="w-7 h-7 text-teal-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">
                      No active goals in {selectedCategory === 'all' ? 'this view' : getCategoryLabel(selectedCategory, customCategories.map((c) => ({ id: c.id, label: c.label, color: c.color || 'indigo' })))}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Tap <strong className="text-emerald-400 font-semibold">+ Add Goal</strong> or use <strong className="text-teal-400 font-semibold">Ask Coach</strong> to auto-generate your schedule with natural language.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => setIsAskCoachOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-teal-200" />
                      <span>Use Ask Coach AI</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask({ isGoal: true } as Task);
                        setIsTaskModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Goal Target</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW 2: DEDICATED ACTION TASKS BOARD */}
          {activeView === 'tasks' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-5">
              
              {/* Category Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {selectedCategory === 'all'
                        ? 'Action Tasks'
                        : `${getCategoryLabel(
                            selectedCategory,
                            customCategories.map((c) => ({ id: c.id, label: c.label, color: c.color || 'indigo' }))
                          )} Action Tasks`}
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage actionable steps, to-dos, and specific action items linked to your goals.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsAskCoachOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                    <span>Ask Coach</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Action Task</span>
                  </button>
                </div>
              </div>

              {/* Proactive Copilot Cards */}
              <ProactiveCopilotCards
                tasks={tasks}
                onBreakTaskIntoSubtasks={handleBreakTaskIntoSubtasks}
                onRescheduleOverbookedTasks={handleRescheduleOverbookedTasks}
                onAddStepToStalledGoal={handleAddStepToStalledGoal}
              />

              {/* Task Filter Bar */}
              <TaskFilterBar
                filter={filter}
                onFilterChange={setFilter}
                availableTags={availableTags}
                totalTaskCount={tasks.filter((t) => !t.isGoal).length}
                filteredTaskCount={filteredTasks.length}
                onDeleteTagGlobally={handleDeleteTagGlobally}
              />

              {/* Task Cards List */}
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredTasks.map((task) => {
                      const childTasks = tasks.filter((child) => child.goalId === task.id);
                      const completedChildTasks = childTasks.filter((child) => child.status === 'completed');

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onEditTask={(t) => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDeleteTask={handleDeleteTask}
                          onDuplicateTask={handleDuplicateTask}
                          onToggleSubtask={handleToggleSubtask}
                          onAddSubtask={handleAddSubtaskToTask}
                          onDeleteSubtask={handleDeleteSubtaskFromTask}
                          onOpenGoal={handleOpenGoalModal}
                          onRemoveTag={handleRemoveTagFromTask}
                          childTasksCount={childTasks.length}
                          completedChildTasksCount={completedChildTasks.length}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner shadow-indigo-500/20">
                    <Sparkles className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">
                      No active tasks in {selectedCategory === 'all' ? 'this view' : getCategoryLabel(selectedCategory, customCategories.map((c) => ({ id: c.id, label: c.label, color: c.color || 'indigo' })))}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Tap <strong className="text-indigo-400 font-semibold">+ Add Action Task</strong> or use <strong className="text-teal-400 font-semibold">Ask Coach</strong> to auto-generate your schedule with natural language.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => setIsAskCoachOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-teal-200" />
                      <span>Use Ask Coach AI</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="px-4 py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Action Task</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW 2: ROUTINE TRACKER */}
          {activeView === 'routines' && (
            <RoutineTracker
              routines={routines}
              onToggleRoutineItem={handleToggleRoutineItem}
              onAddRoutineItem={handleAddRoutineItem}
              onEditRoutineItem={handleEditRoutineItem}
              onDeleteRoutineItem={handleDeleteRoutineItem}
              onResetTodayRoutine={handleResetTodayRoutine}
            />
          )}

          {/* VIEW 3: CALENDAR SYNC */}
          {activeView === 'calendar' && (
            <CalendarSyncModal
              events={calendarEvents}
              onSyncEventToTask={handleSyncEventToTask}
              onAddCalendarEvent={handleAddCalendarEvent}
              onDeleteCalendarEvent={handleDeleteCalendarEvent}
              customCategories={customCategories}
              onAddCustomCategory={handleAddCustomCategory}
            />
          )}

          {/* VIEW 4: PROGRESS & ANALYTICS */}
          {activeView === 'analytics' && (
            <ProgressAnalytics tasks={tasks} routines={routines} customCategories={customCategories} />
          )}

        </div>

      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        initialTask={editingTask}
        defaultCategory={selectedCategory}
        customCategories={customCategories}
        removedDefaultCategoryIds={removedDefaultCategoryIds}
        onAddCustomCategory={handleAddCustomCategory}
        allGoals={allGoals}
      />

      {/* Goal Detail View Modal */}
      <GoalDetailModal
        goal={selectedGoalForModal}
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoalForModal(null);
        }}
        allTasks={tasks}
        onToggleComplete={handleToggleComplete}
        onAddChildTask={handleAddChildTaskToGoal}
        onDeleteTask={handleDeleteTask}
        onEditTask={(t) => {
          setIsGoalModalOpen(false);
          setEditingTask(t);
          setIsTaskModalOpen(true);
        }}
      />

      {/* AI Coach Overlay Modal */}
      <AskCoachModal
        isOpen={isAskCoachOpen}
        onClose={() => setIsAskCoachOpen(false)}
        existingRoutines={routines}
        onApplyPlan={handleApplyCoachPlan}
      />

      {/* Floating Push Notification Toasts */}
      <NotificationToast
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

      {/* Floating Actions: Global "Ask Coach" Pill + Mobile FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Global Floating "Ask Coach" Pill Button */}
        <button
          onClick={() => setIsAskCoachOpen(true)}
          className="px-4 py-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-xs rounded-full shadow-2xl shadow-teal-500/30 border border-teal-300/30 flex items-center gap-2.5 transition transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4.5 h-4.5 text-teal-200 animate-pulse" />
          <span className="tracking-tight">Ask Coach</span>
        </button>

        {/* Mobile Quick Add FAB */}
        <button
          onClick={() => {
            setEditingTask(activeView === 'goals' ? ({ isGoal: true } as Task) : null);
            setIsTaskModalOpen(true);
          }}
          className="md:hidden w-12 h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-90 text-white rounded-full shadow-2xl shadow-indigo-600/60 flex items-center justify-center border border-indigo-400/40 transition-all duration-200"
          title={activeView === 'goals' ? 'Add New Goal Target' : 'Add New Action Task'}
          aria-label="Quick Add Task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
}

