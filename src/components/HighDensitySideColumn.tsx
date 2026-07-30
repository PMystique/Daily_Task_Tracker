import React from 'react';
import { RoutineItem, CalendarEvent } from '../types';
import { Sunrise, Sunset, Calendar, Check, ArrowRight } from 'lucide-react';

interface HighDensitySideColumnProps {
  routines: RoutineItem[];
  calendarEvents: CalendarEvent[];
  onToggleRoutineItem: (itemId: string, dateStr: string) => void;
  onOpenCalendarModal: () => void;
  onOpenRoutineModal: () => void;
  onSyncEventToTask: (event: CalendarEvent) => void;
}

export const HighDensitySideColumn: React.FC<HighDensitySideColumnProps> = ({
  routines,
  calendarEvents,
  onToggleRoutineItem,
  onOpenCalendarModal,
  onOpenRoutineModal,
  onSyncEventToTask,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const morningRoutines = routines.filter((r) => r.routineType === 'morning');
  const eveningRoutines = routines.filter((r) => r.routineType === 'evening');

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/40 divide-y divide-slate-200 dark:divide-slate-800 border-l border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Routine Tracker Column Section */}
      <div className="flex-1 p-5 space-y-6 overflow-y-auto scrollbar-none">
        
        {/* Morning Routine Block */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center">
              <Sunrise className="w-3.5 h-3.5 mr-2 text-amber-500" />
              Morning Protocol
            </h3>
            <button
              onClick={onOpenRoutineModal}
              className="text-[10px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-mono transition"
            >
              Manage Stack →
            </button>
          </div>

          <div className="space-y-2.5">
            {morningRoutines.length > 0 ? (
              morningRoutines.map((item, idx) => {
                const isDone = item.completedDates.includes(todayStr);
                const isInProgress = !isDone && idx === morningRoutines.findIndex((r) => !r.completedDates.includes(todayStr));

                return (
                  <div key={item.id} className="flex items-center text-xs group">
                    <span className={`w-12 font-mono text-[11px] ${isInProgress ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.timeSlot.slice(0, 5)}
                    </span>

                    <div className="ml-2 flex-1 flex items-center justify-between p-1.5 rounded bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition">
                      <div className="flex items-center space-x-2 min-w-0">
                        <button
                          onClick={() => onToggleRoutineItem(item.id, todayStr)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'border border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-100 dark:bg-slate-950'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`truncate text-xs ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : isInProgress ? 'text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.title}
                        </span>
                      </div>

                      {isInProgress && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/30 rounded font-mono uppercase">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-slate-400 italic py-2">
                No morning routines set.
              </div>
            )}
          </div>
        </div>

        {/* Evening Routine Block */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center">
              <Sunset className="w-3.5 h-3.5 mr-2 text-purple-500" />
              Evening Wind-down
            </h3>
          </div>

          <div className="space-y-2.5">
            {eveningRoutines.length > 0 ? (
              eveningRoutines.map((item) => {
                const isDone = item.completedDates.includes(todayStr);

                return (
                  <div key={item.id} className="flex items-center text-xs group">
                    <span className="w-12 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {item.timeSlot.slice(0, 5)}
                    </span>

                    <div className="ml-2 flex-1 flex items-center justify-between p-1.5 rounded bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
                      <div className="flex items-center space-x-2 min-w-0">
                        <button
                          onClick={() => onToggleRoutineItem(item.id, todayStr)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'border border-slate-300 dark:border-slate-700 hover:border-purple-500 bg-slate-100 dark:bg-slate-950'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`truncate text-xs ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-400'}`}>
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-slate-400 italic py-2">
                No evening routines set.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Calendar Peek Box */}
      <div className="p-4 bg-slate-100 dark:bg-slate-950/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
            <Calendar className="w-3 h-3 mr-1.5 text-amber-500" />
            Upcoming Calendar Sync
          </h3>
          <button
            onClick={onOpenCalendarModal}
            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono"
          >
            Full View <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {calendarEvents.slice(0, 3).map((event) => {
            const dateObj = new Date(event.date + 'T00:00:00');
            const dayNum = dateObj.getDate() || '24';
            const monthStr = dateObj.toLocaleString('default', { month: 'short' }) || 'Oct';

            return (
              <div key={event.id} className="flex items-start group">
                <div className="w-10 text-center font-mono flex-shrink-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{dayNum}</div>
                  <div className="text-[8px] uppercase text-slate-400 dark:text-slate-500">{monthStr}</div>
                </div>

                <div className="ml-3 border-l-2 border-amber-500 pl-2.5 py-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{event.title}</span>
                    {!event.importedAsTaskId && (
                      <button
                        onClick={() => onSyncEventToTask(event)}
                        className="text-[9px] px-1 py-0.2 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded border border-indigo-500/30 hover:bg-indigo-500/30 transition"
                      >
                        + Sync Task
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
