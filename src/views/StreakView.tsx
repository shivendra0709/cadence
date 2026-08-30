import React from 'react';
import {
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';

export const StreakView: React.FC = () => {
  const { user, getConsistencyStats } = useCadence();
  const stats = getConsistencyStats();
  const threshold = user?.consistencyThreshold || 70;

  const milestones = [
    { days: 7, name: '7-Day Catalyst', icon: Zap },
    { days: 14, name: '14-Day Momentum', icon: Flame },
    { days: 30, name: '30-Day Architect', icon: Award },
    { days: 100, name: '100-Day Unstoppable', icon: Shield },
  ].map(m => {
    const unlocked = stats.bestStreak >= m.days;
    const current = stats.currentStreak;
    const progress = current < m.days ? `${current} / ${m.days} days (${m.days - current} to go)` : 'Achieved';
    return { ...m, unlocked, progress, date: 'Lifetime' };
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>Active Streak Momentum</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Streak Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Celebrate sustained execution and unlock productivity milestone badges.
        </p>
      </div>

      {/* Hero Streak Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-transparent to-violet-500/10 text-center space-y-4 relative overflow-hidden">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 animate-bounce">
          <Flame className="w-10 h-10" />
        </div>

        <div>
          <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
            {stats.currentStreak} DAYS
          </div>
          <p className="text-sm font-semibold text-amber-300 mt-1">
            Unbroken Rhythm • Next milestone in 2 days!
          </p>
        </div>

        <div className="max-w-md mx-auto p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-300 leading-relaxed">
          You've completed at least <span className="font-bold text-cyan-300">{threshold}%</span> of your daily tasks for $${stats.currentStreak} consecutive days.
        </div>
      </div>

      {/* 3 Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Current Run
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            🔥 {stats.currentStreak} Days
          </div>
          <div className="text-xs text-neutral-400">Ongoing</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            All-Time Longest
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {stats.bestStreak} Days
          </div>
          <div className="text-xs text-neutral-400">Lifetime best</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Qualification Target
          </span>
          <div className="text-2xl font-bold font-mono text-violet-300">
            {threshold}% Daily
          </div>
          <div className="text-xs text-neutral-400">Streak threshold requirement</div>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Milestone Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.days}
                className={`p-5 rounded-2xl border transition-all text-center space-y-3 ${
                  m.unlocked
                    ? 'glass-card border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                    m.unlocked ? 'bg-amber-500 text-neutral-950 shadow-md' : 'bg-white/5 text-neutral-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-100">{m.name}</h4>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {m.unlocked ? `Unlocked on ${m.date}` : m.progress}
                  </p>
                </div>

                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    m.unlocked
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  {m.unlocked ? 'Achieved' : 'In Progress'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
