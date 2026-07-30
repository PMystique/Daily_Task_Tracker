import React, { useState, useEffect } from 'react';
import { Task, Category, Priority, Frequency, SubTask } from '../types';
import { X, Calendar, Clock, Tag, Plus, AlertCircle, Repeat, AlignLeft, Bell, CheckSquare, ListTodo, Trash2, Check } from 'lucide-react';
import { CustomCategory } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../data/categories';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  initialTask?: Task | null;
  defaultCategory?: Category | 'all';
  customCategories?: CustomCategory[];
  removedDefaultCategoryIds?: string[];
  onAddCustomCategory?: (name: string) => void;
  allGoals?: Task[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
  defaultCategory,
  customCategories = [],
  removedDefaultCategoryIds = [],
  onAddCustomCategory,
  allGoals = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('normal');
  const [frequency, setFrequency] = useState<Frequency>('one-time');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(15);

  // Goal hierarchy state
  const [isGoal, setIsGoal] = useState<boolean>(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  // Subtasks state
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Inline custom category creation
  const [isCreatingCustomCat, setIsCreatingCustomCat] = useState(false);
  const [newCustomCatName, setNewCustomCatName] = useState('');

  // Tag list state
  const [tags, setTags] = useState<string[]>(['project']);
  const [tagInput, setTagInput] = useState('');

  const SUGGESTED_TAGS = ['urgent', 'important', 'work', 'personal', 'clients', 'finance', 'health', 'meetings', 'deep-work', 'project'];

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategory(
        initialTask.category || (defaultCategory && defaultCategory !== 'all' ? defaultCategory : 'work')
      );
      setPriority(initialTask.priority || 'normal');
      setFrequency(initialTask.frequency || 'one-time');
      setDueDate(initialTask.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(initialTask.dueTime || '12:00');
      setEstimatedMinutes(initialTask.estimatedMinutes || 30);
      setNotes(initialTask.notes || '');
      setTags(initialTask.tags || ['project-specific']);
      setReminderMinutesBefore(initialTask.reminderMinutesBefore || 15);
      setSubtasks(initialTask.subtasks ? JSON.parse(JSON.stringify(initialTask.subtasks)) : []);
      setIsGoal(!!initialTask.isGoal);
      setSelectedGoalId(initialTask.goalId || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(defaultCategory && defaultCategory !== 'all' ? defaultCategory : 'work');
      setPriority('normal');
      setFrequency('one-time');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('12:00');
      setEstimatedMinutes(30);
      setNotes('');
      setTags(['project-specific']);
      setReminderMinutesBefore(15);
      setSubtasks([]);
      setIsGoal(false);
      setSelectedGoalId('');
    }
  }, [initialTask, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Subtasks helper functions
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newItem: SubTask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newItem]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleUpdateSubtaskTitle = (subtaskId: string, newTitle: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === subtaskId ? { ...st, title: newTitle } : st
      )
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedGoal = allGoals.find((g) => g.id === selectedGoalId);

    onSaveTask({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      status: initialTask?.status || 'pending',
      priority,
      tags,
      frequency,
      dueDate,
      dueTime: dueTime || undefined,
      estimatedMinutes,
      notes: notes.trim() || undefined,
      reminderMinutesBefore,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      isGoal: isGoal ? true : undefined,
      goalId: !isGoal && selectedGoalId ? selectedGoalId : undefined,
      goalTitle: !isGoal && matchedGoal ? matchedGoal.title : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl my-8 space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Goal vs Single Task Toggle Selector */}
          <div className="p-3 bg-indigo-50/70 dark:bg-slate-900/90 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
            <label className="block font-black text-slate-800 dark:text-slate-100 text-xs">
              Item Scope & Structure
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsGoal(true);
                  setSelectedGoalId('');
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border ${
                  isGoal
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <span>🎯 Top-Level Goal / Project</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGoal(false)}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border ${
                  !isGoal
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <span>📋 Action Task</span>
              </button>
            </div>

            {/* If Single Task, option to link to a parent Goal */}
            {!isGoal && (
              <div className="pt-2 border-t border-indigo-200/50 dark:border-slate-800">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link to Parent Goal / Project (Optional)
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">📋 None (Independent Standalone Task)</option>
                  {allGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      🎯 Goal: {g.title} ({g.category})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Review strategic project roadmap"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Description / Action Summary
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide brief context or acceptance criteria..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-200">
                  Category Tab
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomCat(!isCreatingCustomCat)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> + Custom
                </button>
              </div>

              {isCreatingCustomCat ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCustomCatName}
                    onChange={(e) => setNewCustomCatName(e.target.value)}
                    placeholder="Category name..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-indigo-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCustomCatName.trim() && onAddCustomCategory) {
                        onAddCustomCategory(newCustomCatName.trim());
                        const generatedId = newCustomCatName.trim().toLowerCase().replace(/\s+/g, '-');
                        setCategory(generatedId);
                        setNewCustomCatName('');
                        setIsCreatingCustomCat(false);
                      }
                    }}
                    className="px-2.5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustomCat(false)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsCreatingCustomCat(true);
                    } else {
                      setCategory(e.target.value as Category);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium capitalize"
                >
                  {DEFAULT_CATEGORIES
                    .filter((c) => !removedDefaultCategoryIds.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  {customCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                  {/* Fallback option if initial task has a category that was removed */}
                  {category &&
                    !DEFAULT_CATEGORIES.some((c) => c.id === category && !removedDefaultCategoryIds.includes(c.id)) &&
                    !customCategories.some((c) => c.id === category) && (
                      <option value={category}>
                        {category} (Current)
                      </option>
                    )}
                  <option value="__ADD_NEW__">+ Add Custom Category...</option>
                </select>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium capitalize"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="important">🟡 Important</option>
                <option value="normal">🔵 Normal</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>

          {/* Frequency & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="one-time">One-time</option>
                <option value="daily">Daily Repeated</option>
                <option value="weekly">Weekly Repeated</option>
                <option value="monthly">Monthly Repeated</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Duration & Reminder Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Est. Duration (mins)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Push Reminder Lead Time
              </label>
              <select
                value={reminderMinutesBefore}
                onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value={5}>5 mins before deadline</option>
                <option value={15}>15 mins before deadline</option>
                <option value={30}>30 mins before deadline</option>
                <option value={60}>1 hour before deadline</option>
              </select>
            </div>
          </div>

          {/* Tags Manager */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Tags (e.g. urgent, important, project-specific, personal)
            </label>
            
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Type tag and press Enter"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                Add Tag
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-400 font-medium">Quick add:</span>
              {SUGGESTED_TAGS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleAddTag(st)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                >
                  +#{st}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks / Actionable Checklist (Goals & Projects) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <ListTodo className="w-4 h-4 text-indigo-500" />
                <span>Subtasks & Action Items</span>
                {subtasks.length > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {subtasks.filter((st) => st.completed).length}/{subtasks.length} Done
                  </span>
                )}
              </label>
              <span className="text-[10px] text-slate-400">Add or edit steps anytime</span>
            </div>

            {/* Input to add subtask */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="e.g., Draft executive summary, Contact client, Review requirements..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Step
              </button>
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition flex-shrink-0 ${
                        st.completed
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                      }`}
                    >
                      {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <input
                      type="text"
                      value={st.title || ''}
                      onChange={(e) => handleUpdateSubtaskTitle(st.id, e.target.value)}
                      className={`flex-1 bg-transparent border-none focus:outline-none font-medium ${
                        st.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pl-1">
                No subtasks added yet. Break down goals like "Complete project proposal by Sept 30" into actionable steps!
              </p>
            )}
          </div>

          {/* Detailed Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Detailed Notes & Sub-tasks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key deliverables, sub-checklist items, reference links..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition active:scale-95"
            >
              {initialTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
