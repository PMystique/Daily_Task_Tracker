import React, { useState } from 'react';
import { Category } from '../types';
import { 
  Layers, 
  Target,
  Heart, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Rocket, 
  Activity, 
  BookOpen, 
  Sunrise, 
  Calendar as CalendarIcon, 
  BarChart3,
  CheckSquare,
  Plus,
  Tag,
  X,
  RotateCcw
} from 'lucide-react';
import { CustomCategory } from '../utils/storage';

export type MainViewMode = 'goals' | 'tasks' | 'routines' | 'calendar' | 'analytics';

interface CategoryTabsProps {
  activeView: MainViewMode;
  onSelectView: (view: MainViewMode) => void;
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  categoryCounts: Record<Category | 'all', number>;
  customCategories?: CustomCategory[];
  removedDefaultCategoryIds?: string[];
  onAddCustomCategory?: (name: string) => void;
  onRemoveCategory?: (categoryId: string) => void;
  onRestoreDefaultCategories?: () => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeView,
  onSelectView,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  customCategories = [],
  removedDefaultCategoryIds = [],
  onAddCustomCategory,
  onRemoveCategory,
  onRestoreDefaultCategories,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const builtInConfig: { id: Category | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Goals & Tasks', icon: <Target className="w-4 h-4 text-indigo-500" /> },
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

  return (
    <div className="space-y-4 mb-6">
      
      {/* Top Primary View Modes Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-full border border-slate-200/80 dark:border-slate-700/60">
        <button
          onClick={() => onSelectView('goals')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeView === 'goals'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-500" />
          <span>Goals & Projects</span>
        </button>

        <button
          onClick={() => onSelectView('tasks')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeView === 'tasks'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-indigo-500" />
          <span>Action Tasks</span>
        </button>

        <button
          onClick={() => onSelectView('routines')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition relative ${
            activeView === 'routines'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sunrise className="w-4 h-4 text-amber-500" />
          <span>Routine Tracker</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
            AM / PM / WKD
          </span>
        </button>

        <button
          onClick={() => onSelectView('calendar')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeView === 'calendar'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-emerald-500" />
          <span>Calendar Sync</span>
        </button>

        <button
          onClick={() => onSelectView('analytics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeView === 'analytics'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <span>Progress & Analytics</span>
        </button>
      </div>

      {/* Category Tabs (Shown when activeView === 'tasks' or 'goals') */}
      {(activeView === 'tasks' || activeView === 'goals') && (
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          
          {/* Built-in Category Buttons */}
          {builtInConfig
            .filter((cat) => cat.id === 'all' || !removedDefaultCategoryIds.includes(cat.id))
            .map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              const canRemove = cat.id !== 'all' && onRemoveCategory;

              return (
                <div
                  key={cat.id}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="flex items-center gap-1.5"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => onRemoveCategory(cat.id)}
                      title={`Remove "${cat.label}" category`}
                      className={`p-0.5 rounded-md transition ${
                        isSelected
                          ? 'text-white/70 hover:text-white hover:bg-white/20'
                          : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-70 sm:opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

          {/* Custom Category Buttons */}
          {customCategories.map((customCat) => {
            const isSelected = selectedCategory === customCat.id;
            const count = categoryCounts[customCat.id] || 0;

            return (
              <div
                key={customCat.id}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectCategory(customCat.id)}
                  className="flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{customCat.label}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
                {onRemoveCategory && (
                  <button
                    type="button"
                    onClick={() => onRemoveCategory(customCat.id)}
                    title={`Remove "${customCat.label}" category`}
                    className={`p-0.5 rounded-md transition ${
                      isSelected
                        ? 'text-white/70 hover:text-white hover:bg-white/20'
                        : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-70 sm:opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Custom Category Trigger */}
          {isAdding ? (
            <form onSubmit={handleCreateCategory} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-indigo-500">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name..."
                autoFocus
                className="px-2 py-0.5 text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none w-28"
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          )}

          {/* Restore Defaults Trigger if any default categories were removed */}
          {removedDefaultCategoryIds.length > 0 && onRestoreDefaultCategories && (
            <button
              onClick={onRestoreDefaultCategories}
              title="Restore default categories"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Defaults ({removedDefaultCategoryIds.length})</span>
            </button>
          )}

        </div>
      )}

    </div>
  );
};
