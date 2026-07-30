import React, { useState } from 'react';
import { Task, SubTask } from '../types';
import { 
  Check, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ListTodo,
  Plus,
  Target,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddSubtask?: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onOpenGoal?: (goalTask: Task) => void;
  onRemoveTag?: (taskId: string, tag: string) => void;
  childTasksCount?: number;
  completedChildTasksCount?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onOpenGoal,
  onRemoveTag,
  childTasksCount = 0,
  completedChildTasksCount = 0,
}) => {
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showSubtasks, setShowSubtasks] = useState<boolean>(true);
  const [newSubtaskInput, setNewSubtaskInput] = useState<string>('');

  const isCompleted = task.status === 'completed';
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !isCompleted && task.dueDate < todayStr;
  const isDueToday = task.dueDate === todayStr;

  const subtasksList = task.subtasks || [];
  const completedSubtasksCount = subtasksList.filter((st) => st.completed).length;
  const totalSubtasksCount = subtasksList.length;
  const subtasksPercent = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const goalChildPercent = childTasksCount > 0 ? Math.round((completedChildTasksCount / childTasksCount) * 100) : 0;

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            Urgent
          </span>
        );
      case 'important':
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            Important
          </span>
        );
      default:
        return null;
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim() || !onAddSubtask) return;
    onAddSubtask(task.id, newSubtaskInput.trim());
    setNewSubtaskInput('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`group relative p-3.5 rounded-xl border transition-all ${
        task.isGoal
          ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border-indigo-500/40 hover:border-indigo-400 shadow-md ring-1 ring-indigo-500/20'
          : isCompleted
          ? 'bg-slate-100/80 dark:bg-slate-900/40 border-emerald-500/30 opacity-75'
          : isOverdue
          ? 'bg-rose-50 dark:bg-slate-900 border-rose-500/40 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs'
      }`}
    >
      <div className="flex items-start space-x-3">
        
        {/* Checkbox square */}
        <button
          onClick={handleCheckboxClick}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
              : task.isGoal
              ? 'border-indigo-400 hover:border-emerald-400 bg-indigo-950 text-transparent hover:text-emerald-400'
              : 'border-indigo-500/50 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 text-transparent hover:text-indigo-400'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isCompleted ? (
            <Check className="w-3.5 h-3.5 stroke-[4]" />
          ) : (
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
              
              {/* Type Badge: GOAL vs GOAL CHILD vs INDEPENDENT */}
              {task.isGoal ? (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                  <Target className="w-3 h-3 text-emerald-400" />
                  Goal / Project
                </span>
              ) : task.goalTitle ? (
                <button
                  onClick={() => onOpenGoal && onOpenGoal({ id: task.goalId! } as Task)}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition flex items-center gap-1 flex-shrink-0 max-w-[180px] truncate"
                  title="Click to view parent Goal"
                >
                  <Target className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">Goal: {task.goalTitle}</span>
                </button>
              ) : (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1 flex-shrink-0">
                  <Layers className="w-2.5 h-2.5" />
                  Task
                </span>
              )}

              <span
                className={`text-sm font-semibold break-words min-w-0 leading-tight ${
                  task.isGoal
                    ? 'text-white font-bold text-base'
                    : isCompleted
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {task.title}
              </span>

              {getPriorityBadge(task.priority)}

              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700/60 capitalize flex-shrink-0">
                {task.category}
              </span>
            </div>

            {/* Unique ID Tag */}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex-shrink-0 self-start sm:self-auto">
              #{task.category.toUpperCase()}-{task.id.slice(-3)}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-xs mb-1.5 line-clamp-2 ${task.isGoal ? 'text-slate-300' : isCompleted ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'}`}>
              {task.description}
            </p>
          )}

          {/* Goal Progress Banner & Button if task is a Goal */}
          {task.isGoal && (
            <div className="my-2.5 p-2.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Goal Tasks Progress ({completedChildTasksCount}/{childTasksCount} Completed)
                </span>
                <span className="font-mono text-emerald-400 font-extrabold">{goalChildPercent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    goalChildPercent === 100 ? 'bg-emerald-400' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${goalChildPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {childTasksCount > 0 ? `${childTasksCount} tasks linked under this goal` : 'No tasks linked yet'}
                </span>

                {onOpenGoal && (
                  <button
                    onClick={() => onOpenGoal(task)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition shadow-sm"
                  >
                    <span>Open Goal Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="group/tagchip inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                >
                  <span>#{tag}</span>
                  {(onRemoveTag || onEditTask) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRemoveTag) {
                          onRemoveTag(task.id, tag);
                        } else if (onEditTask) {
                          onEditTask({
                            ...task,
                            tags: task.tags.filter((t) => t !== tag),
                          });
                        }
                      }}
                      title={`Remove tag #${tag}`}
                      className="hover:text-rose-500 hover:bg-rose-500/10 rounded p-0.5 transition opacity-70 sm:opacity-0 group-hover/tagchip:opacity-100"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Subtask Progress Bar */}
          {totalSubtasksCount > 0 && (
            <div className="my-2 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Subtasks / Action Items</span>
                  {showSubtasks ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                </button>
                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded font-bold">
                  {completedSubtasksCount}/{totalSubtasksCount} ({subtasksPercent}%)
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    subtasksPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>

              {/* Expandable Subtask Checklist Items */}
              {showSubtasks && (
                <div className="mt-2 space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                  {subtasksList.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 py-0.5 text-xs group/sub"
                    >
                      <button
                        onClick={() => onToggleSubtask && onToggleSubtask(task.id, st.id)}
                        className="flex items-center gap-2 text-left min-w-0 flex-1 hover:opacity-80 transition"
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition flex-shrink-0 ${
                            st.completed
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                          }`}
                        >
                          {st.completed && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                        </span>
                        <span
                          className={`truncate text-[11px] ${
                            st.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          {st.title}
                        </span>
                      </button>

                      {onDeleteSubtask && (
                        <button
                          onClick={() => onDeleteSubtask(task.id, st.id)}
                          className="opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-rose-500 transition p-0.5"
                          title="Delete subtask"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add subtask inline form */}
                  {onAddSubtask && (
                    <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-1 mt-1.5 pt-1">
                      <input
                        type="text"
                        value={newSubtaskInput}
                        onChange={(e) => setNewSubtaskInput(e.target.value)}
                        placeholder="+ Add subtask item..."
                        className="flex-1 px-2 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded flex items-center gap-0.5 transition"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Inline Add Subtask button if no subtasks yet */}
          {totalSubtasksCount === 0 && onAddSubtask && !task.isGoal && (
            <div className="mb-1.5">
              <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  placeholder="+ Add subtasks (e.g. read paper, draft section)..."
                  className="flex-1 px-2 py-0.5 text-[11px] bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                />
                {newSubtaskInput.trim() && (
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Bottom Info Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-1 font-mono ${
                  isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : isDueToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>
                  {task.isGoal ? 'Target Date: ' : ''}
                  {isDueToday ? 'Today' : task.dueDate}
                  {task.dueTime ? ` @ ${task.dueTime}` : ''}
                </span>
              </div>

              {task.estimatedMinutes && (
                <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimatedMinutes}m</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {task.notes && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  title="View Notes"
                >
                  {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              <button
                onClick={() => onDuplicateTask(task)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>

              <button
                onClick={() => onEditTask(task)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                title="Edit"
              >
                <Edit3 className="w-3 h-3" />
              </button>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Notes Drawer */}
          {showNotes && task.notes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono"
            >
              <p className="font-bold text-[9px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">Notes:</p>
              <p className="whitespace-pre-wrap">{task.notes}</p>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
};
