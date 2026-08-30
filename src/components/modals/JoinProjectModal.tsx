import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinProjectModal: React.FC<JoinProjectModalProps> = ({ isOpen, onClose }) => {
  const { joinProject } = useCadence();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    const success = await joinProject(code.trim().toUpperCase());
    if (success) {
      setCode('');
      setError('');
      onClose();
    } else {
      setError('Invalid invite code or project not found.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl glass-dropdown border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-neutral-100">Join Project</h3>
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
              Invite Code
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. A1B2C3"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900/90 rounded-xl border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 uppercase"
            />
            {error && <p className="text-rose-400 text-xs mt-2">{error}</p>}
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
              disabled={!code.trim()}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
