import React, { useState } from 'react';
import { GripVertical,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Play,
  Pause,
  Trash2,
  Edit2,
  Check,
  X,
  Flame,
  ArrowUpDown,
  Tag,
  MapPin,
  Loader2
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';
import { DailyTask, TaskPriority } from '../types';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

import { getTodayStr, getDateStr } from '../utils/dateUtils';

interface DailyTasksViewProps {
  onOpenNewDailyTask: () => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({ onOpenNewDailyTask }) => {
  const {
    dailyTasksMap,
    selectedDate,
    setSelectedDate,
    toggleDailyTask,
    deleteDailyTask,
    updateDailyTask,
    addDailyTask,
    startTaskTimer,
    pauseTaskTimer,
    activeTimer,
    user,
    reorderDailyTasks,
  } = useCadence();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDuration, setEditDuration] = useState(30);

  const [locationSuggestions, setLocationSuggestions] = useState<Record<string, { loading: boolean, text?: string, error?: string }>>({});

  const fetchLocations = async (taskId: string, title: string) => {
    setLocationSuggestions(prev => ({ ...prev, [taskId]: { loading: true } }));
    try {
      const res = await fetch('/api/suggest-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setLocationSuggestions(prev => ({ ...prev, [taskId]: { loading: false, text: data.text } }));
    } catch (error: any) {
      setLocationSuggestions(prev => ({ ...prev, [taskId]: { loading: false, error: error.message } }));
    }
  };

  // Quick inline add input
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('Work');
  const [quickDuration, setQuickDuration] = useState(45);

  const threshold = user?.consistencyThreshold || 70;

  const currentTasks = dailyTasksMap[selectedDate] || [];
  const plannedCount = currentTasks.length;
  const completedCount = currentTasks.filter((t) => t.completed).length;
  const remainingCount = plannedCount - completedCount;
  const completionPercentage = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;
  const isQualifiedStreak = completionPercentage >= threshold;

  // Date manipulation helpers
  const handleShiftDate = (offsetDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offsetDays);
    setSelectedDate(getDateStr(current));
  };

  const isToday = selectedDate === getTodayStr();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const sourceTaskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    
    if (sourceTaskId && sourceTaskId !== targetTaskId) {
      const sourceIdx = currentTasks.findIndex(t => t.id === sourceTaskId);
      const targetIdx = currentTasks.findIndex(t => t.id === targetTaskId);
      if (sourceIdx !== -1 && targetIdx !== -1) {
        const newTasks = [...currentTasks];
        const [moved] = newTasks.splice(sourceIdx, 1);
        newTasks.splice(targetIdx, 0, moved);
        
        // Re-assign order properties explicitly based on new index
        const updatedTasks = newTasks.map((t, index) => ({ ...t, order: index }));
        reorderDailyTasks(updatedTasks);
      }
    }
    setDraggedTaskId(null);
  };


  const handleStartEdit = (task: DailyTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditDuration(task.durationMinutes);
  };

  const handleSaveEdit = (taskId: string) => {
    if (!editTitle.trim()) return;
    updateDailyTask(taskId, {
      title: editTitle.trim(),
      category: editCategory.trim() || 'General',
      durationMinutes: Number(editDuration) || 30,
    });
    setEditingTaskId(null);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addDailyTask({
      title: quickTitle.trim(),
      date: selectedDate,
      category: quickCategory,
      durationMinutes: Number(quickDuration) || 30,
      priority: 'medium',
      completed: false,
    });

    setQuickTitle('');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Daily Tasks
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Plan your day. Build your rhythm.
          </p>
        </div>

        <button
          onClick={onOpenNewDailyTask}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Daily Task</span>
        </button>
      </div>

      {/* Date Navigator Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShiftDate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass-card hover:bg-white/5 text-neutral-300 text-xs font-medium border border-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Yesterday</span>
          </button>

          <button
            onClick={() => setSelectedDate(getTodayStr())}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all font-mono ${
              isToday
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                : 'glass-card text-neutral-300 hover:bg-white/5 border border-white/5'
            }`}
          >
            TODAY
          </button>

          <button
            onClick={() => handleShiftDate(1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass-card hover:bg-white/5 text-neutral-300 text-xs font-medium border border-white/5 transition-colors"
          >
            <span>Tomorrow</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector input */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-neutral-900 rounded-xl border border-white/5 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* 4 Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-white/5">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase">Planned</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{plannedCount}</div>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/5">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase">Completed</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{completedCount}</div>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/5">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase">Remaining</span>
          <div className="text-2xl font-bold font-mono text-neutral-300 mt-1">{remainingCount}</div>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/5">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase">Rhythm Score</span>
          <div className="text-2xl font-bold font-mono text-violet-300 mt-1 flex items-center gap-1.5">
            <span>{completionPercentage}%</span>
            {isQualifiedStreak && <Flame className="w-4 h-4 text-amber-400" />}
          </div>
        </div>
      </div>

      {/* Quick Add Row */}
      <form onSubmit={handleQuickAdd} className="p-3 rounded-2xl glass-card border border-white/5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="+ Quickly add a task (e.g. System Design Mock Interview)..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 min-w-[200px] px-3.5 py-2 text-xs bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
        />

        <select
          value={quickCategory}
          onChange={(e) => setQuickCategory(e.target.value)}
          className="px-3 py-2 bg-neutral-900 rounded-xl border border-white/5 text-neutral-200 text-xs focus:outline-none focus:border-cyan-500"
        >
          <option value="Study">Study</option>
          <option value="Work">Work</option>
          <option value="Project">Project</option>
          <option value="Fitness">Fitness</option>
          <option value="Personal">Personal</option>
          <option value="College">College</option>
        </select>

        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <input
            type="number"
            min="5"
            step="5"
            value={quickDuration}
            onChange={(e) => setQuickDuration(Number(e.target.value))}
            className="w-16 px-2.5 py-2 bg-neutral-900 rounded-xl border border-white/5 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
          <span>min</span>
        </div>

        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-bold text-xs transition-colors"
        >
          Add Task
        </button>
      </form>

      {/* Task List */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Schedule for {selectedDate}
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            {completedCount} of {plannedCount} finished
          </span>
        </div>

        <div className="space-y-2.5">
          {currentTasks.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-400">No daily tasks scheduled for this day.</p>
              <button
                onClick={onOpenNewDailyTask}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold"
              >
                + Plan a Task
              </button>
            </div>
          ) : (
            currentTasks.map((task) => {
              const isRunning = activeTimer?.taskId === task.id && activeTimer.isRunning;
              const isEditing = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, task.id)}
                  className={`p-4 rounded-2xl border transition-all relative group ${
                    draggedTaskId === task.id ? 'opacity-50 scale-[0.98]' : ''
                  } ${
                    task.completed
                      ? 'bg-white/[0.02] border-white/5 opacity-75'
                      : 'glass-card border-white/5 hover:border-cyan-500/30'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-neutral-900 rounded-lg border border-white/5 text-neutral-100"
                      />
                      <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-28 px-3 py-1.5 text-xs bg-neutral-900 rounded-lg border border-white/5 text-neutral-100"
                      />
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={editDuration}
                        onChange={(e) => setEditDuration(Number(e.target.value))}
                        className="w-16 px-2 py-1.5 text-xs font-mono bg-neutral-900 rounded-lg border border-white/5 text-neutral-100"
                      />
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="p-1.5 rounded-lg bg-white/10 text-neutral-300 hover:bg-white/20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Left: Checkbox + Title + Category Badge + Notes */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto">
                        <div className="cursor-grab text-neutral-600 hover:text-neutral-400 opacity-50 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          onClick={() => toggleDailyTask(task.id)}
                          className="text-neutral-400 hover:text-cyan-400 transition-colors shrink-0 p-3 -m-3 sm:p-0 sm:m-0 relative w-5 h-5 flex items-center justify-center"
                        >
                          <AnimatePresence mode="wait">
                            {task.completed ? (
                              <motion.div
                                key="completed"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute"
                              >
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="uncompleted"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute"
                              >
                                <Circle className="w-5 h-5 text-neutral-500 hover:text-cyan-300" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span
                              className={`text-sm font-semibold truncate ${
                                task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/5 text-neutral-300 shrink-0">
                              {task.category}
                            </span>
                            {task.scheduledTime && (
                              <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                                @ {task.scheduledTime}
                              </span>
                            )}
                          </div>
                          {task.notes && (
                            <p className="text-xs text-neutral-400 mt-1 truncate">{task.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Duration + Stopwatch Controls + Edit/Delete */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto pl-8 sm:pl-0 justify-between sm:justify-end">
                        <div className="text-xs font-mono text-neutral-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{task.durationMinutes} min</span>
                          {(task.elapsedSeconds || (activeTimer?.taskId === task.id)) ? (
                            <span className="text-[10px] text-cyan-400 ml-1">
                              ({formatSeconds(activeTimer?.taskId === task.id ? activeTimer.seconds : (task.elapsedSeconds || 0))})
                            </span>
                          ) : null}
                        </div>

                        {!task.completed && (
                          <div className="flex items-center gap-1">
                            {isRunning ? (
                              <button
                                onClick={() => pauseTaskTimer(task.id)}
                                className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                                title="Pause Timer"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => startTaskTimer(task.id)}
                                className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                                title="Start Focus Timer"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => handleStartEdit(task)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (!locationSuggestions[task.id]) {
                              fetchLocations(task.id, task.title);
                            } else {
                              setLocationSuggestions(prev => {
                                const next = { ...prev };
                                delete next[task.id];
                                return next;
                              });
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${locationSuggestions[task.id] ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400 hover:text-cyan-300 hover:bg-white/5'}`}
                          title="Find Places with AI"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteDailyTask(task.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Location Suggestions Panel */}
                  {locationSuggestions[task.id] && (
                    <div className="mt-3 pt-3 border-t border-white/5 pl-9 pr-3">
                      {locationSuggestions[task.id].loading ? (
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Gemini is finding places for you...</span>
                        </div>
                      ) : locationSuggestions[task.id].error ? (
                        <div className="text-xs text-rose-400">
                          Error: {locationSuggestions[task.id].error}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                          <div className="flex items-center gap-1.5 text-cyan-400 font-medium mb-2">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Suggested Places</span>
                          </div>
                          <div className="markdown-body text-neutral-300 max-w-none">
                            <Markdown>{locationSuggestions[task.id].text || ''}</Markdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
