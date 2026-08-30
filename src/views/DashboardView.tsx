import React from 'react';
import {
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  Plus,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  onNavigate: (route: string) => void;
  onOpenNewTask: () => void;
  onOpenNewDailyTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewTask,
  onOpenNewDailyTask,
}) => {
  const {
    user,
    projects,
    tasks,
    dailyTasksMap,
    selectedDate,
    toggleDailyTask,
    startTaskTimer,
    pauseTaskTimer,
    activeTimer,
    getConsistencyStats,
    getAtRiskTasks,
    activities,
  } = useCadence();

  const stats = getConsistencyStats();
  const atRiskTasks = getAtRiskTasks();

  const todayTasks = dailyTasksMap[selectedDate] || [];
  const plannedCount = todayTasks.length;
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const todayRate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;

  const chartData = stats.last7Days.map(d => {
    const dt = new Date(d.date);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getUTCDay()];
    return { name: dayName, completed: d.completed, score: d.score };
  });

  // Active tasks remaining across all projects
  const remainingProjectTasks = tasks.filter((t) => t.status !== 'completed').length;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Good morning, {user?.name || 'Shivendra'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Here's your rhythm for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewDailyTask}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card hover:bg-white/5 text-neutral-200 text-xs font-semibold border border-white/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Daily Task</span>
          </button>
          <button
            onClick={() => onNavigate('daily')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <span>Open Today's Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 Core Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Card */}
        <div
          onClick={() => onNavigate('projects')}
          className="p-5 rounded-2xl glass-card hover:border-cyan-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Projects
            </span>
            <FolderKanban className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {projects.length}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Active Projects</div>
        </div>

        {/* Tasks Card */}
        <div
          onClick={() => onNavigate('daily')}
          className="p-5 rounded-2xl glass-card hover:border-cyan-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Tasks
            </span>
            <CheckSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-2">
            {remainingProjectTasks || 18}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Remaining</div>
        </div>

        {/* Consistency Card */}
        <div
          onClick={() => onNavigate('consistency')}
          className="p-5 rounded-2xl glass-card hover:border-violet-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Consistency
            </span>
            <TrendingUp className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-violet-300 mt-2">
            {stats.thirtyDayScore}%
          </div>
          <div className="text-xs text-neutral-400 mt-1">30 days score</div>
        </div>

        {/* Streak Card */}
        <div
          onClick={() => onNavigate('streaks')}
          className="p-5 rounded-2xl glass-card hover:border-amber-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Streak
            </span>
            <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-2 flex items-center gap-1">
            <span>🔥 {stats.currentStreak}</span>
          </div>
          <div className="text-xs text-neutral-400 mt-1">days streak</div>
        </div>
      </div>

      {/* Main Grid: TODAY Section (Left 2/3) + Consistency & At-Risk (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: TODAY Section & Projects Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* TODAY SECTION */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
                  TODAY
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">Saturday, August 29</h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-neutral-300">
                  {completedCount} / {plannedCount} completed
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {todayRate}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${todayRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 h-full rounded-full"
              />
            </div>

            {/* Daily Tasks List */}
            <div className="space-y-2 pt-1">
              {todayTasks.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center italic">
                  No tasks planned for today. Click "+ Add Daily Task" to plan your rhythm.
                </p>
              ) : (
                todayTasks.map((task) => {
                  const isRunning = activeTimer?.taskId === task.id && activeTimer.isRunning;
                  return (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                        task.completed
                          ? 'bg-white/[0.02] border-white/5 text-neutral-400'
                          : 'glass-card border-white/5 hover:border-cyan-500/30 text-neutral-200'
                      }`}
                    >
                      {/* Left: Checkbox + Title + Category */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
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
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs font-semibold truncate ${
                                task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-neutral-400 shrink-0">
                              {task.category}
                            </span>
                          </div>
                          {task.notes && (
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">{task.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Duration + Timer Controls + Priority */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto pl-8 sm:pl-0 justify-between sm:justify-end">
                        <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {task.durationMinutes} min
                        </span>

                        {!task.completed && (
                          <div className="flex items-center gap-1.5">
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
                                title="Start Focus Stopwatch"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PROJECT PROGRESS SECTION */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                  ACTIVE SPRINTS
                </span>
                <h3 className="text-base font-bold text-white">Project Progress</h3>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate(`project-${proj.id}`)}
                  className="p-4 rounded-2xl glass-card border border-white/5 hover:border-white/20 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }} />
                      <span className="font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors">
                        {proj.title}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-neutral-200">{proj.progress}%</span>
                  </div>

                  <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${proj.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: proj.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Consistency Card, At-Risk Work & Recent Activity */}
        <div className="space-y-6">
          {/* CONSISTENCY CARD */}
          <div className="p-6 rounded-3xl glass-panel border border-violet-500/20 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300 font-mono">
              YOUR CONSISTENCY
            </span>

            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-black font-mono text-white">
                {stats.thirtyDayScore}%
              </div>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                30 DAY SCORE
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> {stats.currentStreak} DAY STREAK
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Best: {stats.bestStreak} days
                </span>
              </div>
              {/* Mini Sparkline indicator */}
              <div className="flex items-end gap-1 h-8 pt-2">
                {stats.last7Days.map((day, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${day.score}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                    className="flex-1 bg-violet-500/40 hover:bg-violet-400 rounded-t-sm"
                    title={`${day.date}: ${day.score}%`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate('consistency')}
              className="w-full py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Consistency Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AT-RISK WORK CARD */}
          <div className="p-6 rounded-3xl glass-panel border border-rose-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> AT-RISK WORK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 font-mono">
                HIGH RISK
              </span>
            </div>

            {atRiskTasks.length > 0 ? (
              atRiskTasks.slice(0, 1).map((task) => (
                <div key={task.id} className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-100">{task.title}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{task.projectName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-neutral-900/80 border border-white/5">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase">Expected</span>
                      <div className="font-mono font-bold text-neutral-300">{task.expectedProgress || 85}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase">Actual</span>
                      <div className="font-mono font-bold text-rose-400">{task.progress}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">Progress Gap</span>
                    <span className="font-mono font-bold text-rose-400">
                      -{(task.expectedProgress || 85) - task.progress}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 italic">No tasks currently at risk.</p>
            )}
          </div>

          {/* PRODUCTIVITY SCORE CHART */}
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> PRODUCTIVITY SCORE
              </span>
            </div>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <Area type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
              RECENT ACTIVITY
            </span>

            <div className="space-y-3">
              {activities.slice(0, 3).map((act) => (
                <div key={act.id} className="text-xs space-y-0.5 border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200">{act.title}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
