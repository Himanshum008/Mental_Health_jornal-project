import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtext }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-800',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-800',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-800',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-800',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </h3>
          {subtext && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
