import React from 'react';
import { LayoutDashboard, CheckSquare, FolderKanban, Flame, User as UserIcon } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const { dailyTasksMap, selectedDate } = useCadence();
  const todayTasks = dailyTasksMap[selectedDate] || [];
  const remainingToday = todayTasks.filter((t) => !t.completed).length;

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'daily', label: 'Today', icon: CheckSquare, badge: remainingToday > 0 ? remainingToday : null },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'consistency', label: 'Consistency', icon: Flame },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/5 glass-panel backdrop-blur-2xl px-2 flex items-center justify-around">
      {items.map((item) => {
        const isActive = currentRoute === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-cyan-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-cyan-500 text-neutral-950 font-mono">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
