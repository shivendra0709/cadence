import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckSquare, FolderKanban, Flame, BarChart3, Settings, Moon, Sun, X } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewTask,
  onOpenNewProject,
}) => {
  const [query, setQuery] = useState('');
  const { tasks, projects, theme, setTheme } = useCadence();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const navItems = [
    { label: 'Dashboard', route: 'dashboard', icon: BarChart3 },
    { label: 'Daily Tasks (Today)', route: 'daily', icon: CheckSquare },
    { label: 'Projects & Kanban', route: 'projects', icon: FolderKanban },
    { label: 'Consistency & Rhythm', route: 'consistency', icon: Flame },
    { label: 'Streak Tracker', route: 'streaks', icon: Flame },
    { label: 'Analytics & Velocity', route: 'analytics', icon: BarChart3 },
    { label: 'Settings', route: 'settings', icon: Settings },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl glass-dropdown border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search tasks, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenNewTask();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-cyan-500/15 hover:text-cyan-300 text-neutral-200 transition-colors text-left"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Create New Task</span>
              <span className="ml-auto text-xs text-neutral-500">N</span>
            </button>
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-neutral-200 transition-colors text-left"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
              <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>

          {/* Navigation */}
          {navItems.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Navigation
              </div>
              {navItems.map((item) => (
                <button
                  key={item.route}
                  onClick={() => {
                    onNavigate(item.route);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-neutral-200 transition-colors text-left"
                >
                  <item.icon className="w-4 h-4 text-neutral-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Projects
              </div>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onNavigate(`project-${p.id}`);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-neutral-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.title}</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">{p.progress}%</span>
                </button>
              ))}
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Tasks
              </div>
              {filteredTasks.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onNavigate('projects');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-neutral-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                      {t.status}
                    </span>
                    <span className="truncate">{t.title}</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">{t.progress}%</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
