import { Task, RoutineItem, CalendarEvent } from '../types';

// Helper to format YYYY-MM-DD relative to today
const getRelativeDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  // --- GOAL 1: Business Project Proposal ---
  {
    id: 'goal-proposal',
    title: 'Complete Quarterly Project Plan by September 30th',
    description: 'Business goal to research, write, and submit the quarterly product roadmap and strategic plan.',
    category: 'work',
    status: 'pending',
    priority: 'urgent',
    tags: ['goal', 'project', 'important', 'work', 'meetings'],
    frequency: 'one-time',
    dueDate: getRelativeDate(30),
    dueTime: '17:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 300,
    notes: 'Key business milestone requiring leadership review',
    isGoal: true,
    subtasks: [
      { id: 'st-1', title: 'Draft executive summary & scope', completed: true },
      { id: 'st-2', title: 'Compile resource requirements', completed: false }
    ],
    reminderMinutesBefore: 60
  },
  {
    id: 'task-p1',
    title: 'Write background section',
    description: 'Summarize problem context, business goals, and project scope.',
    category: 'work',
    status: 'completed',
    priority: 'urgent',
    tags: ['writing', 'work', 'project'],
    frequency: 'one-time',
    dueDate: getRelativeDate(1),
    dueTime: '12:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 90,
    goalId: 'goal-proposal',
    goalTitle: 'Complete Quarterly Project Plan by September 30th'
  },
  {
    id: 'task-p2',
    title: 'Review client feedback & requirements',
    description: 'Annotate key priorities and feature requests from client notes.',
    category: 'work',
    status: 'completed',
    priority: 'important',
    tags: ['clients', 'reading'],
    frequency: 'one-time',
    dueDate: getRelativeDate(2),
    dueTime: '15:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 45,
    goalId: 'goal-proposal',
    goalTitle: 'Complete Quarterly Project Plan by September 30th'
  },
  {
    id: 'task-p3',
    title: 'Email stakeholders on project plan draft',
    description: 'Send draft roadmap to management team and request feedback meeting.',
    category: 'work',
    status: 'pending',
    priority: 'urgent',
    tags: ['meetings', 'work'],
    frequency: 'one-time',
    dueDate: getRelativeDate(3),
    dueTime: '10:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 20,
    goalId: 'goal-proposal',
    goalTitle: 'Complete Quarterly Project Plan by September 30th'
  },
  {
    id: 'task-p4',
    title: 'Review industry benchmark reports',
    description: 'Synthesize recent market analysis reports for strategic alignment.',
    category: 'work',
    status: 'pending',
    priority: 'important',
    tags: ['deep-work', 'work'],
    frequency: 'one-time',
    dueDate: getRelativeDate(5),
    dueTime: '16:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 120,
    goalId: 'goal-proposal',
    goalTitle: 'Complete Quarterly Project Plan by September 30th'
  },

  // --- GOAL 2: Leadership Skills ---
  {
    id: 'goal-ml',
    title: 'Master Professional Leadership & Management Skills',
    description: 'Comprehensive goal to master core project management principles, team communication, and strategic planning.',
    category: 'learning-skills',
    status: 'pending',
    priority: 'important',
    tags: ['goal', 'upskilling', 'career', 'work'],
    frequency: 'one-time',
    dueDate: getRelativeDate(45),
    dueTime: '18:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 600,
    isGoal: true,
    reminderMinutesBefore: 30
  },
  {
    id: 'task-ml1',
    title: 'Review project management fundamentals',
    description: 'Study agile frameworks, sprint planning, and team allocation.',
    category: 'learning-skills',
    status: 'pending',
    priority: 'important',
    tags: ['deep-work', 'career'],
    frequency: 'weekly',
    dueDate: getRelativeDate(2),
    dueTime: '14:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 60,
    goalId: 'goal-ml',
    goalTitle: 'Master Professional Leadership & Management Skills'
  },
  {
    id: 'task-ml2',
    title: 'Complete online leadership certification module',
    description: 'Watch video modules and complete case study exercises.',
    category: 'learning-skills',
    status: 'pending',
    priority: 'normal',
    tags: ['career', 'personal'],
    frequency: 'one-time',
    dueDate: getRelativeDate(7),
    dueTime: '17:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 180,
    goalId: 'goal-ml',
    goalTitle: 'Master Professional Leadership & Management Skills'
  },

  // --- GOAL 3: Finance Goal ---
  {
    id: 'goal-finance',
    title: 'Q3 Financial Audit & Wealth Management Plan',
    description: 'Overarching finance goal to audit recurring expenses, reconcile taxes, and balance portfolio.',
    category: 'finance',
    status: 'pending',
    priority: 'urgent',
    tags: ['goal', 'finance', 'project'],
    frequency: 'one-time',
    dueDate: getRelativeDate(15),
    dueTime: '18:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 180,
    isGoal: true,
    reminderMinutesBefore: 60
  },
  {
    id: 'task-f1',
    title: 'Monthly Budget Audit & Investment Allocation',
    description: 'Update finance tracker, reconcile subscriptions, and allocate savings.',
    category: 'finance',
    status: 'pending',
    priority: 'important',
    tags: ['finance', 'personal'],
    frequency: 'monthly',
    dueDate: getRelativeDate(2),
    dueTime: '18:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 30,
    goalId: 'goal-finance',
    goalTitle: 'Q3 Financial Audit & Wealth Management Plan'
  },
  {
    id: 'task-f2',
    title: 'Quarterly Financial Statements & Tax Reconciliation',
    description: 'Gather invoices, verify expense receipts, and summarize quarterly income statements.',
    category: 'finance',
    status: 'pending',
    priority: 'urgent',
    tags: ['finance', 'urgent'],
    frequency: 'monthly',
    dueDate: getRelativeDate(1),
    dueTime: '16:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 40,
    goalId: 'goal-finance',
    goalTitle: 'Q3 Financial Audit & Wealth Management Plan'
  },

  // --- INDEPENDENT STANDALONE TASKS ---
  {
    id: 'task-1',
    title: 'Review System Architecture & Microservices Plan',
    description: 'Analyze system scalability, caching layer strategy, and API response benchmarks.',
    category: 'work',
    status: 'pending',
    priority: 'urgent',
    tags: ['work', 'deep-work', 'project'],
    frequency: 'daily',
    dueDate: getRelativeDate(0),
    dueTime: '11:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 60,
    notes: 'Focus on caching strategies and payload optimization',
    reminderMinutesBefore: 15
  },
  {
    id: 'task-2',
    title: 'Sprint Backlog Refactoring & Code Review',
    description: 'Check pending pull requests, run integration tests, and update documentation.',
    category: 'career',
    status: 'pending',
    priority: 'important',
    tags: ['work', 'deep-work'],
    frequency: 'weekly',
    dueDate: getRelativeDate(0),
    dueTime: '14:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 45,
    reminderMinutesBefore: 30
  },
  {
    id: 'task-5',
    title: 'Hydration & Evening Posture Mobility Stretch',
    description: 'Follow lower back, shoulder, and leg mobility stretching routine.',
    category: 'life',
    status: 'completed',
    priority: 'normal',
    tags: ['health', 'personal'],
    frequency: 'daily',
    dueDate: getRelativeDate(0),
    dueTime: '20:30',
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    estimatedMinutes: 30
  },
  {
    id: 'task-7',
    title: 'Weekly Meal Prep & Wellness Plan',
    description: 'Prepare high-protein meal bowls and organize healthy snacks for productive workdays.',
    category: 'life',
    status: 'pending',
    priority: 'normal',
    tags: ['health', 'personal'],
    frequency: 'weekly',
    dueDate: getRelativeDate(4),
    dueTime: '12:00',
    createdAt: new Date().toISOString(),
    estimatedMinutes: 120
  }
];

export const INITIAL_ROUTINE_ITEMS: RoutineItem[] = [
  // Morning Routine
  {
    id: 'm-1',
    routineType: 'morning',
    timeSlot: '05:00 AM',
    title: 'Wake up & drink 500ml water',
    details: 'Immediate rehydration and light natural light exposure.',
    completedDates: [getRelativeDate(0)],
    order: 1
  },
  {
    id: 'm-2',
    routineType: 'morning',
    timeSlot: '05:00 AM - 05:20 AM',
    title: 'Morning stretch & full-body mobility',
    details: '20 minutes hip flexor, hamstring release & spine activation.',
    completedDates: [getRelativeDate(0)],
    order: 2
  },
  {
    id: 'm-3',
    routineType: 'morning',
    timeSlot: '05:20 AM',
    title: 'Refreshing shower & morning prep',
    details: 'Cold finish for alertness and focus preparation.',
    completedDates: [getRelativeDate(0)],
    order: 3
  },
  {
    id: 'm-4',
    routineType: 'morning',
    timeSlot: '05:30 AM - 07:30 AM',
    title: 'Focus & Deep Work Block',
    details: 'Core project execution, planning, and high-priority tasks.',
    completedDates: [],
    order: 4
  },
  {
    id: 'm-5',
    routineType: 'morning',
    timeSlot: '07:30 AM',
    title: 'Morning Commute / Transit',
    details: 'Listen to podcasts or industry news.',
    completedDates: [],
    order: 5
  },

  // Evening Routine
  {
    id: 'e-1',
    routineType: 'evening',
    timeSlot: '07:00 PM',
    title: 'Daily progress review & tomorrow planning',
    details: 'Check off completed items, review calendar, set 3 top priorities for tomorrow.',
    completedDates: [],
    order: 1
  },
  {
    id: 'e-2',
    routineType: 'evening',
    timeSlot: '07:30 PM',
    title: 'Nutritious dinner & family unwind',
    details: 'Mindful eating, step away from work screens.',
    completedDates: [],
    order: 2
  },
  {
    id: 'e-3',
    routineType: 'evening',
    timeSlot: '08:30 PM - 09:15 PM',
    title: 'Skill acquisition / Technical reading',
    details: 'Read 30-45 mins of technology, leadership, or personal development literature.',
    completedDates: [],
    order: 3
  },
  {
    id: 'e-4',
    routineType: 'evening',
    timeSlot: '09:30 PM',
    title: 'Digital detox & bedtime stretch',
    details: 'Dim lights, blue-light block, prepare gear for early wake-up.',
    completedDates: [],
    order: 4
  },
  {
    id: 'e-5',
    routineType: 'evening',
    timeSlot: '10:00 PM',
    title: 'In bed for restful sleep',
    details: 'Targeting 7 hours of uninterrupted quality sleep.',
    completedDates: [],
    order: 5
  },

  // Weekend Routine
  {
    id: 'w-1',
    routineType: 'weekend',
    timeSlot: '06:30 AM',
    title: 'Gentle weekend wake up',
    details: 'Hydrate and light morning hydration breathwork.',
    completedDates: [],
    order: 1
  },
  {
    id: 'w-2',
    routineType: 'weekend',
    timeSlot: '07:00 AM - 08:30 AM',
    title: 'Extended outdoor run or gym session',
    details: 'Zone 2 cardio or strength training.',
    completedDates: [],
    order: 2
  },
  {
    id: 'w-3',
    routineType: 'weekend',
    timeSlot: '09:00 AM',
    title: 'Healthy breakfast & weekly reflection',
    details: 'Write down weekly achievements and big picture long-term goals.',
    completedDates: [],
    order: 3
  },
  {
    id: 'w-4',
    routineType: 'weekend',
    timeSlot: '10:00 AM - 01:00 PM',
    title: 'Side Projects & Creative Focus',
    details: 'Skill building, writing, or personal project development.',
    completedDates: [],
    order: 4
  },
  {
    id: 'w-5',
    routineType: 'weekend',
    timeSlot: '01:00 PM - 03:00 PM',
    title: 'Meal prep & weekly organization',
    details: 'Grocery run, workspace setup, and digital desktop cleanup.',
    completedDates: [],
    order: 5
  },
  {
    id: 'w-6',
    routineType: 'weekend',
    timeSlot: '04:00 PM - 08:00 PM',
    title: 'Social time, hobbies & rest',
    details: 'Unplugged quality time with family and friends.',
    completedDates: [],
    order: 6
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Client Brainstorming & Strategy Session',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    date: getRelativeDate(0),
    category: 'work',
    location: 'Conference Room 302 & Zoom',
    description: 'Brainstorm strategic initiatives, client requirements, and project roadmap.'
  },
  {
    id: 'cal-2',
    title: 'Quarterly Management Review Meeting',
    startTime: '02:00 PM',
    endTime: '02:45 PM',
    date: getRelativeDate(1),
    category: 'career',
    location: 'Google Meet',
    description: 'Review team performance metrics and Q3 strategic priorities.'
  },
  {
    id: 'cal-3',
    title: 'Financial Planning & Advisory Call',
    startTime: '04:00 PM',
    endTime: '04:30 PM',
    date: getRelativeDate(2),
    category: 'finance',
    location: 'Phone Call',
    description: 'Discuss quarterly budget allocations and financial goals.'
  },
  {
    id: 'cal-4',
    title: 'Weekly Team Standup & Sprint Review',
    startTime: '09:30 AM',
    endTime: '10:00 AM',
    date: getRelativeDate(0),
    category: 'work',
    location: 'Slack Huddle',
    description: 'Present progress updates, sync on deliverables, and resolve blockers.'
  }
];
