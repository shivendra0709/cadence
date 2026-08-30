import React, { useState } from 'react';
import {
  Flame,
  TrendingUp,
  Calculator,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  Award,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';
import { DateHeatmap } from '../components/widgets/DateHeatmap';
import { motion, AnimatePresence } from 'motion/react';

export const ConsistencyView: React.FC = () => {
  const { user, getConsistencyStats, updateUser } = useCadence();
  const stats = getConsistencyStats();

  const [threshold, setLocalThreshold] = useState(user?.consistencyThreshold || 70);

  const handleSaveThreshold = (val: number) => {
    setLocalThreshold(val);
    updateUser({ consistencyThreshold: val });
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mathematical Rhythm Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Consistency Rhythm
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track daily momentum, understand your score formulas, and protect your streak.
          </p>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Current Streak
          </span>
          <div className="text-3xl font-extrabold font-mono text-amber-400 flex items-center gap-1.5">
            <span>🔥 {stats.currentStreak}</span>
            <span className="text-sm font-normal text-neutral-400">days</span>
          </div>
          <div className="text-xs text-neutral-400">Active continuous momentum</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Best Streak
          </span>
          <div className="text-3xl font-extrabold font-mono text-cyan-300 flex items-center gap-1.5">
            <span>{stats.bestStreak}</span>
            <span className="text-sm font-normal text-neutral-400">days</span>
          </div>
          <div className="text-xs text-neutral-400">All-time personal record</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            7-Day Score
          </span>
          <div className="text-3xl font-extrabold font-mono text-violet-300">
            {stats.sevenDayAverage}%
          </div>
          <div className="text-xs text-neutral-400">Recent rolling week</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            30-Day Score
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {stats.thirtyDayScore}%
          </div>
          <div className="text-xs text-neutral-400">Monthly aggregate</div>
        </div>
      </div>

      {/* GitHub-Style Heatmap */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Rhythm Heatmap
            </h3>
            <p className="text-xs text-neutral-400">
              Interactive historical log. Click any cell to inspect that day's scheduled tasks and duration.
            </p>
          </div>
        </div>

        <DateHeatmap daysCount={42} />
      </div>

      {/* Transparent Calculation Breakdown */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">Transparent Formula Engine</h3>
            <p className="text-xs text-neutral-400">
              No black-box algorithms. Cadence calculates consistency directly from your planned vs completed tasks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Formula */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Today's Rhythm Formula
            </span>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-neutral-200">
              (5 Completed / 6 Planned) × 100
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-neutral-400">Calculated Score:</span>
              <span className="font-mono font-bold text-cyan-300">83.3%</span>
            </div>
          </div>

          {/* 7-Day Formula */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 font-mono">
              7-Day Average Formula
            </span>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-neutral-200">
              (34 Completed / 40 Planned) × 100
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-neutral-400">Calculated Score:</span>
              <span className="font-mono font-bold text-violet-300">85.0%</span>
            </div>
          </div>

          {/* 30-Day Formula */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              30-Day Aggregate Formula
            </span>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-neutral-200">
              (142 Completed / 164 Planned) × 100
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-neutral-400">Calculated Score:</span>
              <span className="font-mono font-bold text-emerald-400">86.6% → 87%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance & Consistency Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white">Category Consistency</h3>
          <p className="text-xs text-neutral-400">Performance breakdown by discipline.</p>

          <div className="space-y-3 pt-1">
            {[
              { name: 'DSA & Algorithms', rate: 94, color: '#06b6d4' },
              { name: 'College Study', rate: 92, color: '#3b82f6' },
              { name: 'Side Projects & Shipping', rate: 88, color: '#8b5cf6' },
              { name: 'Fitness & Health', rate: 81, color: '#10b981' },
              { name: 'Reading & Synthesis', rate: 67, color: '#f59e0b' },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-neutral-300">{cat.name}</span>
                  <span className="font-bold text-white">{cat.rate}%</span>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.rate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consistency Threshold Config */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Streak Threshold Target</h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Adjust the minimum percentage of daily planned tasks required to count toward your consecutive day streak.
          </p>

          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-4 text-center">
            <div className="text-4xl font-extrabold font-mono text-cyan-400 flex items-center justify-center gap-1.5">
              <span>{threshold}%</span>
              <Flame className="w-6 h-6 text-amber-400" />
            </div>

            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => handleSaveThreshold(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
              <span>50%</span>
              <span className="text-cyan-300 font-bold">70% (Standard)</span>
              <span>95%</span>
            </div>

            <p className="text-xs text-neutral-400 text-left pt-2 border-t border-white/5">
              Current rule: On any day with planned tasks, completing <span className="font-bold text-white">{threshold}%</span> or higher extends your streak by +1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
