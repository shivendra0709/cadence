import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Flame, X } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';
import { DailyTask } from '../../types';
import { getTodayStr, getDateStr } from '../../utils/dateUtils';

interface DateHeatmapProps {
  daysCount?: number; // e.g. 35, 45, or 60 days
  onSelectDate?: (date: string) => void;
}

export const DateHeatmap: React.FC<DateHeatmapProps> = ({
  daysCount = 42,
  onSelectDate,
}) => {
  const { dailyTasksMap, user } = useCadence();
  const threshold = user?.consistencyThreshold || 70;
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: string;
    formattedDate: string;
    planned: number;
    completed: number;
    rate: number;
    tasks: DailyTask[];
  } | null>(null);

  const baseDate = new Date(); // Target base date

  // Generate grid days in chronological order
  const days = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = getDateStr(d);
    const tasks = dailyTasksMap[dateStr] || [];
    const planned = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const rate = planned > 0 ? Math.round((completed / planned) * 100) : 0;

    days.push({
      date: dateStr,
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      planned,
      completed,
      rate,
      tasks,
      qualified: rate >= threshold,
    });
  }

  // Get color style based on intensity
  const getIntensityClass = (rate: number, planned: number) => {
    if (planned === 0 || rate === 0) return 'bg-white/[0.04] border-white/[0.05] hover:border-white/20';
    if (rate <= 20) return 'bg-cyan-950/70 border-cyan-900/50 text-cyan-400 hover:border-cyan-400';
    if (rate <= 40) return 'bg-cyan-900/80 border-cyan-700/60 text-cyan-300 hover:border-cyan-400';
    if (rate <= 60) return 'bg-cyan-700/90 border-cyan-500/70 text-cyan-200 hover:border-cyan-300';
    if (rate <= 80) return 'bg-cyan-500 border-cyan-300 text-neutral-950 hover:border-white shadow-[0_0_8px_rgba(6,182,212,0.4)]';
    return 'bg-gradient-to-tr from-cyan-400 to-violet-400 border-white text-neutral-950 shadow-[0_0_12px_rgba(139,92,246,0.5)]';
  };

  const handleCellClick = (day: (typeof days)[0]) => {
    setSelectedDayDetails({
      date: day.date,
      formattedDate: day.fullDate,
      planned: day.planned,
      completed: day.completed,
      rate: day.rate,
      tasks: day.tasks,
    });
    if (onSelectDate) {
      onSelectDate(day.date);
    }
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-cyan-400" /> Consistency Rhythm Heatmap (Past 6 Weeks)
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.04] border border-white/5" />
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-950 border border-cyan-900" />
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-800 border border-cyan-600" />
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500 border border-cyan-300" />
            <div className="w-2.5 h-2.5 rounded-sm bg-violet-400 border border-white" />
            <span>More (100%)</span>
          </div>
        </div>

        {/* Horizontal grid container */}
        <div className="p-4 rounded-xl glass-card border border-white/10 overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[500px]">
            {days.map((day) => (
              <button
                key={day.date}
                onClick={() => handleCellClick(day)}
                title={`${day.fullDate}: ${day.completed}/${day.planned} completed (${day.rate}%)`}
                className={`w-6 h-6 rounded-md border text-[9px] font-mono font-semibold transition-all transform hover:scale-115 flex items-center justify-center cursor-pointer ${getIntensityClass(
                  day.rate,
                  day.planned
                )}`}
              >
                {day.date === getTodayStr() ? '★' : ''}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] text-neutral-500 font-mono mt-3 px-1">
            <span>July 19, 2026</span>
            <span>August 29, 2026 (Today)</span>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Modal / Popover */}
      {selectedDayDetails && (
        <div className="p-4 rounded-xl glass-panel border border-cyan-500/30 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div>
              <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                {selectedDayDetails.formattedDate}
              </h4>
              <div className="text-xs text-neutral-400 mt-0.5">
                {selectedDayDetails.completed} of {selectedDayDetails.planned} tasks completed •{' '}
                <span className="font-semibold text-cyan-300 font-mono">
                  {selectedDayDetails.rate}% Consistency
                </span>{' '}
                {selectedDayDetails.rate >= threshold ? (
                  <span className="text-emerald-400 font-semibold">(Streak Qualified 🔥)</span>
                ) : (
                  <span className="text-rose-400 font-semibold">(Below {threshold}% Target)</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedDayDetails(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Task checklist for that day */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {selectedDayDetails.tasks.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No tasks recorded for this date.</p>
            ) : (
              selectedDayDetails.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-500 shrink-0" />
                    )}
                    <span className={task.completed ? 'text-neutral-200' : 'text-neutral-400'}>
                      {task.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-neutral-400">
                      {task.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    {task.durationMinutes} min
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
