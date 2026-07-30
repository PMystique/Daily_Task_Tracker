import React from 'react';
import { 
  Heart, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Rocket, 
  Activity, 
  BookOpen, 
  Tag 
} from 'lucide-react';
import { Category } from '../types';

export interface CategoryItem {
  id: Category;
  label: string;
  color: string; // tailwind color key or hex
  isCustom?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'life', label: 'Life', color: 'rose' },
  { id: 'work', label: 'Work', color: 'sky' },
  { id: 'school', label: 'School', color: 'amber' },
  { id: 'finance', label: 'Finance', color: 'emerald' },
  { id: 'career', label: 'Career', color: 'purple' },
  { id: 'family-social', label: 'Family & Social', color: 'pink' },
  { id: 'side-hustle', label: 'Side Hustle', color: 'orange' },
  { id: 'health', label: 'Health & Fitness', color: 'teal' },
  { id: 'learning-skills', label: 'Learning & Skills', color: 'blue' },
];

export const getCategoryIcon = (catId: Category): React.ReactNode => {
  switch (catId) {
    case 'life':
      return React.createElement(Heart, { className: 'w-4 h-4 text-rose-500' });
    case 'work':
      return React.createElement(Briefcase, { className: 'w-4 h-4 text-sky-500' });
    case 'school':
      return React.createElement(GraduationCap, { className: 'w-4 h-4 text-amber-500' });
    case 'finance':
      return React.createElement(DollarSign, { className: 'w-4 h-4 text-emerald-500' });
    case 'career':
      return React.createElement(TrendingUp, { className: 'w-4 h-4 text-purple-500' });
    case 'family-social':
      return React.createElement(Users, { className: 'w-4 h-4 text-pink-500' });
    case 'side-hustle':
      return React.createElement(Rocket, { className: 'w-4 h-4 text-orange-500' });
    case 'health':
      return React.createElement(Activity, { className: 'w-4 h-4 text-teal-500' });
    case 'learning-skills':
      return React.createElement(BookOpen, { className: 'w-4 h-4 text-blue-500' });
    default:
      return React.createElement(Tag, { className: 'w-4 h-4 text-indigo-500' });
  }
};

export const getCategoryLabel = (catId: Category, customCategories: CategoryItem[] = []): string => {
  const foundDefault = DEFAULT_CATEGORIES.find((c) => c.id === catId);
  if (foundDefault) return foundDefault.label;

  const foundCustom = customCategories.find((c) => c.id === catId);
  if (foundCustom) return foundCustom.label;

  // Capitalize hyphenated or raw strings
  return catId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  work: '#0284c7',
  career: '#8b5cf6',
  finance: '#10b981',
  life: '#f43f5e',
  school: '#f59e0b',
  'family-social': '#ec4899',
  'side-hustle': '#f97316',
  health: '#14b8a6',
  'learning-skills': '#3b82f6',
};
