import React, { useState } from 'react';
import { Plus, MoreHorizontal, Clock, Tag, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { useCadence } from '../../context/CadenceContext';
import { motion, AnimatePresence } from 'motion/react';

interface KanbanBoardProps {
  projectId?: string; // Optional: filter to specific project
  onSelectTask: (task: Task) => void;
  onOpenNewTask: (status?: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-neutral-700 text-neutral-400' },
  { id: 'todo', label: 'Todo', color: 'border-blue-500/30 text-blue-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-cyan-500/40 text-cyan-300' },
  { id: 'review', label: 'Review', color: 'border-violet-500/40 text-violet-300' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  onSelectTask,
  onOpenNewTask,
}) => {
  const { tasks, moveTaskStatus } = useCadence();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Filter tasks if scoped to project
  const filteredTasks = projectId ? tasks.filter((t) => t.projectId === projectId) : tasks;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 select-none min-h-[550px]">
      {COLUMNS.map((col) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="w-72 shrink-0 flex flex-col rounded-2xl glass-panel border border-white/10 p-3.5 bg-white/[0.01]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-neutral-300">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onOpenNewTask(col.id)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Add task in this column"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[120px]">
              {colTasks.map((task) => {
                const isLagging = task.expectedProgress && task.progress < task.expectedProgress - 15;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer space-y-3 group active:opacity-75"
                  >
                    {/* Top: Priority & Project Tag */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded-full border font-semibold capitalize ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-neutral-400 truncate max-w-[110px]">
                        {task.projectName}
                      </span>
                    </div>

                    {/* Task Title */}
                    <h4 className="text-xs font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {task.title}
                    </h4>

                    {/* Progress indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                        <span>Progress</span>
                        <span className={isLagging ? 'text-rose-400 font-bold' : 'text-neutral-200'}>
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            task.status === 'completed'
                              ? 'bg-emerald-400'
                              : isLagging
                              ? 'bg-rose-500'
                              : 'bg-cyan-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Bottom: Assignee & Hours */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-5 h-5 rounded-full object-cover border border-white/10"
                          title={task.assignee.name}
                        />
                        <span className="text-[10px] text-neutral-400 truncate max-w-[70px]">
                          {task.assignee.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>{task.actualHours}/{task.estimatedHours}h</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div
                  onClick={() => onOpenNewTask(col.id)}
                  className="h-24 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-neutral-500 text-xs hover:border-cyan-500/30 hover:text-neutral-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 mb-1" />
                  <span>Drop or Add</span>
                </div>
              )}
            </div>

            {/* Quick add button at bottom */}
            <button
              onClick={() => onOpenNewTask(col.id)}
              className="mt-3 w-full py-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 border border-transparent hover:border-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
