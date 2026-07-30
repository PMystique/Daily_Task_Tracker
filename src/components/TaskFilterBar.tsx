import React, { useState } from 'react';
import { FilterState } from '../types';
import { Search, X, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskFilterBarProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  availableTags: string[];
  totalTaskCount: number;
  filteredTaskCount: number;
  onDeleteTagGlobally?: (tag: string) => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filter,
  onFilterChange,
  availableTags,
  totalTaskCount,
  filteredTaskCount,
  onDeleteTagGlobally,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClearFilters = () => {
    onFilterChange({
      ...filter,
      search: '',
      status: 'all',
      tags: [],
      frequency: 'all',
      goalFilter: 'all',
    });
  };

  const handleTagToggle = (tag: string) => {
    const isSelected = filter.tags.includes(tag);
    const newTags = isSelected
      ? filter.tags.filter((t) => t !== tag)
      : [...filter.tags, tag];
    onFilterChange({ ...filter, tags: newTags });
  };

  const activeFilterCount =
    (filter.search ? 1 : 0) +
    (filter.status !== 'all' ? 1 : 0) +
    filter.tags.length +
    (filter.frequency !== 'all' ? 1 : 0) +
    (filter.goalFilter && filter.goalFilter !== 'all' ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-md mb-4 space-y-3 transition-all">
      
      {/* Primary Search & Quick Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Compact Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filter.search || ''}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            placeholder="Search tasks, goals, tags..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Status Pill Bar */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['all', 'pending', 'completed', 'overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => onFilterChange({ ...filter, status: st })}
              className={`flex-1 sm:flex-none text-center px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition ${
                filter.status === st
                  ? st === 'overdue'
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Filter & Tags Toggle Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
              isExpanded || hasActiveFilters
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Filter & Tags</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="p-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 transition flex-shrink-0"
              title="Clear all active filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Collapsible Panel: Dropdowns & Tag Chips Wall */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
          
          {/* Dropdown selectors */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Goal vs Task Filter */}
            <select
              value={filter.goalFilter || 'all'}
              onChange={(e) => onFilterChange({ ...filter, goalFilter: e.target.value })}
              className="flex-1 sm:flex-none min-w-[140px] px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="all">All Goals & Tasks</option>
              <option value="goals-only">🎯 Top-level Goals Only</option>
              <option value="tasks-only">📋 Action Tasks Only</option>
            </select>

            <select
              value={filter.frequency}
              onChange={(e) => onFilterChange({ ...filter, frequency: e.target.value as FilterState['frequency'] })}
              className="flex-1 sm:flex-none min-w-[120px] px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="all">All Frequencies</option>
              <option value="one-time">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <select
              value={filter.sortBy}
              onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value as FilterState['sortBy'] })}
              className="flex-1 sm:flex-none min-w-[120px] px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Title</option>
              <option value="createdAt">Sort: Created</option>
            </select>
          </div>

          {/* Tag Wall Chips */}
          {availableTags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                Tag Wall Filter
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = filter.tags.includes(tag);
                  return (
                    <div
                      key={tag}
                      className={`group/tag flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className="font-mono text-left"
                      >
                        #{tag}
                      </button>
                      {onDeleteTagGlobally && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTagGlobally(tag);
                          }}
                          title={`Remove tag "#${tag}" from all tasks`}
                          className={`p-0.5 rounded transition ${
                            isSelected
                              ? 'text-white/70 hover:text-white hover:bg-white/20'
                              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 opacity-70 sm:opacity-0 group-hover/tag:opacity-100'
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Results Count Line */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
        <span>
          Showing <strong className="text-indigo-400 font-bold">{filteredTaskCount}</strong> of{' '}
          <strong className="text-slate-300">{totalTaskCount}</strong> active items
        </span>
        {hasActiveFilters && <span className="text-amber-400 font-semibold">• Active Filters</span>}
      </div>

    </div>
  );
};
