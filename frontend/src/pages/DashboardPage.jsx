import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import { StatCard } from '../components/StatCard';
import { MoodBadge } from '../components/MoodBadge';
import { 
  Flame, 
  BookHeart, 
  Sparkles, 
  PenSquare, 
  ArrowRight, 
  TrendingUp, 
  Smile, 
  Activity, 
  Calendar,
  Heart
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, journalsData] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getJournals({ page: 0, size: 4 })
        ]);
        setSummary(overviewData);
        setRecentEntries(journalsData.content || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const moodSelectors = [
    { label: 'Joyful', mood: 'Joy', icon: '☀️', color: 'hover:border-amber-400 hover:bg-amber-50' },
    { label: 'Calm', mood: 'Calm', icon: '🌿', color: 'hover:border-teal-400 hover:bg-teal-50' },
    { label: 'Neutral', mood: 'Neutral', icon: '☕', color: 'hover:border-slate-400 hover:bg-slate-50' },
    { label: 'Anxious', mood: 'Anxiety', icon: '🌊', color: 'hover:border-purple-400 hover:bg-purple-50' },
    { label: 'Down', mood: 'Sadness', icon: '🌧️', color: 'hover:border-blue-400 hover:bg-blue-50' },
    { label: 'Frustrated', mood: 'Anger', icon: '🔥', color: 'hover:border-rose-400 hover:bg-rose-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome Banner & Streak Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-8 shadow-xl shadow-emerald-700/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Wellness Check-in</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Hello, {user?.fullName || user?.username}!
            </h1>
            <p className="mt-1 text-emerald-100 text-sm sm:text-base max-w-xl">
              "Honoring what you feel today is the first courageous step toward mental clarity."
            </p>
          </div>

          {/* Streak Flame Counter */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center animate-bounce">
              <Flame className="w-7 h-7 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                Journaling Streak
              </p>
              <h2 className="text-2xl font-black text-white">
                {summary?.currentStreakDays || 0} {summary?.currentStreakDays === 1 ? 'Day' : 'Days'}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Mood Check-In Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>How are you feeling in this moment?</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your current mood to start a journal prompt
            </p>
          </div>
          <Link
            to="/journal/new"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write Entry</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {moodSelectors.map((item) => (
            <button
              key={item.mood}
              onClick={() => navigate(`/journal/new?mood=${item.mood}`)}
              className={`p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center transition-all ${item.color} group`}
            >
              <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Journals"
          value={summary?.totalEntries || 0}
          icon={BookHeart}
          color="emerald"
          subtext="Reflective entries recorded"
        />
        <StatCard
          title="Dominant Mood"
          value={summary?.dominantMood || 'Neutral'}
          icon={Smile}
          color="amber"
          subtext="Most frequent state"
        />
        <StatCard
          title="AI Confidence"
          value={summary?.averageConfidence ? `${Math.round(summary.averageConfidence * 100)}%` : '85%'}
          icon={Activity}
          color="purple"
          subtext="ML model certainty"
        />
        <StatCard
          title="Positive Sentiments"
          value={summary?.positiveCount || 0}
          icon={TrendingUp}
          color="blue"
          subtext={`${summary?.negativeCount || 0} negative / ${summary?.neutralCount || 0} neutral`}
        />
      </div>

      {/* Two-Column Section: Recent Entries & Daily Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Entries (Span 2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Recent Journal Entries</span>
            </h2>
            <Link
              to="/history"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading entries...</div>
          ) : recentEntries.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500 mb-3">No journal entries yet.</p>
              <Link
                to="/journal/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <PenSquare className="w-3.5 h-3.5" />
                Write Your First Journal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/history`}
                  className="block p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 dark:border-slate-800/80 dark:bg-slate-800/30 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {entry.title}
                    </h3>
                    <MoodBadge
                      mood={entry.moodAnalysis?.predictedMood || entry.userSelectedMood || 'Neutral'}
                      size="sm"
                      confidence={entry.moodAnalysis?.confidenceScore}
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{entry.entryDate}</span>
                    {entry.tags && (
                      <span className="truncate max-w-[200px]">🏷️ {entry.tags}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Daily Reflection Prompt Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border border-purple-100 dark:border-purple-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Daily Reflection Prompt
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic mb-4">
              "What is one small kindness you showed yourself or someone else today, and how did it change your perspective?"
            </p>
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-purple-200/50 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
              <p className="font-semibold">💡 Wellness Insight:</p>
              <p className="opacity-90">
                Self-compassion reduces cortisol levels and boosts emotional resilience against daily stressors.
              </p>
            </div>
          </div>

          <Link
            to="/journal/new"
            className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center text-purple-700 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300 transition-colors"
          >
            Answer in Today's Journal →
          </Link>
        </div>

      </div>
    </div>
  );
};
