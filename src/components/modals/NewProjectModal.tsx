import { getTodayStr } from '../../utils/dateUtils';
import React, { useState } from 'react';
import { X, FolderPlus, Palette, Calendar } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject } = useCadence();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Product Engineering');
  const [deadline, setDeadline] = useState(getTodayStr());
  const [color, setColor] = useState(COLOR_PRESETS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addProject({
      title: title.trim(),
      description: description.trim(),
      category,
      deadline,
      color,
      status: 'active',
      progress: 0,
      expectedProgress: 0,
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
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-neutral-100">Create New Project</h3>
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
              Project Title
            </label>
            <input
              autoFocus
              type="text"
              required
              placeholder="e.g. Mobile Application v2"
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
              placeholder="What are the key goals and deliverables for this project?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900/90 rounded-xl border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Design, Mobile, Growth"
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" /> Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 rounded-xl border border-white/10 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Color accent selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1">
              <Palette className="w-3 h-3 text-cyan-400" /> Project Accent Color
            </label>
            <div className="flex items-center gap-3">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
