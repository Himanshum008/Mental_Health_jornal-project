import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookHeart, 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  Calendar, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Dynamic AI-Powered Emotional Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Write Freely. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Understand Your Mind Deeply.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A safe, private sanctuary to journal your thoughts. SereneMind uses real-time machine learning to detect emotional nuances, uncover mood trends, and foster compassionate self-reflection.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 text-base group"
            >
              <span>Begin Your Journal Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-base"
            >
              Sign In to Your Space
            </Link>
          </div>

          {/* Highlights bar */}
          <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Private & Secure</p>
            </div>
            <div className="p-2">
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">Real-Time</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mood Detection</p>
            </div>
            <div className="p-2">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">Dynamic</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">ML Training Studio</p>
            </div>
            <div className="p-2">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">Interactive</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Calendar & Streaks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Designed For Mental Clarity & Scientific Insight
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Transform unstructured journal entries into actionable emotional awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Multi-Class Mood Analysis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Detect Joy, Sadness, Anger, Fear, Anxiety, Calm, and Neutral emotions with confidence scoring and probability distributions upon every entry.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Dynamic ML Model Studio
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Train Logistic Regression, Naive Bayes, or SVM classifiers on custom CSV datasets. Evaluate with confusion matrices and activate models on the fly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Mood Calendar & Streak Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Build healthy emotional journaling habits. Track contiguous journaling streaks, explore visual calendar heatmaps, and monitor weekly trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SereneMind — Mental Health Journal & Dynamic ML Platform. Crafted for wellness & reflection.</p>
        </div>
      </footer>
    </div>
  );
};
