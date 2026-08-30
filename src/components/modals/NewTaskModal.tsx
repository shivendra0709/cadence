import { getTodayStr } from '../../utils/dateUtils';
import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Tag, FolderKanban } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';
import { TaskPriority, TaskStatus } from '../../types';
import { INITIAL_MEMBERS } from '../../services/seedData';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultStatus,
}) => {
  const { projects, addTask, user } = useCadence();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || 'todo');
  const [deadline, setDeadline] = useState(getTodayStr());
  const [reminderTime, setReminderTime] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [tagsInput, setTagsInput] = useState('Frontend, Feature');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    if (reminderTime && 'Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      title: title.trim(),
      description: description.trim(),
      projectId,
      projectName: selectedProj?.title || 'Project',
      priority,
      status,
      progress: status === 'completed' ? 100 : status === 'in_progress' ? 25 : 0,
      expectedProgress: 0,
      deadline,
      reminderTime: reminderTime || undefined,
      estimatedHours: Number(estimatedHours) || 2,
      actualHours: 0,
      assignee: INITIAL_MEMBERS[0],
      tags: tags.length > 0 ? tags : ['General'],
    });

    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl glass-dropdown border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-neutral-100">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Task Title
            </label>
            <input
              autoFocus
              type="text"
              required
              placeholder="e.g. Design Glassmorphic Sidebar Component"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900/90 rounded-xl border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Add key objectives, deliverables, or checklist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900/90 rounded-xl border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-cyan-500 capitalize"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" /> Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Estimated Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" /> Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Design, Frontend, Speed"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
