import React, { useState } from 'react';
import { Sparkles, Target, CheckSquare, Sunrise, ArrowRight, Loader2, X, Zap, Lightbulb } from 'lucide-react';
import { Task, RoutineItem, Category, Priority, RoutineType } from '../types';

interface CoachResult {
  goal: {
    title: string;
    category: Category;
    description: string;
    priority: Priority;
    targetDueDate: string;
    tags: string[];
  };
  tasks: Array<{
    title: string;
    category?: Category;
    priority: Priority;
    estimatedMinutes: number;
    dueDate: string;
    tags?: string[];
  }>;
  routines: Array<{
    title: string;
    details?: string;
    timeSlot: string;
    routineType: RoutineType;
  }>;
}

interface AskCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (newGoal: Task, newTasks: Task[], newRoutines: RoutineItem[]) => void;
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

export const AskCoachModal: React.FC<AskCoachModalProps> = ({ isOpen, onClose, onApplyPlan }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<CoachResult | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    '💼 Prepare for upcoming client pitch and organize project deliverables',
    '📈 Launch a side project MVP in 30 days and track daily tasks',
    '🏃 Train for a 10k run and build a consistent workout routine',
    '📚 Read 20 minutes every evening and build a daily reading habit',
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
        body: JSON.stringify({ prompt: textToSubmit }),
      });

      if (!response.ok) {
        throw new Error(`AI Coach server error (${response.status})`);
      }

      const data: CoachResult = await response.json();
      const sanitizedData: CoachResult = {
        ...data,
        goal: {
          ...data.goal,
          tags: sanitizeTags(data.goal?.tags),
        },
        tasks: (data.tasks || []).map((t) => ({
          ...t,
          tags: sanitizeTags(t.tags),
        })),
        routines: data.routines || [],
      };
      setGeneratedPlan(sanitizedData);
    } catch (err: any) {
      console.warn('Backend API /api/coach failed, using local smart parsing fallback:', err);
      // Fallback local generator so user always receives structured AI plan
      const today = new Date();
      const decDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const isProject = textToSubmit.toLowerCase().includes('pitch') || textToSubmit.toLowerCase().includes('client');
      const isLaunch = textToSubmit.toLowerCase().includes('mvp') || textToSubmit.toLowerCase().includes('launch');

      const fallbackGoalTitle = isProject
        ? 'Prepare Client Pitch & Project Deliverables'
        : isLaunch
        ? 'Launch Side Project MVP'
        : textToSubmit.slice(0, 45) + (textToSubmit.length > 45 ? '...' : '');

      const fallback: CoachResult = {
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
        routines: [
          {
            title: 'Deep Focus Morning Block',
            details: 'Dedicated undistracted morning block for core project work',
            timeSlot: '07:00 AM - 07:30 AM',
            routineType: 'morning',
          },
          {
            title: 'Evening Progress Log & Daily Review',
            details: 'Review completed items and set top priorities for tomorrow',
            timeSlot: '09:00 PM - 09:15 PM',
            routineType: 'evening',
          },
        ],
      };

      setGeneratedPlan(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedPlan) return;

    const goalId = `goal-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const createdGoal: Task = {
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

    const createdTasks: Task[] = generatedPlan.tasks.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      title: t.title,
      category: t.category || generatedPlan.goal.category,
      status: 'pending',
      priority: t.priority,
      tags: sanitizeTags(t.tags || generatedPlan.goal.tags),
      frequency: 'one-time',
      dueDate: t.dueDate,
      createdAt: nowIso,
      estimatedMinutes: t.estimatedMinutes,
      goalId: goalId,
      goalTitle: generatedPlan.goal.title,
      postponeCount: 0,
      lastActivityDate: nowIso,
    }));

    const createdRoutines: RoutineItem[] = generatedPlan.routines.map((r, idx) => ({
      id: `routine-${Date.now()}-${idx}`,
      routineType: r.routineType,
      timeSlot: r.timeSlot,
      title: r.title,
      details: r.details,
      completedDates: [],
      order: idx + 1,
    }));

    onApplyPlan(createdGoal, createdTasks, createdRoutines);
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
                  Smart Planner
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Describe your goal in plain text and let AI build your action plan.
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
              What objective or vision would you like to plan?
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'I want to build a consistent morning routine and finish my quarterly project by Friday.'"
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
                    <span>Generate Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Try a sample narrative prompt:
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
                  Your Custom Roadmap
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  1 Goal + {generatedPlan.tasks.length} Tasks + {generatedPlan.routines.length} Routines
                </span>
              </div>

              {/* Goal Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                    Primary Macro Target
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-300">
                    Due {generatedPlan.goal.targetDueDate}
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

              {/* Linked Action Subtasks */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Action Steps ({generatedPlan.tasks.length})
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

              {/* Scheduled Routine Steps */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                  Daily Routine Protocol ({generatedPlan.routines.length})
                </span>
                <div className="space-y-1.5">
                  {generatedPlan.routines.map((rt, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{rt.title}</span>
                        {rt.details && <span className="text-[10px] text-slate-400 block">{rt.details}</span>}
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {rt.timeSlot}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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
