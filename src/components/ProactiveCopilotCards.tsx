import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Calendar, Clock, ArrowRight, Check, X, Split, RefreshCw } from 'lucide-react';
import { Task } from '../types';

interface ProactiveCopilotCardsProps {
  tasks: Task[];
  onBreakTaskIntoSubtasks: (taskId: string) => void;
  onRescheduleOverbookedTasks: () => void;
  onAddStepToStalledGoal: (goalId: string, goalTitle: string) => void;
}

export const ProactiveCopilotCards: React.FC<ProactiveCopilotCardsProps> = ({
  tasks,
  onBreakTaskIntoSubtasks,
  onRescheduleOverbookedTasks,
  onAddStepToStalledGoal,
}) => {
  const [dismissedCardIds, setDismissedCardIds] = useState<string[]>([]);

  const handleDismiss = (id: string) => {
    setDismissedCardIds((prev) => [...prev, id]);
  };

  // 1. Postpone Trigger check (postponeCount >= 3)
  const postponedTasks = tasks.filter(
    (t) => !t.completed && (t.postponeCount || 0) >= 3
  );

  // 2. Overbook Trigger check (>5 pending high-priority or total pending today tasks)
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentTodayTasks = tasks.filter(
    (t) => !t.completed && t.status === 'pending' && (t.priority === 'urgent' || t.priority === 'important') && (t.dueDate === todayStr || !t.dueDate)
  );

  // 3. Stalled Goal Trigger check (isGoal && 0 completed child tasks or lastActivityDate > 10 days ago)
  const tenDaysAgoMs = Date.now() - 10 * 24 * 60 * 60 * 1000;
  const stalledGoals = tasks.filter((g) => {
    if (!g.isGoal || g.status === 'completed') return false;
    const childTasks = tasks.filter((t) => t.goalId === g.id);
    const completedChildCount = childTasks.filter((t) => t.status === 'completed').length;
    const isStalled = completedChildCount === 0 && childTasks.length > 0;
    const isOldActivity = g.lastActivityDate ? new Date(g.lastActivityDate).getTime() < tenDaysAgoMs : true;
    return isStalled || isOldActivity;
  });

  return (
    <div className="space-y-3 mb-4">
      
      {/* 1. Postpone Trigger Card */}
      {postponedTasks.map((task) => {
        const cardId = `postpone-${task.id}`;
        if (dismissedCardIds.includes(cardId)) return null;

        return (
          <div
            key={cardId}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/30 text-amber-200 text-xs shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">AI Copilot Suggestion</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded uppercase">
                    Postponed {task.postponeCount || 3}x
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  You've postponed <strong className="text-amber-300 font-semibold">"{task.title}"</strong> 3 times. Break it into smaller steps?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <button
                onClick={() => {
                  onBreakTaskIntoSubtasks(task.id);
                  handleDismiss(cardId);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Break into Subtasks</span>
              </button>
              <button
                onClick={() => handleDismiss(cardId)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                title="Dismiss suggestion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {/* 2. Overbook Trigger Card */}
      {urgentTodayTasks.length >= 5 && !dismissedCardIds.includes('overbooked-card') && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 text-rose-200 text-xs shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Capacity Alert</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 rounded uppercase">
                  {urgentTodayTasks.length} High Priority Tasks
                </span>
              </div>
              <p className="text-slate-300 text-xs">
                Overbooked today. Shall I reschedule lower-priority items to keep focus realistic?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              onClick={() => {
                onRescheduleOverbookedTasks();
                handleDismiss('overbooked-card');
              }}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Shift Low Priority to Tomorrow</span>
            </button>
            <button
              onClick={() => handleDismiss('overbooked-card')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Dismiss suggestion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Stalled Goal Trigger Card */}
      {stalledGoals.slice(0, 1).map((goal) => {
        const cardId = `stalled-${goal.id}`;
        if (dismissedCardIds.includes(cardId)) return null;

        return (
          <div
            key={cardId}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/30 text-teal-200 text-xs shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 mt-0.5 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Goal Momentum Suggestion</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 rounded uppercase">
                    Stalled 10+ Days
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  No activity on <strong className="text-teal-300 font-semibold">"{goal.title}"</strong> for 10 days. Rebalance schedule with a quick step?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <button
                onClick={() => {
                  onAddStepToStalledGoal(goal.id, goal.title);
                  handleDismiss(cardId);
                }}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Add Action Step</span>
              </button>
              <button
                onClick={() => handleDismiss(cardId)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                title="Dismiss suggestion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

    </div>
  );
};
