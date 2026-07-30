import React, { useState } from 'react';
import { Category } from '../types';
import { MainViewMode } from './CategoryTabs';
import { 
  CheckSquare, 
  Target,
  Sunrise, 
  Calendar, 
  BarChart3, 
  Tag, 
  Layers, 
  Heart, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  TrendingUp,
  Users,
  Rocket,
  Activity,
  BookOpen,
  Plus,
  X,
  RotateCcw
} from 'lucide-react';
import { CustomCategory } from '../utils/storage';

interface SidebarNavProps {
  activeView: MainViewMode;
  onSelectView: (view: MainViewMode) => void;
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  categoryCounts: Record<Category | 'all', number>;
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  completedTasksCount: number;
  totalTasksCount: number;
  goalsCount?: number;
  pushActive: boolean;
  customCategories?: CustomCategory[];
  removedDefaultCategoryIds?: string[];
  onAddCustomCategory?: (name: string) => void;
  onRemoveCategory?: (categoryId: string) => void;
  onRestoreDefaultCategories?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onSelectView,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  availableTags,
  selectedTags,
  onToggleTag,
  completedTasksCount,
  totalTasksCount,
  goalsCount = 0,
  pushActive,
  customCategories = [],
  removedDefaultCategoryIds = [],
  onAddCustomCategory,
  onRemoveCategory,
  onRestoreDefaultCategories,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const builtInCategories: { id: Category | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Tasks', icon: <Layers className="w-4 h-4 text-indigo-500" /> },
    { id: 'life', label: 'Life', icon: <Heart className="w-4 h-4 text-rose-500" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4 text-sky-500" /> },
    { id: 'school', label: 'School', icon: <GraduationCap className="w-4 h-4 text-amber-500" /> },
    { id: 'finance', label: 'Finance', icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
    { id: 'career', label: 'Career', icon: <TrendingUp className="w-4 h-4 text-purple-500" /> },
    { id: 'family-social', label: 'Family & Social', icon: <Users className="w-4 h-4 text-pink-500" /> },
    { id: 'side-hustle', label: 'Side Hustle', icon: <Rocket className="w-4 h-4 text-orange-500" /> },
    { id: 'health', label: 'Health', icon: <Activity className="w-4 h-4 text-teal-500" /> },
    { id: 'learning-skills', label: 'Learning & Skills', icon: <BookOpen className="w-4 h-4 text-blue-500" /> },
  ];

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !onAddCustomCategory) return;
    onAddCustomCategory(newCatName.trim());
    setNewCatName('');
    setIsAdding(false);
  };

  const completionPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col h-full flex-shrink-0 transition-colors duration-200">
      
      {/* Brand & Logo */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
            /developer
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
            v2.1
          </span>
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
          Daily Performance Tracker
        </p>
      </div>

      {/* Navigation & Section List */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto scrollbar-none">
        
        {/* Main Views Switcher */}
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 mb-2">
            Main Views
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectView('goals')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition ${
                activeView === 'goals'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>Goals & Projects</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                {goalsCount ?? 0}
              </span>
            </button>

            <button
              onClick={() => onSelectView('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition ${
                activeView === 'tasks'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                <span>Action Tasks</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {totalTasksCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('routines')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition ${
                activeView === 'routines'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-l-2 border-amber-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Sunrise className="w-4 h-4 text-amber-500" />
                <span>Routines</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400">
                Protocol
              </span>
            </button>

            <button
              onClick={() => onSelectView('calendar')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition ${
                activeView === 'calendar'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Calendar Sync</span>
              </div>
            </button>

            <button
              onClick={() => onSelectView('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition ${
                activeView === 'analytics'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-l-2 border-purple-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
            <span>Categories</span>
            <div className="flex items-center gap-2">
              {removedDefaultCategoryIds.length > 0 && onRestoreDefaultCategories && (
                <button
                  onClick={onRestoreDefaultCategories}
                  title="Restore default categories"
                  className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {isAdding && (
            <form onSubmit={handleCreateCategory} className="mb-2 flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-md border border-indigo-500">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New Category..."
                autoFocus
                className="px-2 py-0.5 text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none w-full"
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          )}

          <div className="space-y-1">
            {builtInCategories
              .filter((cat) => cat.id === 'all' || !removedDefaultCategoryIds.includes(cat.id))
              .map((cat) => {
                const isActive = activeView === 'tasks' && selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                const canRemove = cat.id !== 'all' && onRemoveCategory;

                return (
                  <div
                    key={cat.id}
                    className={`group flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500 rounded-r-md font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.id);
                        onSelectView('tasks');
                      }}
                      className="flex-1 flex items-center justify-between text-left min-w-0 mr-1"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {cat.icon}
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0 ml-1">
                        {count}
                      </span>
                    </button>
                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => onRemoveCategory(cat.id)}
                        title={`Remove "${cat.label}" category`}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

            {/* Custom Categories */}
            {customCategories.map((customCat) => {
              const isActive = activeView === 'tasks' && selectedCategory === customCat.id;
              const count = categoryCounts[customCat.id] || 0;

              return (
                <div
                  key={customCat.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500 rounded-r-md font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(customCat.id);
                      onSelectView('tasks');
                    }}
                    className="flex-1 flex items-center justify-between text-left min-w-0 mr-1"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Tag className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{customCat.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0 ml-1">
                      {count}
                    </span>
                  </button>
                  {onRemoveCategory && (
                    <button
                      type="button"
                      onClick={() => onRemoveCategory(customCat.id)}
                      title={`Remove "${customCat.label}" category`}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter by Tags */}
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
            <span>Filter by Tags</span>
            <Tag className="w-3 h-3 text-slate-500" />
          </div>
          <div className="flex flex-wrap gap-1.5 px-1">
            {['urgent', 'work', 'personal', 'clients', 'finance', 'health', 'meetings', 'deep-work', 'project'].map((tg) => {
              const isSelected = selectedTags.includes(tg);
              return (
                <button
                  key={tg}
                  onClick={() => onToggleTag(tg)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase transition font-mono ${
                    isSelected
                      ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  #{tg}
                </button>
              );
            })}

            {availableTags
              .filter((t) => !['urgent', 'work', 'personal', 'clients', 'finance', 'health', 'meetings', 'deep-work', 'project'].includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase transition font-mono ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
          </div>
        </div>

      </nav>

      {/* Bottom Status Panel */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900">
        <div className="flex items-center space-x-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
          <span className={`w-2 h-2 rounded-full ${pushActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>{pushActive ? 'Push Notifications Active' : 'Notifications Muted'}</span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        <div className="flex justify-between mt-1 text-[10px]">
          <span className="text-slate-500">Weekly Progress</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
            {completionPercent}%
          </span>
        </div>
      </div>

    </aside>
  );
};
