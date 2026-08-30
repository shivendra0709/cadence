import React, { useState } from 'react';
import { X, Plus, Clock, Tag, Calendar } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';
import { TaskPriority } from '../../types';

interface NewDailyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const NewDailyTaskModal: React.FC<NewDailyTaskModalProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { addDailyTask, selectedDate } = useCadence();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [notes, setNotes] = useState('');
  const [taskDate, setTaskDate] = useState(initialDate || selectedDate);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addDailyTask({
      title: title.trim(),
      date: taskDate,
      category: category.trim() || 'General',
      durationMinutes: Number(durationMinutes) || 30,
      priority,
      scheduledTime,
      notes: notes.trim(),
      completed: false,
    });

    onClose();
    setTitle('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl glass-dropdown border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-neutral-100">Add Daily Task</h3>
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
              Task Name
            </label>
            <input
              autoFocus
              type="text"
              required
              placeholder="e.g. Revision & Flashcards"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900/90 rounded-xl border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Project">Project</option>
                <option value="Fitness">Fitness</option>
                <option value="Personal">Personal</option>
                <option value="College">College</option>
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
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Duration (min)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" /> Scheduled Time
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Notes (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 review exercises"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
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
              Add to Daily Rhythm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
