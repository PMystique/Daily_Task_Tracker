import React, { useState } from 'react';
import { CalendarEvent, Category, Task } from '../types';
import { CustomCategory } from '../utils/storage';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Check, 
  Plus, 
  Sparkles, 
  Trash2,
  RefreshCw
} from 'lucide-react';

interface CalendarSyncModalProps {
  events: CalendarEvent[];
  onSyncEventToTask: (event: CalendarEvent) => void;
  onAddCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteCalendarEvent: (eventId: string) => void;
  customCategories?: CustomCategory[];
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  events,
  onSyncEventToTask,
  onAddCalendarEvent,
  onDeleteCalendarEvent,
  customCategories = [],
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddCalendarEvent({
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    });

    setTitle('');
    setLocation('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Calendar Sync & Event Ingestion
            </h2>

            {/* Integration Account Status Pill */}
            {isConnected ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Google Calendar Linked (user@email.com)</span>
                <button
                  onClick={() => setIsConnected(false)}
                  className="ml-1 text-[10px] text-emerald-400 underline hover:text-white transition"
                >
                  Manage
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConnected(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 text-[11px] font-bold transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Connect Google/Apple Calendar</span>
              </button>
            )}
          </div>

          <p className="text-xs text-emerald-200/80 max-w-xl">
            Import calendar invites and convert them into actionable daily tasks with one tap.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Calendar Event</span>
        </button>
      </div>

      {/* Add Event Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreateEvent} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 text-xs shadow-md">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
            Create New Calendar Entry
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Client Strategy Meeting / Sprint Review"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white capitalize"
              >
                <option value="work">Work</option>
                <option value="life">Life</option>
                <option value="school">School</option>
                <option value="finance">Finance</option>
                <option value="career">Career</option>
                <option value="family-social">Family & Social</option>
                <option value="side-hustle">Side Hustle</option>
                <option value="health">Health</option>
                <option value="learning-skills">Learning & Skills</option>
                {customCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location / Link
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Google Meet / Room 302"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topics to prepare, agenda items..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Save Event
            </button>
          </div>
        </form>
      )}

      {/* List of Calendar Events */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3 gap-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Upcoming Calendar Events ({events.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Import calendar invites and convert them into actionable daily tasks with one tap.</span>
        </div>

        <div className="space-y-3">
          {events.map((ev) => {
            const isSynced = Boolean(ev.importedAsTaskId);

            return (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                      {ev.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ev.title}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                      {ev.date} ({ev.startTime} - {ev.endTime})
                    </span>

                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        {ev.location}
                      </span>
                    )}
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => onDeleteCalendarEvent(ev.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSyncEventToTask(ev)}
                    disabled={isSynced}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                      isSynced
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isSynced ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>✓ Added to Tasks</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>+ Add to Tasks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              No calendar events found. Add an event above to sync it as a task!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
