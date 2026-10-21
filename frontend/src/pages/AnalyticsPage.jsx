import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { MoodBadge } from '../components/MoodBadge';
import { 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Calendar as CalendarIcon, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

export const AnalyticsPage = () => {
  const [trends, setTrends] = useState([]);
  const [summary, setSummary] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [trendsData, overviewData, calData] = await Promise.all([
          api.getMoodTrends(),
          api.getAnalyticsOverview(),
          api.getMoodCalendar(currentYear, currentMonth),
        ]);
        setTrends(trendsData || []);
        setSummary(overviewData || null);
        setCalendarData(calData || null);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [currentYear, currentMonth]);

  // Sentiment chart data
  const sentimentData = [
    { name: 'Positive', value: summary?.positiveCount || 0, color: '#10b981' },
    { name: 'Neutral', value: summary?.neutralCount || 0, color: '#94a3b8' },
    { name: 'Negative', value: summary?.negativeCount || 0, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  // Emotion distribution data
  const emotionData = summary?.moodDistribution
    ? Object.entries(summary.moodDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Helper for generating monthly calendar grid
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <LineChartIcon className="w-6 h-6 text-emerald-600" />
            <span>Emotional Trends & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual representations of your sentiment progression, mood radar, and monthly activity.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start sm:self-auto">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <div className="text-xs">
            <span className="text-slate-400 block font-medium">Habit Streak</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {summary?.currentStreakDays || 0} Days Running
            </span>
          </div>
        </div>
      </div>

      {/* Primary Mood Trendline Area Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Mood Score Progression (Last 30 Days)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Score ranges from -1.0 (Reflective/Negative) to +1.0 (Positive/Joyful)
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Record a few daily entries to reveal your timeline progression.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val, name, props) => [
                    `Score: ${val} (Dominant: ${props.payload.dominantMood})`,
                    'Mood Score'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="moodScore"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Two Column Grid: Sentiment Breakdown & Emotion Frequencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sentiment Donut Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-teal-600" />
            <span>Sentiment Polarity Breakdown</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ratio of Positive, Neutral, and Negative sentiments recorded.
          </p>

          <div className="h-56 w-full flex items-center justify-center">
            {sentimentData.length === 0 ? (
              <span className="text-xs text-slate-400">No sentiment data available.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Positive ({summary?.positiveCount || 0})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Neutral ({summary?.neutralCount || 0})</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Negative ({summary?.negativeCount || 0})</span>
            </div>
          </div>
        </div>

        {/* Emotion Frequencies Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Emotion Category Frequency</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Frequency distribution of emotional states identified by the active ML model.
          </p>

          <div className="h-56 w-full">
            {emotionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No emotion frequencies recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Visual Mood Heatmap Calendar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span>Interactive Monthly Mood Calendar</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each colored square maps your mental wellness on that day.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
              {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="font-semibold text-slate-400 pb-1">
              {d}
            </div>
          ))}

          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 rounded-xl bg-slate-50/40 dark:bg-slate-800/20"></div>
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayEntry = calendarData?.days?.[dateStr];

            let cellBg = 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800';
            if (dayEntry) {
              if (dayEntry.sentiment === 'POSITIVE') {
                cellBg = 'bg-emerald-500/15 border-emerald-400/50 text-emerald-900 dark:text-emerald-300';
              } else if (dayEntry.sentiment === 'NEGATIVE') {
                cellBg = 'bg-rose-500/15 border-rose-400/50 text-rose-900 dark:text-rose-300';
              } else {
                cellBg = 'bg-slate-500/15 border-slate-400/50 text-slate-800 dark:text-slate-300';
              }
            }

            return (
              <div
                key={dayNum}
                className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between transition-all ${cellBg}`}
                title={dayEntry ? `${dateStr}: ${dayEntry.title} (${dayEntry.mood})` : `${dateStr}: No entries`}
              >
                <span className="font-bold text-[11px] self-start opacity-70">
                  {dayNum}
                </span>
                {dayEntry && (
                  <div className="mt-auto">
                    <span className="text-[10px] font-bold block truncate">
                      {dayEntry.mood}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mental Wellness Guidance Note */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Wellness Notice:</strong> SereneMind analyzes linguistic patterns to foster self-awareness. It does not provide medical diagnoses or replace licensed clinical therapy. If experiencing distress, reach out to trusted mental wellness professionals.
        </p>
      </div>

    </div>
  );
};
