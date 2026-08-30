import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  User as UserIcon,
  Tag,
  MessageSquare,
  History,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Send,
  ArrowUpRight,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { useCadence } from '../../context/CadenceContext';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { updateTask, updateTaskProgress, addComment, logTime, projects, deleteTask } = useCadence();
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history' | 'time' | 'attachments'>('details');
  const [newComment, setNewComment] = useState('');
  const [logMinutes, setLogMinutes] = useState<number>(30);
  const [logNote, setLogNote] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer interval for local task modal
  React.useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!isOpen || !task) return null;

  const currentProject = projects.find((p) => p.id === task.projectId);

  const handleStatusChange = (status: TaskStatus) => {
    let prog = task.progress;
    if (status === 'completed') prog = 100;
    if (status === 'in_progress' && prog === 0) prog = 25;
    updateTask(task.id, { status, progress: prog }, `Status changed to ${status}`);
  };

  const handleProgressChange = (newProgress: number) => {
    updateTaskProgress(task.id, newProgress);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(task.id, newComment);
    setNewComment('');
  };

  const handleManualTimeLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (logMinutes <= 0) return;
    logTime(task.id, logMinutes, logNote || 'Focused session');
    setLogNote('');
  };

  const handleStopAndLogTimer = () => {
    const mins = Math.max(1, Math.round(timerSeconds / 60));
    logTime(task.id, mins, `Timer session (${Math.floor(timerSeconds / 60)}m ${timerSeconds % 60}s)`);
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const isAtRisk = (task.expectedProgress || 0) - task.progress >= 15 && task.status !== 'completed';

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl glass-dropdown border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentProject?.color || '#06b6d4' }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {currentProject?.title || task.projectName || 'Cadence Task'}
            </span>
            {isAtRisk && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                At Risk (-{(task.expectedProgress || 0) - task.progress}%)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Status */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-neutral-100">{task.title}</h2>
              
              {/* Status Selector */}
              <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-xl border border-white/10 text-xs">
                {(['backlog', 'todo', 'in_progress', 'review', 'completed'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                      task.status === st
                        ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl glass-card">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                Assignee
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-5 h-5 rounded-full object-cover border border-white/10"
                />
                <span className="text-xs font-medium text-neutral-200 truncate">{task.assignee.name}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                Deadline
              </span>
              <span className="text-xs font-mono font-medium text-neutral-200 block">{task.deadline}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Estimated
              </span>
              <span className="text-xs font-mono font-medium text-neutral-200 block">{task.estimatedHours} hrs</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Actual Logged
              </span>
              <span className="text-xs font-mono font-medium text-neutral-200 block">{task.actualHours} hrs</span>
            </div>
          </div>

          {/* Interactive Progress Slider */}
          <div className="space-y-2 p-4 rounded-xl glass-card">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Progress Tracker</span>
              <span className="font-mono text-cyan-400 font-bold">{task.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={task.progress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>0% (Not Started)</span>
              <span>50%</span>
              <span>100% (Done)</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 space-x-6 text-sm">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2.5 font-medium transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Overview & Timer
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Comments ({task.comments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Progress History
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`pb-2.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'time'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Time Log ({task.timeEntries.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-neutral-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Focus Timer & Stopwatch */}
              <div className="p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Interactive Focus Stopwatch
                  </div>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    {formatSeconds(timerSeconds)}
                  </div>
                  <p className="text-xs text-neutral-400">
                    Track live execution time directly against this task's estimate.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isTimerRunning ? (
                    <button
                      onClick={() => setIsTimerRunning(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Focus
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTimerRunning(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pause
                    </button>
                  )}
                  {timerSeconds > 0 && (
                    <button
                      onClick={handleStopAndLogTimer}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium transition-colors"
                    >
                      Log & Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {task.comments.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No comments yet. Start the conversation!</p>
                ) : (
                  task.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 p-3 rounded-xl glass-card">
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-200">{comment.userName}</span>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Write a comment or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-neutral-900/80 rounded-xl border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">
                Historical progress milestones recorded for this task:
              </div>
              <div className="space-y-2">
                {task.progressHistory.map((ph, idx) => (
                  <div
                    key={ph.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[11px]">
                        {ph.progress}%
                      </div>
                      <div>
                        <div className="font-medium text-neutral-200">{ph.note || 'Progress update'}</div>
                        <div className="text-[10px] text-neutral-500">Updated by {ph.updatedBy}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">{ph.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div className="space-y-4">
              {/* Manual Time Log Form */}
              <form onSubmit={handleManualTimeLog} className="p-3 rounded-xl glass-card flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-300 font-medium">Log Time:</span>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 text-xs font-mono bg-neutral-900 rounded-lg border border-white/10 text-neutral-100"
                  />
                  <span className="text-xs text-neutral-400">minutes</span>
                </div>
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="flex-1 min-w-[140px] px-2.5 py-1.5 text-xs bg-neutral-900 rounded-lg border border-white/10 text-neutral-100 placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Session
                </button>
              </form>

              {/* Time Entries Feed */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {task.timeEntries.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No time logged yet.</p>
                ) : (
                  task.timeEntries.map((te) => (
                    <div
                      key={te.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono font-semibold text-neutral-200">
                          {Math.floor(te.durationMinutes / 60)}h {te.durationMinutes % 60}m
                        </span>
                        <span className="text-neutral-400">— {te.note || 'Work session'}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">{te.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-white/[0.02]">
          <span className="text-[11px] text-neutral-500 font-mono">
            ID: {task.id} • Created {new Date(task.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to permanently delete this task?')) {
                  deleteTask(task.id);
                  onClose();
                }
              }}
              className="px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-medium text-xs transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
