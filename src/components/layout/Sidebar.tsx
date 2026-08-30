import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Flame,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  AlertTriangle,
  LogOut,
  User as UserIcon,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';
import { CadenceLogo } from '../brand/BrandLogo';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  onOpenNewProject,
  onOpenNewTask,
}) => {
  const { user, logout, projects, tasks, dailyTasksMap, selectedDate, getAtRiskTasks } = useCadence();

  const todayTasks = dailyTasksMap[selectedDate] || [];
  const remainingToday = todayTasks.filter((t) => !t.completed).length;
  const atRiskTasks = getAtRiskTasks();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'daily',
      label: 'Daily Tasks',
      icon: CheckSquare,
      badge: remainingToday > 0 ? `${remainingToday}` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      badge: `${projects.length}`,
      badgeColor: 'bg-white/10 text-neutral-300',
    },
    {
      id: 'consistency',
      label: 'Consistency',
      icon: TrendingUp,
      badge: '87%',
      badgeColor: 'bg-violet-500/20 text-violet-300',
    },
    {
      id: 'streaks',
      label: 'Streaks',
      icon: Flame,
      badge: '🔥 12',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-white/5 bg-[#0a0a0a] shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5">
        <CadenceLogo size="md" showTagline onClick={() => onNavigate('dashboard')} />
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-white/10 text-white font-medium border border-white/5 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white opacity-80' : 'text-slate-400 opacity-50 group-hover:opacity-100'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      item.badgeColor || 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects List */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Active Projects
            </span>
            <button
              onClick={onOpenNewProject}
              className="p-1 rounded-md text-neutral-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
              title="Add New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {projects.map((proj) => {
              const isProjActive = currentRoute === `project-${proj.id}`;
              return (
                <button
                  key={proj.id}
                  onClick={() => onNavigate(`project-${proj.id}`)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all group ${
                    isProjActive
                      ? 'bg-white/10 text-neutral-100 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="truncate">{proj.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 group-hover:text-neutral-400">
                    {proj.progress}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* At-Risk Warning Box if any tasks are lagging */}
        {atRiskTasks.length > 0 && (
          <div
            onClick={() => onNavigate('dashboard')}
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs cursor-pointer hover:bg-rose-500/15 transition-all"
          >
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{atRiskTasks.length} Work At Risk</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
              {atRiskTasks[0].title} (-{((atRiskTasks[0].expectedProgress || 0) - atRiskTasks[0].progress)}% gap)
            </p>
          </div>
        )}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => onNavigate('profile')}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-blue-400 border border-white/20 p-[2px] shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.substring(0, 2).toUpperCase() || 'SA'}
              </div>
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Shivendra A.'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'Pro Member'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            onNavigate('landing');
          }}
          className="w-full text-left text-xs font-semibold text-rose-400/80 hover:text-rose-400 py-2 px-4 rounded border border-rose-400/20 hover:bg-rose-400/5 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};
