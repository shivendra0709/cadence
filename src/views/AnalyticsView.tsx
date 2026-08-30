import { getDateStr } from '../utils/dateUtils';
import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Zap,
  PieChart as PieChartIcon,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCadence } from '../context/CadenceContext';
import { motion, AnimatePresence } from 'motion/react';

export const AnalyticsView: React.FC = () => {
  const { getConsistencyStats, dailyTasksMap, user } = useCadence();
  const stats = getConsistencyStats();

  // Calculate real trend data
  const trendData = useMemo(() => {
    // Generate last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getDateStr(d);
      const dayTasks = dailyTasksMap[dateStr] || [];
      const planned = dayTasks.length;
      const completed = dayTasks.filter(t => t.completed).length;
      const consistency = planned > 0 ? Math.round((completed / planned) * 100) : 0;
      
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      result.push({ day: dayName, completed, planned, consistency });
    }
    return result;
  }, [dailyTasksMap]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const cats: Record<string, { completed: number; total: number }> = {};
    Object.values(dailyTasksMap).flat().forEach(task => {
      const c = task.category || 'Uncategorized';
      if (!cats[c]) cats[c] = { completed: 0, total: 0 };
      cats[c].total++;
      if (task.completed) cats[c].completed++;
    });

    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
    return Object.entries(cats).map(([category, data], idx) => ({
      category,
      completed: data.completed,
      total: data.total,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      color: colors[idx % colors.length]
    })).sort((a, b) => b.completed - a.completed);
  }, [dailyTasksMap]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Productivity Analytics
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Deep telemetry on execution velocity, discipline balance, and focus hours.
        </p>
      </div>

      {/* 4 Core Summary Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            30-Day Consistency
          </span>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">
            {stats.thirtyDayScore}%
          </div>
          <div className="text-xs text-neutral-400">Target: ≥ {user?.consistencyThreshold || 70}% threshold</div>
        </div>
        
        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Current Streak
          </span>
          <div className="text-3xl font-extrabold font-mono text-amber-400 flex items-center gap-2">
            {stats.currentStreak} <Flame className="w-6 h-6 fill-amber-400/20" />
          </div>
          <div className="text-xs text-neutral-400">Best: {stats.bestStreak} days</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Tasks Completed
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {trendData.reduce((acc, d) => acc + d.completed, 0)}
          </div>
          <div className="text-xs text-neutral-400">Last 7 days</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Focus Time
          </span>
          <div className="text-3xl font-extrabold font-mono text-violet-400">
            {Math.round(stats.weeklyCompleted * 0.5)}h
          </div>
          <div className="text-xs text-neutral-400">This week</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trend Chart */}
        <div className="p-5 rounded-3xl glass-card border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">7-Day Completion Trend</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="planned" name="Planned" stroke="#525252" strokeWidth={3} dot={{ r: 4, fill: '#525252', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="p-5 rounded-3xl glass-card border border-white/5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-violet-400" />
            <h2 className="text-sm font-bold text-white">Category Distribution</h2>
          </div>
          <div className="flex-1 space-y-4">
            {categoryStats.length === 0 ? (
               <div className="text-sm text-neutral-500 h-full flex items-center justify-center">No category data yet.</div>
            ) : (
              categoryStats.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-200">{cat.category}</span>
                    <span className="font-mono text-neutral-400">{cat.completed} / {cat.total} ({cat.rate}%)</span>
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
