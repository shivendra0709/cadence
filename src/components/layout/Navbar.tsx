import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  User as UserIcon,
  LogOut,
  Settings,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';
import { CadenceLogo, CadenceMark } from '../brand/BrandLogo';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenCommandPalette: () => void;
  onOpenNewTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenCommandPalette,
  onOpenNewTask,
}) => {
  const {
    user,
    logout,
    theme,
    setTheme,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    clearAllNotifications,
    activeTimer,
    stopTaskTimer,
    pauseTaskTimer,
  } = useCadence();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPageTitle = () => {
    switch (currentRoute) {
      case 'dashboard':
        return 'Dashboard';
      case 'daily':
        return 'Daily Tasks';
      case 'projects':
        return 'Projects & Kanban';
      case 'consistency':
        return 'Consistency Rhythm';
      case 'streaks':
        return 'Streak Dashboard';
      case 'calendar':
        return 'Calendar';
      case 'analytics':
        return 'Productivity Analytics';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      default:
        if (currentRoute.startsWith('project-')) return 'Project Detail';
        return 'Overview';
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Logo on mobile / Title & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <CadenceMark size="sm" onClick={() => onNavigate('dashboard')} />
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Cadence</span>
          <span className="text-neutral-600">/</span>
          <span className="text-sm font-bold text-neutral-100">{getPageTitle()}</span>
        </div>
      </div>

      {/* Center: Search Command Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-xs text-neutral-400 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
            <span>Search tasks, projects, commands...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded border border-white/5 text-neutral-300">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Active Timer Pill if running */}
        {activeTimer && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono animate-pulse">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">{formatTimer(activeTimer.seconds)}</span>
            <button
              onClick={() => stopTaskTimer(activeTimer.taskId)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-200 hover:text-black transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {/* Quick New Task Button */}
        <button
          onClick={onOpenNewTask}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-colors shadow-sm shadow-cyan-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Task</span>
        </button>

        {/* Search button for mobile */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-violet-400 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown border border-white/5 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-100">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 font-mono">
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-neutral-400 hover:text-cyan-400 transition-colors"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center italic">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        n.read
                          ? 'bg-transparent border-transparent text-neutral-400 hover:bg-white/5'
                          : 'bg-cyan-500/10 border-cyan-500/20 text-neutral-200 hover:bg-cyan-500/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-neutral-200">{n.title}</span>
                        <span className="text-[10px] text-neutral-500">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-cyan-400/50 transition-all"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-white/5"
            />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown border border-white/5 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2.5 border-b border-white/5">
                <p className="text-xs font-bold text-neutral-100">{user?.name || 'Shivendra'}</p>
                <p className="text-[11px] text-neutral-400 truncate">{user?.email || 'shivendra@cadence.app'}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 font-mono">
                    <Flame className="w-3 h-3 text-cyan-400" /> 12-Day Streak
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-0.5 text-xs">
                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Profile Overview</span>
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Account & Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-white/5">
                <button
                  onClick={() => {
                    logout();
                    onNavigate('landing');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
