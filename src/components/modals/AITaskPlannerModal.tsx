import { getDateStr } from '../../utils/dateUtils';
import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCadence } from '../../context/CadenceContext';
import { TaskPriority } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const AITaskPlannerModal: React.FC<Props> = ({ isOpen, onClose, projectId }) => {
  const { projects, addTask } = useCadence();
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/plan-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, projectTitle: project.title })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate tasks');
      setGeneratedTasks(data.tasks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTasks = async () => {
    setIsSaving(true);
    const today = getDateStr(new Date());
    
    try {
      for (const t of generatedTasks) {
        await addTask({
          title: t.title,
          description: t.description,
          projectId,
          projectName: project.title,
          priority: (t.priority as TaskPriority) || 'medium',
          status: 'todo',
          progress: 0,
          deadline: today,
          estimatedHours: t.estimatedHours || 1,
          actualHours: 0,
          assignee: project.members[0] || { id: 'unknown', name: 'Unknown', email: '', role: 'member', avatar: '' },
          tags: t.tags || ['AI Generated']
        });
      }
      onClose();
      setGoal('');
      setGeneratedTasks([]);
    } catch (err) {
      console.error(err);
      setError('Failed to save some tasks');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-2xl glass-dropdown border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-neutral-100">AI Task Planner</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!generatedTasks.length ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Project: {project.title}
                </label>
                <textarea
                  autoFocus
                  rows={4}
                  placeholder="Describe your ultimate goal for this project. The AI will break it down into actionable steps..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900/90 rounded-xl border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || !goal.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-neutral-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    Analyzing Goal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Task Plan
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-neutral-300 font-medium">Review AI Generated Plan:</p>
              
              <div className="space-y-3">
                {generatedTasks.map((t, i) => (
                  <div key={i} className="p-3 bg-neutral-900/80 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-bold text-white leading-tight">{t.title}</h4>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                        t.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                        t.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                        t.priority === 'medium' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-neutral-500/20 text-neutral-300'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{t.description}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] font-medium text-neutral-500">
                        ⏱️ {t.estimatedHours} hrs
                      </span>
                      <div className="flex gap-1">
                        {t.tags?.map((tag: string) => (
                          <span key={tag} className="text-[9px] font-medium text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGeneratedTasks([])}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveTasks}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20 flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> Add All Tasks</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
