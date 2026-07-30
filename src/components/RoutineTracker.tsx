import React, { useState } from 'react';
import { RoutineItem, RoutineType } from '../types';
import { 
  Sunrise, 
  Sunset, 
  Coffee, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Flame, 
  Sparkles, 
  Trash2, 
  Edit2, 
  RotateCcw,
  Check,
  Zap,
  BookOpen,
  Dumbbell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface RoutineTrackerProps {
  routines: RoutineItem[];
  onToggleRoutineItem: (itemId: string, dateStr: string) => void;
  onAddRoutineItem: (item: Omit<RoutineItem, 'id' | 'completedDates'>) => void;
  onDeleteRoutineItem: (itemId: string) => void;
  onResetTodayRoutine: (routineType: RoutineType, dateStr: string) => void;
}

export const RoutineTracker: React.FC<RoutineTrackerProps> = ({
  routines,
  onToggleRoutineItem,
  onAddRoutineItem,
  onDeleteRoutineItem,
  onResetTodayRoutine,
}) => {
  const [activeRoutineType, setActiveRoutineType] = useState<RoutineType>('morning');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New routine form fields
  const [newTimeSlot, setNewTimeSlot] = useState<string>('07:00 AM');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDetails, setNewDetails] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  const currentTypeRoutines = routines
    .filter((r) => r.routineType === activeRoutineType)
    .sort((a, b) => a.order - b.order);

  const completedCount = currentTypeRoutines.filter((r) =>
    r.completedDates.includes(todayStr)
  ).length;

  const totalCount = currentTypeRoutines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCheck = (itemId: string, isCurrentlyDone: boolean, e: React.MouseEvent) => {
    if (!isCurrentlyDone) {
      try {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
          particleCount: 35,
          spread: 50,
          origin: { x, y },
          colors: activeRoutineType === 'morning' ? ['#f59e0b', '#10b981', '#6366f1'] : ['#8b5cf6', '#ec4899', '#3b82f6'],
        });
      } catch (err) {}
    }
    onToggleRoutineItem(itemId, todayStr);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddRoutineItem({
      routineType: activeRoutineType,
      timeSlot: newTimeSlot,
      title: newTitle.trim(),
      details: newDetails.trim(),
      order: currentTypeRoutines.length + 1,
    });

    setNewTitle('');
    setNewDetails('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Routine Type Tabs & Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeRoutineType === 'morning' ? (
                  <Sunrise className="w-5 h-5 text-amber-400" />
                ) : activeRoutineType === 'evening' ? (
                  <Sunset className="w-5 h-5 text-purple-400" />
                ) : (
                  <Coffee className="w-5 h-5 text-emerald-400" />
                )}
              </span>
              <h2 className="text-xl font-bold tracking-tight capitalize">
                {activeRoutineType} Routine Protocol
              </h2>
            </div>
            <p className="text-xs text-indigo-200/80 max-w-xl">
              {activeRoutineType === 'morning'
                ? 'High-performance morning stack: wake up, stretch, shower, focus & deep work block, and commute.'
                : activeRoutineType === 'evening'
                ? 'Evening wind-down stack: Progress reflection, tomorrow planning, technical reading, and digital detox.'
                : 'Weekend rejuvenation & deep focus protocol: Extended workout, journal reflection, passion projects, and meal prep.'}
            </p>
          </div>

          {/* Progress Circle / Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="text-right">
              <div className="text-2xl font-black text-amber-300">{progressPercent}%</div>
              <div className="text-[10px] text-indigo-200 font-medium">
                {completedCount} of {totalCount} completed today
              </div>
            </div>

            <div className="w-12 h-12 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center font-bold text-sm">
              {progressPercent === 100 ? (
                <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          </div>

        </div>

        {/* Routine Selector Switcher */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveRoutineType('morning')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeRoutineType === 'morning'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sunrise className="w-4 h-4" />
              <span>Morning (4:00 AM Start)</span>
            </button>

            <button
              onClick={() => setActiveRoutineType('evening')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeRoutineType === 'evening'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sunset className="w-4 h-4" />
              <span>Evening Routine</span>
            </button>

            <button
              onClick={() => setActiveRoutineType('weekend')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeRoutineType === 'weekend'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Weekend Routine</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onResetTodayRoutine(activeRoutineType, todayStr)}
              className="px-3 py-1.5 text-xs text-indigo-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition border border-white/10 flex items-center gap-1.5"
              title="Reset checks for today"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Today</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-white hover:bg-indigo-50 rounded-lg transition shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Step</span>
            </button>
          </div>
        </div>

      </div>

      {/* Routine Timeline Checklist */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
        
        <div className="space-y-3">
          <AnimatePresence>
            {currentTypeRoutines.map((item, idx) => {
              const isDone = item.completedDates.includes(todayStr);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-80'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 w-full sm:w-auto">
                    {/* Step Order & Time Slot */}
                    <div className="flex flex-col items-center min-w-[90px] text-center pt-0.5 border-r border-slate-200/80 dark:border-slate-700/80 pr-3 flex-shrink-0">
                      <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/40 mb-1 whitespace-nowrap">
                        {item.timeSlot}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Step {idx + 1}</span>
                    </div>

                    {/* Title & Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`text-sm font-bold break-words pr-2 ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {item.title}
                        </h3>

                        <button
                          onClick={() => onDeleteRoutineItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition p-1 flex-shrink-0"
                          title="Delete routine step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.details && (
                        <p className={`text-xs mt-1 break-words ${isDone ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Completion Toggle Check Button */}
                  <button
                    onClick={(e) => handleCheck(item.id, isDone, e)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Done</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                        <span>Check</span>
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentTypeRoutines.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              No routine steps defined for {activeRoutineType}. Click "Add Step" to customize!
            </div>
          )}
        </div>

      </div>

      {/* Add Step Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                Add New {activeRoutineType} Step
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Time Slot (e.g. 04:30 AM - 06:30 AM)
                </label>
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  placeholder="04:30 AM"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Routine Action / Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Focus & Deep Work block"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Details / Instructions
                </label>
                <textarea
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Focus on genomic dataset cleanup and python pipeline optimization."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Save Step
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
