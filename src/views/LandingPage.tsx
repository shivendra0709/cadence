import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  BarChart3,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import { CadenceLogo, CadenceMark } from '../components/brand/BrandLogo';
import { APP_TAGLINE } from '../config/brand';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-violet-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-cyan-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-2/3 -right-40 w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 glass-panel backdrop-blur-2xl px-6 py-4 flex items-center justify-between">
        <CadenceLogo size="md" />

        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-xs font-semibold text-neutral-300 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center space-y-12">
        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Next-Generation Rhythm & Productivity Platform</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Build your <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">rhythm.</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Plan your work, track your progress, and turn consistency into momentum. Daily tasks, work progress, streaks, and analytics in one cohesive workspace.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group"
          >
            <span>Start Building Your Rhythm</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-card hover:bg-white/5 text-neutral-200 font-semibold text-sm transition-colors border border-white/15"
          >
            Sign In to Cadence
          </button>
        </div>

        {/* Interactive Dashboard Preview Frame */}
        <div className="w-full pt-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.8)]">
            <div className="rounded-2xl glass-panel p-4 sm:p-6 text-left space-y-6 overflow-hidden">
              {/* Header preview bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <CadenceMark size="sm" />
                  <div>
                    <div className="text-xs font-bold text-neutral-200">Good morning, Shivendra</div>
                    <div className="text-[11px] text-neutral-400">Here's your rhythm for today.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> 12 Days
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    87% Consistency
                  </span>
                </div>
              </div>

              {/* Sample cards preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl glass-card border border-white/5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase">Projects</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">4 Active</div>
                </div>
                <div className="p-3.5 rounded-xl glass-card border border-white/5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase">Tasks</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">18 Remaining</div>
                </div>
                <div className="p-3.5 rounded-xl glass-card border border-white/5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase">Consistency</span>
                  <div className="text-xl font-bold font-mono text-violet-400 mt-1">87% (30d)</div>
                </div>
                <div className="p-3.5 rounded-xl glass-card border border-white/5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase">Streak</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">🔥 12 Days</div>
                </div>
              </div>

              {/* Sample Today tasks checklist */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Today's Rhythm (Saturday, August 29)</span>
                  <span className="text-cyan-400 font-mono">5 / 6 Completed (83%)</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[83%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Core Feature Pillars */}
        <div className="w-full pt-16 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Engineered for Daily Momentum</h2>
            <p className="text-sm text-neutral-400">Everything you need to plan, execute, and sustain your highest productivity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Plan Your Day</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Prioritize high-impact tasks, set scheduled focus times, start interactive stopwatches, and monitor your real-time daily completion rhythm.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Track Your Progress</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Manage projects with multi-stage Kanban boards, log focused time, record progress histories, and detect at-risk work before deadlines.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Measure Consistency</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Transparent mathematical formulas showing your daily, 7-day, and 30-day consistency scores with GitHub-style interactive heatmaps.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Build Your Streak</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Set custom daily thresholds (e.g. 70%) to qualify your streak. Turn consistent execution into unbreakable habit momentum.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3 md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Understand Your Performance</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Deep analytical insights with completion velocity charts, category breakdowns (DSA, Projects, Fitness, Study), and total focus time tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="w-full py-16 border-t border-white/5 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Start building your rhythm today.
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            Join thousands of developers and teams executing with clarity and continuous momentum.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 inline-flex items-center gap-2"
          >
            <span>Enter Cadence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-neutral-500">
        <p>© 2026 Cadence Inc. All rights reserved. Build your rhythm.</p>
      </footer>
    </div>
  );
};
