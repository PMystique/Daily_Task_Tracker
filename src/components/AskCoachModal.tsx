import React, { useState } from 'react';
import { Sparkles, Target, CheckSquare, Sunrise, ArrowRight, Loader2, X, Zap, Lightbulb, Edit3, PlusCircle, Clock, Calendar } from 'lucide-react';
import { Task, RoutineItem, Category, Priority, RoutineType, RoutineFrequency, DayOfWeek } from '../types';
import { parseDaysFromText } from '../utils/routineUtils';

export interface RoutineEditUpdate {
  id?: string;
  titleToMatch?: string;
  newTimeSlot?: string;
  newTitle?: string;
  newDetails?: string;
  routineType?: RoutineType;
  frequency?: RoutineFrequency;
  specificDays?: DayOfWeek[];
  isTimeBlock?: boolean;
}

export interface ActionItem {
  actionType: 'CREATE_GOAL' | 'CREATE_ROUTINE' | 'EDIT_ROUTINE';
  goal?: {
    title: string;
    category: Category;
    description: string;
    priority: Priority;
    targetDueDate: string;
    tags: string[];
  };
  tasks?: Array<{
    title: string;
    category?: Category;
    priority: Priority;
    estimatedMinutes: number;
    dueDate: string;
    tags?: string[];
  }>;
  routineToCreate?: {
    title: string;
    details?: string;
    timeSlot: string;
    routineType: RoutineType;
    frequency?: RoutineFrequency;
    specificDays?: DayOfWeek[];
    isTimeBlock?: boolean;
  };
  routineToEdit?: RoutineEditUpdate;
}

export interface CoachResult {
  actionType: 'CREATE_GOAL' | 'CREATE_ROUTINE' | 'EDIT_ROUTINE' | 'MULTI_ACTION';
  actions?: ActionItem[];
  goal?: {
    title: string;
    category: Category;
    description: string;
    priority: Priority;
    targetDueDate: string;
    tags: string[];
  };
  tasks?: Array<{
    title: string;
    category?: Category;
    priority: Priority;
    estimatedMinutes: number;
    dueDate: string;
    tags?: string[];
  }>;
  routinesToCreate?: Array<{
    title: string;
    details?: string;
    timeSlot: string;
    routineType: RoutineType;
    frequency?: RoutineFrequency;
    specificDays?: DayOfWeek[];
    isTimeBlock?: boolean;
  }>;
  routinesToEdit?: RoutineEditUpdate[];
}

interface AskCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRoutines?: RoutineItem[];
  onApplyPlan: (
    newGoal?: Task | null,
    newTasks?: Task[],
    newRoutines?: RoutineItem[],
    routineEdits?: RoutineEditUpdate[]
  ) => void;
}

const cleanTag = (rawTag: string): string => {
  if (typeof rawTag !== 'string') return '';
  let cleaned = rawTag
    .replace(/^["'\[`]+|["'\]`]+$/g, '')
    .replace(/^#+/, '')
    .replace(/:[a-zA-Z0-9_-]+:/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toUpperCase();
  if (!cleaned) return '';
  cleaned = cleaned.replace(/\s+/g, '-');
  return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
};

const sanitizeTags = (tags: any): string[] => {
  if (!tags) return [];
  const rawList = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
    ? tags.split(/[\s,]+/)
    : [];

  return rawList
    .flatMap((t) => (typeof t === 'string' ? t.split(/[\s,]+/) : []))
    .map(cleanTag)
    .filter((t) => t.length > 1);
};

export const AskCoachModal: React.FC<AskCoachModalProps> = ({
  isOpen,
  onClose,
  existingRoutines = [],
  onApplyPlan,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<CoachResult | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    '⚡ Change Wake up to 06:00 AM, add Leave Home at 07:30 AM, and Block 09:00 AM - 02:00 PM for focused deep work',
    '💼 Prepare for upcoming client pitch and organize project deliverables',
    '✏️ Edit my Morning Wake up routine step to 05:30 AM with cold shower',
    '🏃 Train for a 10k run and build a consistent workout routine',
  ];

  const handleGenerate = async (queryText?: string) => {
    const textToSubmit = queryText || prompt;
    if (!textToSubmit.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedPlan(null);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSubmit,
          existingRoutines: existingRoutines.map((r) => ({
            id: r.id,
            routineType: r.routineType,
            timeSlot: r.timeSlot,
            title: r.title,
            details: r.details,
            frequency: r.frequency,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Coach server error (${response.status})`);
      }

      const data: CoachResult = await response.json();

      let actionsList: ActionItem[] = [];
      if (data.actions && Array.isArray(data.actions)) {
        actionsList = data.actions.map((act) => ({
          actionType: act.actionType || (act.routineToEdit ? 'EDIT_ROUTINE' : act.routineToCreate ? 'CREATE_ROUTINE' : 'CREATE_GOAL'),
          goal: act.goal ? { ...act.goal, tags: sanitizeTags(act.goal.tags) } : undefined,
          tasks: act.tasks ? act.tasks.map((t) => ({ ...t, tags: sanitizeTags(t.tags) })) : undefined,
          routineToCreate: act.routineToCreate,
          routineToEdit: act.routineToEdit,
        }));
      }

      const routinesToCreate = [
        ...(data.routinesToCreate || []),
        ...actionsList.filter((a) => a.routineToCreate).map((a) => a.routineToCreate!),
      ];

      const routinesToEdit = [
        ...(data.routinesToEdit || []),
        ...actionsList.filter((a) => a.routineToEdit).map((a) => a.routineToEdit!),
      ];

      if (actionsList.length === 0) {
        if (data.goal) {
          actionsList.push({
            actionType: 'CREATE_GOAL',
            goal: data.goal,
            tasks: data.tasks,
          });
        }
        routinesToCreate.forEach((rc) => {
          actionsList.push({
            actionType: 'CREATE_ROUTINE',
            routineToCreate: rc,
          });
        });
        routinesToEdit.forEach((re) => {
          actionsList.push({
            actionType: 'EDIT_ROUTINE',
            routineToEdit: re,
          });
        });
      }

      const sanitizedData: CoachResult = {
        actionType: data.actionType || (actionsList.length > 1 ? 'MULTI_ACTION' : 'CREATE_GOAL'),
        actions: actionsList,
        goal: data.goal
          ? {
              ...data.goal,
              tags: sanitizeTags(data.goal.tags),
            }
          : undefined,
        tasks: data.tasks
          ? data.tasks.map((t) => ({
              ...t,
              tags: sanitizeTags(t.tags),
            }))
          : [],
        routinesToCreate,
        routinesToEdit,
      };
      setGeneratedPlan(sanitizedData);
    } catch (err: any) {
      console.warn('Backend API /api/coach failed or offline, executing smart client-side parser:', err);

      const queryLower = textToSubmit.toLowerCase();
      const today = new Date();
      const decDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const isGoalIntent = queryLower.includes('pitch') || queryLower.includes('client') || queryLower.includes('10k') || queryLower.includes('run') || queryLower.includes('project deliverables');

      if (!isGoalIntent) {
        // Multi-action clause parsing
        const clauses = textToSubmit
          .split(/(?:,|;|\band\b|\balso\b|\bplus\b|\n)+/i)
          .map((s) => s.trim())
          .filter((s) => s.length > 2);

        const fallbackActions: ActionItem[] = [];
        const fallbackToCreate: Array<{ title: string; details?: string; timeSlot: string; routineType: RoutineType; frequency?: RoutineFrequency; specificDays?: DayOfWeek[]; isTimeBlock?: boolean }> = [];
        const fallbackToEdit: RoutineEditUpdate[] = [];

        clauses.forEach((clause) => {
          const clauseLower = clause.toLowerCase();

          // Extract time slot
          const timeMatch = clause.match(/\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?)\b/i);
          let extractedTime = timeMatch ? timeMatch[1].toUpperCase() : '';

          if (extractedTime && !extractedTime.includes(':') && !extractedTime.includes('-')) {
            const num = parseInt(extractedTime, 10);
            if (!isNaN(num) && num <= 24) {
              const isPm = clauseLower.includes('pm') || num >= 12;
              const hour = num > 12 ? num - 12 : num === 0 ? 12 : num;
              extractedTime = `${hour < 10 ? '0' : ''}${hour}:00 ${isPm ? 'PM' : 'AM'}`;
            }
          }

          const parsedSpecificDays = parseDaysFromText(clause);
          const isTimeBlock = extractedTime.includes('-') || clauseLower.includes('block') || clauseLower.includes('time block');

          const freq: RoutineFrequency = clauseLower.includes('weekend')
            ? 'weekends'
            : clauseLower.includes('weekday')
            ? 'weekdays'
            : parsedSpecificDays.length > 0
            ? 'weekdays'
            : 'weekends';

          // Match existing routine
          const matchedRoutine = existingRoutines.find((r) => {
            const rTitle = r.title.toLowerCase();
            const rWords = rTitle.split(/\s+/).filter((w) => w.length > 2);
            return (
              clauseLower.includes(rTitle) ||
              rWords.some((w) => clauseLower.includes(w)) ||
              (clauseLower.includes('wake') && rTitle.includes('wake')) ||
              (clauseLower.includes('morning') && r.routineType === 'morning' && (clauseLower.includes('edit') || clauseLower.includes('change')))
            );
          });

          const isEditKeywords =
            clauseLower.includes('edit') ||
            clauseLower.includes('change') ||
            clauseLower.includes('update') ||
            clauseLower.includes('modify') ||
            clauseLower.includes('adjust') ||
            clauseLower.includes('shift');

          if (matchedRoutine || (isEditKeywords && existingRoutines.length > 0)) {
            const target = matchedRoutine || existingRoutines[0];
            const editObj: RoutineEditUpdate = {
              id: target.id,
              titleToMatch: target.title,
              newTimeSlot: extractedTime || target.timeSlot,
              newTitle: target.title,
              newDetails: clause,
              routineType: target.routineType,
              frequency: freq,
              specificDays: parsedSpecificDays.length > 0 ? parsedSpecificDays : target.specificDays,
              isTimeBlock: isTimeBlock,
            };
            fallbackToEdit.push(editObj);
            fallbackActions.push({
              actionType: 'EDIT_ROUTINE',
              routineToEdit: editObj,
            });
          } else {
            // New routine creation
            const routineType: RoutineType = clauseLower.includes('evening')
              ? 'evening'
              : clauseLower.includes('weekend')
              ? 'weekend'
              : 'morning';

            let cleanTitle = clause
              .replace(/add\s+(a\s+)?(new\s+)?(routine\s+step|routine|step|block)?/i, '')
              .replace(/at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, '')
              .replace(/\bfor\b.*/i, '')
              .trim();

            if (!cleanTitle || cleanTitle.length < 3) {
              cleanTitle = clause;
            }

            const cleanTitleCap = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

            const alreadyInCreate = fallbackToCreate.find(
              (item) => item.title.toLowerCase().trim() === cleanTitleCap.toLowerCase().trim()
            );

            if (alreadyInCreate) {
              alreadyInCreate.timeSlot = extractedTime || alreadyInCreate.timeSlot;
              alreadyInCreate.specificDays = parsedSpecificDays.length > 0 ? parsedSpecificDays : alreadyInCreate.specificDays;
            } else {
              const createObj = {
                title: cleanTitleCap,
                details: clause,
                timeSlot: extractedTime || '07:30 AM',
                routineType: routineType,
                frequency: freq,
                specificDays: parsedSpecificDays.length > 0 ? parsedSpecificDays : undefined,
                isTimeBlock: isTimeBlock,
              };

              fallbackToCreate.push(createObj);
              fallbackActions.push({
                actionType: 'CREATE_ROUTINE',
                routineToCreate: createObj,
              });
            }
          }
        });

        const fallbackMultiPlan: CoachResult = {
          actionType: fallbackActions.length > 1 ? 'MULTI_ACTION' : fallbackActions[0]?.actionType || 'CREATE_ROUTINE',
          actions: fallbackActions,
          routinesToCreate: fallbackToCreate,
          routinesToEdit: fallbackToEdit,
        };
        setGeneratedPlan(fallbackMultiPlan);
      } else {
        // Goal creation fallback
        const isProject = queryLower.includes('pitch') || queryLower.includes('client');
        const isLaunch = queryLower.includes('mvp') || queryLower.includes('launch');

        const fallbackGoalTitle = isProject
          ? 'Prepare Client Pitch & Project Deliverables'
          : isLaunch
          ? 'Launch Side Project MVP'
          : textToSubmit.slice(0, 45) + (textToSubmit.length > 45 ? '...' : '');

        const fallbackGoalPlan: CoachResult = {
          actionType: 'CREATE_GOAL',
          goal: {
            title: fallbackGoalTitle,
            category: isProject ? 'work' : isLaunch ? 'side-hustle' : 'career',
            description: textToSubmit,
            priority: 'urgent',
            targetDueDate: decDate,
            tags: ['#WORK', '#DEEP-WORK', '#PROJECT'],
          },
          tasks: [
            {
              title: isProject ? 'Draft Executive Summary & Presentation Deck' : 'Define Core Project Scope & Requirements',
              priority: 'urgent',
              estimatedMinutes: 60,
              dueDate: nextWeek,
              tags: ['#WORK', '#DEEP-WORK'],
            },
            {
              title: isProject ? 'Review Deliverables with Team' : 'Build Primary Feature Prototype',
              priority: 'important',
              estimatedMinutes: 90,
              dueDate: nextWeek,
              tags: ['#PROJECT', '#MEETINGS'],
            },
            {
              title: 'Weekly Milestones Audit & Action Sync',
              priority: 'normal',
              estimatedMinutes: 30,
              dueDate: decDate,
              tags: ['#PROJECT'],
            },
          ],
          routinesToCreate: [
            {
              title: 'Deep Focus Morning Block',
              details: 'Dedicated undistracted morning block for core project work',
              timeSlot: '07:00 AM - 07:30 AM',
              routineType: 'morning',
              frequency: 'everyday',
            },
            {
              title: 'Evening Progress Log & Daily Review',
              details: 'Review completed items and set top priorities for tomorrow',
              timeSlot: '09:00 PM - 09:15 PM',
              routineType: 'evening',
              frequency: 'everyday',
            },
          ],
        };

        setGeneratedPlan(fallbackGoalPlan);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedPlan) return;

    const goalId = `goal-${Date.now()}`;
    const nowIso = new Date().toISOString();

    let createdGoal: Task | undefined = undefined;
    if (generatedPlan.goal) {
      createdGoal = {
        id: goalId,
        title: generatedPlan.goal.title,
        description: generatedPlan.goal.description,
        category: generatedPlan.goal.category,
        status: 'pending',
        priority: generatedPlan.goal.priority,
        tags: sanitizeTags(generatedPlan.goal.tags),
        frequency: 'monthly',
        dueDate: generatedPlan.goal.targetDueDate,
        createdAt: nowIso,
        isGoal: true,
        lastActivityDate: nowIso,
      };
    }

    const createdTasks: Task[] = (generatedPlan.tasks || []).map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      title: t.title,
      category: t.category || (createdGoal ? createdGoal.category : 'work'),
      status: 'pending',
      priority: t.priority,
      tags: sanitizeTags(t.tags || (createdGoal ? createdGoal.tags : ['#WORK'])),
      frequency: 'one-time',
      dueDate: t.dueDate,
      createdAt: nowIso,
      estimatedMinutes: t.estimatedMinutes,
      goalId: createdGoal ? goalId : undefined,
      goalTitle: createdGoal ? createdGoal.title : undefined,
      postponeCount: 0,
      lastActivityDate: nowIso,
    }));

    const createdRoutines: RoutineItem[] = (generatedPlan.routinesToCreate || []).map((r, idx) => ({
      id: `routine-${Date.now()}-${idx}`,
      routineType: r.routineType,
      timeSlot: r.timeSlot,
      title: r.title,
      details: r.details,
      frequency: r.frequency || (r.routineType === 'weekend' ? 'weekends' : 'everyday'),
      specificDays: r.specificDays,
      isTimeBlock: r.isTimeBlock || r.timeSlot.includes('-') || r.timeSlot.toLowerCase().includes(' to '),
      completedDates: [],
      order: idx + 1,
    }));

    onApplyPlan(createdGoal || null, createdTasks, createdRoutines, generatedPlan.routinesToEdit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-teal-500/30 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Ask AI Coach
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full uppercase">
                  Goal & Routine Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Create new goals, add routines, or edit existing routine schedules with plain AI prompts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Natural Language Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              What would you like the AI Coach to plan or update?
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'Create a goal to launch my portfolio', 'Add a 6:00 AM morning hydration routine', or 'Edit my Wake Up routine step to 05:30 AM'"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/50 transition resize-none"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="absolute bottom-3 right-3 px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Try a sample intent prompt:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(qp);
                    handleGenerate(qp);
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl transition text-left"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Schedule Plan Result */}
          {generatedPlan && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-teal-400" />
                  Proposed Schedule Changes
                </h4>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full uppercase">
                  Action: {generatedPlan.actionType}
                </span>
              </div>

              {/* Goal Box */}
              {generatedPlan.goal && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                      New Goal Target
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-300">
                      Target Due: {generatedPlan.goal.targetDueDate}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{generatedPlan.goal.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{generatedPlan.goal.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sanitizeTags(generatedPlan.goal.tags).map((tg, idx) => (
                      <span key={idx} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Action Subtasks */}
              {generatedPlan.tasks && generatedPlan.tasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                    New Action Tasks ({generatedPlan.tasks.length})
                  </span>
                  <div className="space-y-1.5">
                    {generatedPlan.tasks.map((tk, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold font-mono text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-200">{tk.title}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">Est: {tk.estimatedMinutes} mins • Due: {tk.dueDate}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-indigo-300 uppercase">
                          {tk.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Routine Steps to Create */}
              {generatedPlan.routinesToCreate && generatedPlan.routinesToCreate.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    New Routine Protocols to Add ({generatedPlan.routinesToCreate.length})
                  </span>
                  <div className="space-y-1.5">
                    {generatedPlan.routinesToCreate.map((rt, idx) => (
                      <div key={`create-${idx}-${rt.title}`} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-200">{rt.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                              {rt.routineType}
                            </span>
                            {rt.specificDays && rt.specificDays.length > 0 ? (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {rt.specificDays.join(', ')}
                              </span>
                            ) : (
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold border ${
                                (rt.frequency || 'weekends') === 'everyday'
                                  ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                                  : (rt.frequency || 'weekends') === 'weekdays'
                                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                              }`}>
                                {rt.frequency || 'weekends'}
                              </span>
                            )}
                            {(rt.isTimeBlock || rt.timeSlot.includes('-')) && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-violet-950/80 text-violet-300 border border-violet-500/40 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                Time Block
                              </span>
                            )}
                          </div>
                          {rt.details && <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{rt.details}</span>}
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          {rt.timeSlot}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Routine Modifications */}
              {generatedPlan.routinesToEdit && generatedPlan.routinesToEdit.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    Routine Modifications to Apply ({generatedPlan.routinesToEdit.length})
                  </span>
                  <div className="space-y-1.5">
                    {generatedPlan.routinesToEdit.map((re, idx) => {
                      const matchedOriginal = existingRoutines.find((r) => r.id === re.id || (re.titleToMatch && r.title.toLowerCase().includes(re.titleToMatch.toLowerCase())));

                      return (
                        <div key={`edit-${idx}-${re.id || re.titleToMatch}`} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-cyan-300">
                                Target Routine: {matchedOriginal ? matchedOriginal.title : re.titleToMatch || re.newTitle || 'Routine Step'}
                              </span>
                              {re.specificDays && re.specificDays.length > 0 ? (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                  {re.specificDays.join(', ')}
                                </span>
                              ) : re.frequency ? (
                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold border ${
                                  re.frequency === 'everyday'
                                    ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                                    : re.frequency === 'weekdays'
                                    ? 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                                    : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                                }`}>
                                  {re.frequency}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              New Time: {re.newTimeSlot || matchedOriginal?.timeSlot}
                            </span>
                          </div>
                          {re.newTitle && re.newTitle !== matchedOriginal?.title && (
                            <p className="text-[11px] text-slate-300">
                              <span className="text-slate-500">Updated Title:</span> {re.newTitle}
                            </p>
                          )}
                          {re.newDetails && (
                            <p className="text-[11px] text-slate-400 italic">
                              "{re.newDetails}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>

          {generatedPlan ? (
            <button
              onClick={handleApply}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <span>Apply & Save to Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              Type your prompt above or select a sample to get started.
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
