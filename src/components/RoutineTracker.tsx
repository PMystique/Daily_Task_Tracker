import React, { useState } from 'react';
import { RoutineItem, RoutineType, RoutineFrequency, DayOfWeek } from '../types';
import { sortRoutinesChronologically, filterRoutinesByFrequency, isTodayWeekend, isTimeBlockRoutine, DAYS_OF_WEEK } from '../utils/routineUtils';
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
  Dumbbell,
  X,
  Calendar,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface RoutineTrackerProps {
  routines: RoutineItem[];
  onToggleRoutineItem: (itemId: string, dateStr: string) => void;
  onAddRoutineItem: (item: Omit<RoutineItem, 'id' | 'completedDates'>) => void;
  onEditRoutineItem?: (item: RoutineItem) => void;
  onDeleteRoutineItem: (itemId: string) => void;
  onResetTodayRoutine: (routineType: RoutineType, dateStr: string) => void;
}

export const RoutineTracker: React.FC<RoutineTrackerProps> = ({
  routines,
  onToggleRoutineItem,
  onAddRoutineItem,
  onEditRoutineItem,
  onDeleteRoutineItem,
  onResetTodayRoutine,
}) => {
  const [activeRoutineType, setActiveRoutineType] = useState<RoutineType>('morning');
  const [frequencyFilter, setFrequencyFilter] = useState<'auto' | 'all' | 'everyday' | 'weekdays' | 'weekends'>('auto');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);

  // New/Edit routine form fields
  const [formTimeSlot, setFormTimeSlot] = useState<string>('07:00 AM');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDetails, setFormDetails] = useState<string>('');
  const [formType, setFormType] = useState<RoutineType>('morning');
  const [formFrequency, setFormFrequency] = useState<RoutineFrequency>('everyday');
  const [formSpecificDays, setFormSpecificDays] = useState<DayOfWeek[]>([]);
  const [formIsTimeBlock, setFormIsTimeBlock] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isWeekendNow = isTodayWeekend();

  // Filter & Chronologically sort routines
  const typeRoutines = routines.filter((r) => r.routineType === activeRoutineType);
  const filteredRoutines = filterRoutinesByFrequency(typeRoutines, frequencyFilter);
  const currentTypeRoutines = sortRoutinesChronologically(filteredRoutines);

  const completedCount = currentTypeRoutines.filter((r) =>
    r.completedDates?.includes(todayStr)
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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTimeSlot('07:00 AM');
    setFormTitle('');
    setFormDetails('');
    setFormType(activeRoutineType);
    setFormFrequency('everyday');
    setFormSpecificDays([]);
    setFormIsTimeBlock(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: RoutineItem) => {
    setEditingItem(item);
    setFormTimeSlot(item.timeSlot);
    setFormTitle(item.title);
    setFormDetails(item.details || '');
    setFormType(item.routineType);
    setFormFrequency(item.frequency || (item.routineType === 'weekend' ? 'weekends' : 'everyday'));
    setFormSpecificDays(item.specificDays || []);
    setFormIsTimeBlock(isTimeBlockRoutine(item));
    setShowAddModal(true);
  };

  const toggleDayInForm = (day: DayOfWeek) => {
    setFormSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const isTimeBlockAuto = formIsTimeBlock || formTimeSlot.includes('-') || formTimeSlot.toLowerCase().includes(' to ');

    if (editingItem && onEditRoutineItem) {
      onEditRoutineItem({
        ...editingItem,
        routineType: formType,
        timeSlot: formTimeSlot.trim(),
        title: formTitle.trim(),
        details: formDetails.trim(),
        frequency: formFrequency,
        specificDays: formSpecificDays.length > 0 ? formSpecificDays : undefined,
        isTimeBlock: isTimeBlockAuto,
      });
    } else {
      onAddRoutineItem({
        routineType: formType,
        timeSlot: formTimeSlot.trim(),
        title: formTitle.trim(),
        details: formDetails.trim(),
        frequency: formFrequency,
        specificDays: formSpecificDays.length > 0 ? formSpecificDays : undefined,
        isTimeBlock: isTimeBlockAuto,
        order: currentTypeRoutines.length + 1,
      });
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Routine Type Tabs & Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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

              <span className="ml-2 px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-300" />
                <span>Today: {isWeekendNow ? 'Weekend (Sat/Sun)' : 'Weekday (Mon-Fri)'}</span>
              </span>
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

        {/* Routine Selector Switcher & Weekday/Weekend Filter */}
        <div className="mt-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveRoutineType('morning')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeRoutineType === 'morning'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sunrise className="w-4 h-4" />
              <span>Morning</span>
            </button>

            <button
              onClick={() => setActiveRoutineType('evening')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeRoutineType === 'evening'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sunset className="w-4 h-4" />
              <span>Evening</span>
            </button>

            <button
              onClick={() => setActiveRoutineType('weekend')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeRoutineType === 'weekend'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Weekend</span>
            </button>
          </div>

          {/* Frequency Day Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
            <span className="text-[10px] font-bold text-indigo-300 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Day Filter:
            </span>
            <button
              onClick={() => setFrequencyFilter('auto')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                frequencyFilter === 'auto'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Automatically shows routines active today (Weekday or Weekend)"
            >
              Auto (Today)
            </button>
            <button
              onClick={() => setFrequencyFilter('everyday')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                frequencyFilter === 'everyday'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Everyday
            </button>
            <button
              onClick={() => setFrequencyFilter('weekdays')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                frequencyFilter === 'weekdays'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Weekdays
            </button>
            <button
              onClick={() => setFrequencyFilter('weekends')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                frequencyFilter === 'weekends'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Weekends
            </button>
            <button
              onClick={() => setFrequencyFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                frequencyFilter === 'all'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Show All
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
              onClick={handleOpenAdd}
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
              const isDone = item.completedDates?.includes(todayStr);
              const freq = item.frequency || (item.routineType === 'weekend' ? 'weekends' : 'everyday');
              const isBlock = isTimeBlockRoutine(item);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isBlock
                      ? 'bg-violet-50/40 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/50 hover:border-violet-300 dark:hover:border-violet-700'
                      : isDone
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

                    {/* Title, Details & Badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm font-bold break-words pr-2 ${
                              isDone && !isBlock
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {item.title}
                          </h3>

                          {/* Specific Days or Frequency Badge */}
                          {item.specificDays && item.specificDays.length > 0 ? (
                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {item.specificDays.join(', ')}
                            </span>
                          ) : (
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                              freq === 'everyday'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                : freq === 'weekdays'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}>
                              {freq}
                            </span>
                          )}

                          {/* Time Block Badge */}
                          {isBlock && (
                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              Time Block
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="text-slate-400 hover:text-indigo-400 transition p-1"
                            title="Edit routine step"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRoutineItem(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition p-1"
                            title="Delete routine step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.details && (
                        <p className={`text-xs mt-1 break-words ${isDone && !isBlock ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Render Time Blocks without Checkboxes vs Regular Completion Button */}
                  {isBlock ? (
                    <div className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-violet-500/10 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-violet-500" />
                      <span>Focus Window</span>
                    </div>
                  ) : (
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
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentTypeRoutines.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs space-y-1">
              <p className="font-semibold text-slate-500 dark:text-slate-400">
                No routine steps matching current filter ({frequencyFilter}) for {activeRoutineType}.
              </p>
              <p className="text-[11px]">
                Click "Add Step" or switch the Day Filter to view or create steps!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Step Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {editingItem ? 'Edit Routine Step' : `Add New ${activeRoutineType} Step`}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Routine Protocol Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as RoutineType)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="morning">Morning Routine</option>
                  <option value="evening">Evening Routine</option>
                  <option value="weekend">Weekend Routine</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Day Frequency
                </label>
                <select
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value as RoutineFrequency)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium mb-2"
                >
                  <option value="everyday">Everyday (Mon - Sun)</option>
                  <option value="weekdays">Weekdays Only (Mon - Fri)</option>
                  <option value="weekends">Weekends Only (Sat - Sun)</option>
                </select>

                <div className="mt-2 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                    Or select specific days (e.g. Aerobics every Thursday):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {DAYS_OF_WEEK.map((d) => {
                      const isSel = formSpecificDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDayInForm(d)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                            isSel
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Time Slot (e.g. 04:30 AM or 04:30 AM - 06:30 AM)
                </label>
                <input
                  type="text"
                  value={formTimeSlot}
                  onChange={(e) => setFormTimeSlot(e.target.value)}
                  placeholder="04:30 AM"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="timeBlockCheck"
                  checked={formIsTimeBlock}
                  onChange={(e) => setFormIsTimeBlock(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="timeBlockCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Render as Time Block (No completion check required)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Routine Action / Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Focus & Deep Work block"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Details / Instructions
                </label>
                <textarea
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  placeholder="Focus on core priorities & deep work."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
                  {editingItem ? 'Update Step' : 'Save Step'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

