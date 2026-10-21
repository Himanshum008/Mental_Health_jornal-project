import React from 'react';
import { Smile, Frown, Flame, ShieldAlert, Coffee, Sparkles, MinusCircle, HeartHandshake } from 'lucide-react';

const MOOD_CONFIG = {
  joy: {
    label: 'Joy',
    bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    icon: Smile,
  },
  happy: {
    label: 'Happy',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    icon: Smile,
  },
  calm: {
    label: 'Calm',
    bg: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    icon: Coffee,
  },
  peaceful: {
    label: 'Peaceful',
    bg: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    icon: Coffee,
  },
  sadness: {
    label: 'Sadness',
    bg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    icon: Frown,
  },
  sad: {
    label: 'Sad',
    bg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    icon: Frown,
  },
  anger: {
    label: 'Anger',
    bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    icon: Flame,
  },
  anxiety: {
    label: 'Anxiety',
    bg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: ShieldAlert,
  },
  fear: {
    label: 'Fear',
    bg: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    icon: ShieldAlert,
  },
  surprise: {
    label: 'Surprise',
    bg: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800',
    icon: Sparkles,
  },
  neutral: {
    label: 'Neutral',
    bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: MinusCircle,
  },
};

export const MoodBadge = ({ mood = 'Neutral', size = 'md', confidence = null }) => {
  const key = (mood || '').toLowerCase().trim();
  const config = MOOD_CONFIG[key] || {
    label: mood || 'Neutral',
    bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: MinusCircle,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : size === 'lg' 
      ? 'px-3.5 py-1.5 text-sm gap-2 font-semibold' 
      : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {confidence !== null && (
        <span className="opacity-75 font-mono text-[10px]">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
};
