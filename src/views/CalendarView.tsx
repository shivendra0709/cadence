import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';
import { getTodayStr } from '../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { dailyTasksMap, selectedDate, setSelectedDate, projects } = useCadence();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [viewType, setViewType] = useState<'month' | 'week'>('month');

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate days for the month grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Empty slots for previous month offset
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= totalDays; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push(dayStr);
  }

  const selectedDayTasks = dailyTasksMap[selectedDate] || [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Calendar & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            View scheduled tasks, sprint deadlines, and daily consistency rhythm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date();
              setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
              setSelectedDate(getTodayStr());
            }}
            className="px-3 py-1.5 rounded-xl glass-card hover:bg-white/5 text-xs font-semibold text-neutral-200 border border-white/5"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (Left 2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-cyan-400" />
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-neutral-500 font-mono py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl opacity-20" />;
              }

              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === getTodayStr();
              const dayTasks = dailyTasksMap[dateStr] || [];
              const completedCount = dayTasks.filter((t) => t.completed).length;

              // Check if any project has a deadline on this day
              const deadlineProj = projects.find((p) => p.deadline === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'glass-card border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-cyan-400 text-neutral-950 flex items-center justify-center'
                          : isSelected
                          ? 'text-cyan-300'
                          : 'text-neutral-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono text-neutral-400">
                        {completedCount}/{dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Deadline pill or task markers */}
                  <div className="space-y-1">
                    {deadlineProj && (
                      <div className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 truncate">
                        🎯 {deadlineProj.title}
                      </div>
                    )}
                    {dayTasks.length > 0 && (
                      <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full"
                          style={{
                            width: `${(completedCount / dayTasks.length) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector (Right col) */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
              DAY INSPECTOR
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{selectedDate}</h3>
            <p className="text-xs text-neutral-400">
              {selectedDayTasks.length} scheduled tasks for this date.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-neutral-400 py-8 text-center italic">
                No tasks scheduled for {selectedDate}.
              </p>
            ) : (
              selectedDayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl glass-card border border-white/5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-neutral-500" />
                      )}
                      <span
                        className={`font-semibold ${
                          task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                      {task.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400 pl-6">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span>{task.durationMinutes} min</span>
                    {task.scheduledTime && <span>• {task.scheduledTime}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
