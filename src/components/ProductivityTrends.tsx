import React from 'react';
import { Task } from '../types';

interface ProductivityTrendsProps {
  tasks: Task[];
}

export const ProductivityTrends: React.FC<ProductivityTrendsProps> = ({ tasks }) => {
  const days = [
    { label: 'Mon', height: 'h-[40%]', active: false },
    { label: 'Tue', height: 'h-[65%]', active: false },
    { label: 'Wed', height: 'h-[90%]', active: true },
    { label: 'Thu', height: 'h-[55%]', active: false },
    { label: 'Fri', height: 'h-[70%]', active: false },
    { label: 'Sat', height: 'h-[85%]', active: false },
    { label: 'Sun', height: 'h-[30%]', active: false },
  ];

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-b-xl transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Long-term Productivity Trends
        </h3>
        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
          Weekly Peak: Wed (+90%)
        </span>
      </div>

      <div className="flex items-end space-x-2 h-20 px-1">
        {days.map((day, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${
                day.active
                  ? 'bg-indigo-600 dark:bg-indigo-500 shadow-md shadow-indigo-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
              } ${day.height}`}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1">
        {days.map((d, i) => (
          <span key={i} className={d.active ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};
