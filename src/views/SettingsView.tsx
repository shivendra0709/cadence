import { getDateStr } from '../utils/dateUtils';
import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Flame,
  Bell,
  Volume2,
  Database,
  Download,
  Trash2,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, user, updateUser, dailyTasksMap, projects, tasks } = useCadence();

  const [threshold, setLocalThreshold] = useState(user?.consistencyThreshold || 70);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [streakWarnings, setStreakWarnings] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [saveBanner, setSaveBanner] = useState(false);

  const handleSaveThreshold = (val: number) => {
    setLocalThreshold(val);
    updateUser({ consistencyThreshold: val });
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user,
      projects,
      tasks,
      dailyTasksMap,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadence_backup_${getDateStr(new Date())}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Customize your theme, consistency thresholds, and notifications.
        </p>
      </div>

      {saveBanner && (
        <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 font-bold animate-in fade-in duration-150">
          <Check className="w-4 h-4" />
          <span>Settings updated successfully.</span>
        </div>
      )}

      {/* 1. Appearance Theme */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            Appearance Theme
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select your preferred visual atmosphere.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'glass-card border-white/5 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Dark Obsidian (Recommended)</span>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Deep frosted glass aesthetics with vibrant electric cyan and violet rhythm accents.
            </p>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'glass-card border-white/5 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Light Horizon</span>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Crisp light backdrop with high-contrast slate surfaces and glassmorphic reflections.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Consistency Threshold */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Daily Consistency Target
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure the required task completion percentage to extend your daily streak.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">Streak Threshold:</span>
            <span className="text-2xl font-black font-mono text-cyan-400">{threshold}%</span>
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
            <span>50% (Gentle)</span>
            <span className="text-cyan-300 font-bold">70% (Standard)</span>
            <span>95% (Hardcore)</span>
          </div>
        </div>
      </div>

      {/* 3. Notifications & Feedback */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400" />
            Notification & Audio Feedback
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage alerts and micro-interactions.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/5 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Morning Planning Reminder</span>
              <span className="text-[11px] text-neutral-400">Receive an alert at 9:00 AM to review your daily rhythm.</span>
            </div>
            <input
              type="checkbox"
              checked={dailyReminders}
              onChange={(e) => setDailyReminders(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-900 border-white/20 accent-cyan-400"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/5 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Streak At-Risk Warning</span>
              <span className="text-[11px] text-neutral-400">Alert me at 8:00 PM if my streak qualification is below target.</span>
            </div>
            <input
              type="checkbox"
              checked={streakWarnings}
              onChange={(e) => setStreakWarnings(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-900 border-white/20 accent-cyan-400"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/5 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Celebration Confetti</span>
              <span className="text-[11px] text-neutral-400">Display micro-particle confetti upon task completion.</span>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-900 border-white/20 accent-cyan-400"
            />
          </label>
        </div>
      </div>

      {/* 4. Data Backup & Export */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Data Backup & Portability
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Export all your tasks, project progress logs, and streak metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-semibold border border-white/5 transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export All Data (.JSON)</span>
        </button>
      </div>
    </div>
  );
};
