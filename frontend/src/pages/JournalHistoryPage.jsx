import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import { MoodBadge } from '../components/MoodBadge';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  PenSquare, 
  Calendar, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

export const JournalHistoryPage = () => {
  const [journals, setJournals] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedJournal, setSelectedJournal] = useState(null);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const data = await api.getJournals({
        page,
        size: 8,
        search,
        mood: moodFilter === 'ALL' ? '' : moodFilter,
      });
      setJournals(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalEntries(data.totalElements || 0);
    } catch (err) {
      console.error("Failed to load journals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [page, moodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJournals();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      try {
        await api.deleteJournal(id);
        if (selectedJournal?.id === id) {
          setSelectedJournal(null);
        }
        fetchJournals();
      } catch (err) {
        alert(err.message || "Failed to delete entry");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-600" />
            <span>Journal Archives & Timeline</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse through your previous reflections, searchable by keywords or mood categories.
          </p>
        </div>

        <Link
          to="/journal/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PenSquare className="w-4 h-4" />
          <span>New Journal</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, titles, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        {/* Mood Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-400 font-semibold px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Mood:</span>
          </span>
          {['ALL', 'Joy', 'Calm', 'Neutral', 'Anxiety', 'Sadness', 'Anger'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMoodFilter(m);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                moodFilter === m
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading your journal timeline...</div>
      ) : journals.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No entries found matching your filters.
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search terms or write a new journal entry.
          </p>
          <Link
            to="/journal/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write Entry</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {journals.map((journal) => (
            <div
              key={journal.id}
              onClick={() => setSelectedJournal(journal)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/60 shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {journal.title}
                  </h3>
                  <MoodBadge
                    mood={journal.moodAnalysis?.predictedMood || journal.userSelectedMood || 'Neutral'}
                    size="sm"
                    confidence={journal.moodAnalysis?.confidenceScore}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {journal.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{journal.entryDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  {journal.tags && (
                    <span className="truncate max-w-[120px]">🏷️ {journal.tags}</span>
                  )}
                  <button
                    onClick={(e) => handleDelete(journal.id, e)}
                    title="Delete Entry"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Showing page {page + 1} of {totalPages} ({totalEntries} total entries)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  Recorded on {selectedJournal.entryDate}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedJournal.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mood Summary Card */}
            {selectedJournal.moodAnalysis && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Analyzed Mood
                    </span>
                    <MoodBadge mood={selectedJournal.moodAnalysis.predictedMood} size="md" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Sentiment
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      selectedJournal.moodAnalysis.sentiment === 'POSITIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : selectedJournal.moodAnalysis.sentiment === 'NEGATIVE'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                    }`}>
                      {selectedJournal.moodAnalysis.sentiment}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">AI Certainty</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {Math.round((selectedJournal.moodAnalysis.confidenceScore || 0.8) * 100)}%
                  </span>
                  {selectedJournal.moodAnalysis.modelVersionUsed && (
                    <span className="text-[10px] font-mono block text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                      {selectedJournal.moodAnalysis.modelVersionUsed}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Journal Content */}
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedJournal.content}
            </div>

            {/* Tags */}
            {selectedJournal.tags && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags: {selectedJournal.tags}</span>
              </div>
            )}

            {/* Reflection Prompt */}
            {selectedJournal.moodAnalysis?.aiReflectionInsight && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-xs">
                <p className="font-bold text-purple-700 dark:text-purple-300 mb-1">
                  💡 Therapeutic Reflection
                </p>
                <p className="italic text-purple-900 dark:text-purple-200">
                  "{selectedJournal.moodAnalysis.aiReflectionInsight}"
                </p>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedJournal(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
