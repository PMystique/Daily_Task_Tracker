import React from 'react';
import { Target, CheckCircle2, Clock, Zap, ChevronRight, BarChart3 } from 'lucide-react';
import { Task, RoutineItem } from '../types';

interface CompactMetricRibbonProps {
  tasks: Task[];
  routines: RoutineItem[];
  onOpenFullAnalytics: () => void;
}

export const CompactMetricRibbon: React.FC<CompactMetricRibbonProps> = ({
  tasks,
  routines,
  onOpenFullAnalytics,
}) => {
  const totalTasks = tasks.filter((t) => !t.isGoal).length;
  const completedTasks = tasks.filter((t) => !t.isGoal && t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalGoals = tasks.filter((t) => t.isGoal).length;
  const completedGoals = tasks.filter((t) => t.isGoal && t.status === 'completed').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingToday = tasks.filter(
    (t) => !t.isGoal && t.status === 'pending' && (t.dueDate === todayStr || !t.dueDate)
  ).length;

  return (
    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
      
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        
        {/* Metric 1: Action Tasks Rate */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Action Rate</div>
            <div className="font-mono font-black text-white text-xs">
              {completionRate}% <span className="text-[10px] font-normal text-slate-400">({completedTasks}/{totalTasks})</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Goals */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Goals Progress</div>
            <div className="font-mono font-black text-white text-xs">
              {completedGoals}/{totalGoals} <span className="text-[10px] font-normal text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Due Today */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today's Focus</div>
            <div className="font-mono font-black text-amber-300 text-xs">
              {pendingToday} <span className="text-[10px] font-normal text-slate-400">Pending</span>
            </div>
          </div>
        </div>

      </div>

      {/* Full Analytics Button */}
      <button
        onClick={onOpenFullAnalytics}
        className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-1.5 transition ml-auto"
      >
        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
        <span>Deep Analytics</span>
        <ChevronRight className="w-3 h-3 text-slate-500" />
      </button>

    </div>
  );
};
