import { Task } from '../types';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof Notification === 'undefined') {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a pleasant double chime
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.log('Audio playback prevented by browser policy:', err);
  }
};

export const sendPushNotification = (
  title: string,
  options?: { body?: string; icon?: string; tag?: string; playSound?: boolean }
) => {
  if (options?.playSound !== false) {
    playNotificationSound();
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options?.body || 'Task & Routine Reminder',
        icon: '/favicon.ico',
        tag: options?.tag || 'task-tracker-notification',
      });
    } catch (err) {
      console.warn('Native notification failed:', err);
    }
  }
};

export const checkTasksForDeadlines = (
  tasks: Task[],
  onTriggerNotification: (title: string, message: string, taskId: string) => void
) => {
  const now = new Date();
  const nowFormattedDate = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  tasks.forEach((task) => {
    if (task.status === 'completed' || !task.dueTime || task.dueDate !== nowFormattedDate) {
      return;
    }

    const [hrs, mins] = task.dueTime.split(':').map(Number);
    const taskMinutes = hrs * 60 + mins;
    const diff = taskMinutes - currentMinutes;

    const leadTime = task.reminderMinutesBefore || 15;

    // Trigger notification if deadline is approaching within lead time (and not past by > 1 minute)
    if (diff >= 0 && diff <= leadTime) {
      const timeStr = task.dueTime;
      const message = `"${task.title}" is due at ${timeStr} (${diff === 0 ? 'Due right now!' : `in ${diff} min`})`;
      onTriggerNotification(`⏰ Deadline Reminder: ${task.category.toUpperCase()}`, message, task.id);
    }
  });
};
