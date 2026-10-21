import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/apiClient';
import { MoodBadge } from '../components/MoodBadge';
import { 
  PenSquare, 
  Sparkles, 
  Save, 
  Calendar, 
  Tag, 
  Smile, 
  CheckCircle, 
  ArrowLeft, 
  Activity,
  HeartHandshake,
  Zap
} from 'lucide-react';

export const NewJournalPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userSelectedMood, setUserSelectedMood] = useState(searchParams.get('mood') || 'Neutral');
  const [tags, setTags] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  const [saving, setSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [activeModelInfo, setActiveModelInfo] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [livePreview, setLivePreview] = useState(null);

  useEffect(() => {
    const fetchActiveModel = async () => {
      try {
        const ping = await api.predictMood("Active model discovery ping");
        if (ping && (ping.model_name || ping.model_version)) {
          setActiveModelInfo(`${ping.model_name || 'Active Classifier'} (${ping.model_version || 'active'})`);
        }
      } catch (err) {
        console.log("Active model status check:", err);
      }
    };
    fetchActiveModel();
  }, []);

  const handlePreviewMood = async () => {
    if (!content.trim()) return;
    setPreviewing(true);
    try {
      const res = await api.predictMood(content);
      setLivePreview(res);
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setPreviewing(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write some thoughts before saving.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await api.createJournal({
        title: title.trim() || 'Daily Reflection',
        content,
        userSelectedMood,
        tags,
        entryDate,
      });

      setAnalysisResult(response.moodAnalysis);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Failed to save and analyze journal entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          {activeModelInfo && (
            <div className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-2 text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-purple-700 dark:text-purple-300 font-medium">
                Active AI Model: <strong className="font-semibold">{activeModelInfo}</strong>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title Input */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <input
            type="text"
            maxLength={200}
            placeholder="Journal Title (e.g., Morning Thoughts, A Day in the Park)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />

          {/* Metadata Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none text-xs"
              />
            </div>

            {/* Self-selected Mood Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <Smile className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">How I feel:</span>
              <select
                value={userSelectedMood}
                onChange={(e) => setUserSelectedMood(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-white font-medium focus:outline-none text-xs"
              >
                <option value="Joy">Joyful / Happy</option>
                <option value="Calm">Calm / Peaceful</option>
                <option value="Neutral">Neutral</option>
                <option value="Anxiety">Anxious / Nervous</option>
                <option value="Sadness">Sad / Down</option>
                <option value="Anger">Angry / Frustrated</option>
                <option value="Fear">Fearful / Scared</option>
                <option value="Surprise">Surprised / Amazed</option>
              </select>
            </div>

            {/* Tags Input */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-1 min-w-[200px]">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tags (e.g. college, exams, health, gratitude)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none text-xs"
              />
            </div>

          </div>
        </div>

        {/* Content Textarea */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <textarea
            required
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pour your heart and mind out here. Describe your experiences, emotional reactions, worries, or triumphs. The AI analyzer will discern underlying mood subtleties and provide supportive reflection..."
            className="w-full bg-transparent resize-y text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none text-sm sm:text-base leading-relaxed"
          ></textarea>

          {/* Bottom Action */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Active Model: <strong className="text-purple-600 dark:text-purple-400 font-semibold">{activeModelInfo || 'Dynamic ML'}</strong></span>
              </span>

              <button
                type="button"
                onClick={handlePreviewMood}
                disabled={previewing || !content.trim()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {previewing ? (
                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                )}
                <span>Instant Mood Preview</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing with Active Model...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Analyze Mood</span>
                </>
              )}
            </button>
          </div>

          {/* Live Active Model Preview Card */}
          {livePreview && (
            <div className="mt-4 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 animate-slide-up space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    Live Active Model Preview:
                  </span>
                  <MoodBadge mood={livePreview.predicted_mood} size="sm" />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    livePreview.sentiment === 'POSITIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : livePreview.sentiment === 'NEGATIVE'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {livePreview.sentiment}
                  </span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">
                  Certainty: {Math.round((livePreview.confidence || 0) * 100)}%
                </span>
              </div>

              {livePreview.reflection_insight && (
                <p className="text-slate-600 dark:text-slate-300 italic border-l-2 border-purple-400 pl-2">
                  "{livePreview.reflection_insight}"
                </p>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Analysis Result Modal */}
      {showModal && analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Journal Analyzed Successfully
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                Model: {analysisResult.modelVersionUsed || 'Active ML'}
              </span>
            </div>

            {/* Mood & Sentiment Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-50/50 via-teal-50/30 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/30 border border-emerald-100 dark:border-emerald-950 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Detected Dominant Mood
                </p>
                <div className="flex items-center gap-2">
                  <MoodBadge mood={analysisResult.predictedMood} size="lg" />
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    analysisResult.sentiment === 'POSITIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : analysisResult.sentiment === 'NEGATIVE'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {analysisResult.sentiment}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Certainty</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {Math.round((analysisResult.confidenceScore || 0.85) * 100)}%
                </p>
              </div>
            </div>

            {/* Probability Breakdown */}
            {analysisResult.emotionScores && Object.keys(analysisResult.emotionScores).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Emotional Spectrum Breakdown
                </p>
                <div className="space-y-1.5">
                  {Object.entries(analysisResult.emotionScores).slice(0, 5).map(([emotion, score]) => {
                    const pct = Math.round(Number(score) * 100);
                    return (
                      <div key={emotion} className="text-xs">
                        <div className="flex justify-between mb-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{emotion}</span>
                          <span className="text-slate-500">{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Therapeutic Reflection Insight */}
            {analysisResult.aiReflectionInsight && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Therapeutic Reflection Question</span>
                </div>
                <p className="text-xs text-purple-900 dark:text-purple-200 italic leading-relaxed">
                  "{analysisResult.aiReflectionInsight}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Go to History
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
