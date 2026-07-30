import React, { useState } from 'react';
import { Task } from '../types';
import { X, Target, Plus, Check, Calendar, Trash2, Clock, CheckCircle2, ListTodo, AlertCircle } from 'lucide-react';

interface GoalDetailModalProps {
  goal: Task | null;
  isOpen: boolean;
  onClose: () => void;
  allTasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onAddChildTask: (goalId: string, goalTitle: string, category: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goal,
  isOpen,
  onClose,
  allTasks,
  onToggleComplete,
  onAddChildTask,
  onDeleteTask,
  onEditTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!isOpen || !goal) return null;

  // Get all child tasks belonging to this goal
  const childTasks = allTasks.filter((t) => t.goalId === goal.id);
  const completedChildCount = childTasks.filter((t) => t.status === 'completed').length;
  const totalChildCount = childTasks.length;
  const percentComplete = totalChildCount > 0 ? Math.round((completedChildCount / totalChildCount) * 100) : 0;

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddChildTask(goal.id, goal.title, goal.category, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                Goal / Project
              </span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 capitalize font-medium">
                {goal.category}
              </span>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {goal.title}
            </h2>

            {goal.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {goal.description}
              </p>
            )}

            {goal.dueDate && (
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-300 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Target Date: {goal.dueDate}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Progress Overview Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Goal Accomplishment Progress
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                {completedChildCount} of {totalChildCount} Tasks Completed ({percentComplete}%)
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  percentComplete === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Quick Add Child Task Form */}
          <form onSubmit={handleCreateTaskSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Add Action Task to this Goal</span>
              <span className="text-[10px] text-slate-400 font-normal">Add specific steps anytime</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Draft executive summary, Contact client, Review roadmap..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md transition flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </form>

          {/* Tasks under Goal list */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-indigo-500" />
              Tasks Linked to this Goal ({childTasks.length})
            </h3>

            {childTasks.length > 0 ? (
              <div className="space-y-2">
                {childTasks.map((t) => {
                  const isDone = t.status === 'completed';
                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                        isDone
                          ? 'bg-slate-100/60 dark:bg-slate-900/40 border-emerald-500/20 opacity-75'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50'
                      }`}
                    >
                      <button
                        onClick={() => onToggleComplete(t.id)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center border-2 transition flex-shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-400 dark:border-slate-600 hover:border-indigo-500'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {t.title}
                          </p>

                          {t.dueDate && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {t.dueDate}</span>
                              {t.estimatedMinutes && (
                                <span className="flex items-center gap-0.5">
                                  • <Clock className="w-3 h-3" /> {t.estimatedMinutes}m
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditTask(t)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 transition"
                          title="Edit Task"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <AlertCircle className="w-6 h-6 text-indigo-400 mx-auto" />
                <p className="text-xs font-bold text-slate-300">No specific tasks added under this goal yet</p>
                <p className="text-[11px] text-slate-500">Use the input above to break down this goal into actionable tasks!</p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <button
            onClick={() => onEditTask(goal)}
            className="px-3 py-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
          >
            Edit Goal Settings
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
