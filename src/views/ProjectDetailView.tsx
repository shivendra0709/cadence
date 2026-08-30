import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Plus,
  TrendingUp,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';
import { AITaskPlannerModal } from '../components/modals/AITaskPlannerModal';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { Task, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onSelectTask: (task: Task) => void;
  onOpenNewTask: (defaultProjectId?: string, status?: TaskStatus) => void;
}

type TabType = 'board' | 'overview' | 'team' | 'analytics' | 'settings';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onSelectTask,
  onOpenNewTask,
}) => {
  const { projects, tasks, updateProject, updateTaskProgress, deleteProject, user, removeMember, updateMemberRole } = useCadence();
  const [activeTab, setActiveTab] = useState<TabType>('board');

  // Find current project
  const project = projects.find((p) => p.id === projectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === project?.id);

  // New progress log entry form state
  const [newLogPercentage, setNewLogPercentage] = useState(project ? project.progress : 50);
  const [newLogNotes, setNewLogNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  
  const currentUserRole = project?.members.find(m => m.id === user?.id)?.role || 'viewer';
  const isOwner = currentUserRole === 'owner';
  const isOwnerOrLead = isOwner || currentUserRole === 'lead';

  if (!project) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <p>Project not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white">
          Back to Projects
        </button>
      </div>
    );
  }

  const completedTasks = projectTasks.filter((t) => t.status === 'completed');
  const totalEstHours = projectTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const totalActHours = projectTasks.reduce((acc, t) => acc + t.actualHours, 0);

  const handleAddProgressLog = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(project.id, {
      progress: Number(newLogPercentage),
    });
    setShowLogForm(false);
    setNewLogNotes('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header with Back Button */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all projects</span>
        </button>

        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: project.color }} />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{project.title}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 border border-white/5 text-neutral-300">
                  {project.category}
                </span>
              </div>
              <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              
              <button
                onClick={() => setIsAIPlannerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Plan
              </button>
              <button
                onClick={() => onOpenNewTask(project.id)}

                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Project Progress bar & Deadlines */}
          <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex-1 max-w-md space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-neutral-400">Overall Progress</span>
                <span className="font-bold text-cyan-300">{project.progress}%</span>
              </div>
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor: project.color,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target: {project.deadline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{totalActHours}h / {totalEstHours}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-white/5 flex gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'board', label: 'Kanban Board', icon: FolderKanban },
          { id: 'overview', label: 'Progress & Logs', icon: TrendingUp },
          { id: 'team', label: 'Team Members', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ...(isOwnerOrLead ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-white/[0.02]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: KANBAN BOARD */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          <KanbanBoard
            projectId={project.id}
            onSelectTask={onSelectTask}
            onOpenNewTask={(status) => onOpenNewTask(project.id, status)}
          />
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW & PROGRESS LOGS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Expected vs Actual Analysis */}
            <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white">Velocity & Sprint Pace</h3>
              <p className="text-xs text-neutral-400">
                Comparing calculated target velocity against delivered code and milestones.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Actual Progress
                  </span>
                  <div className="text-3xl font-bold font-mono text-cyan-300">
                    {project.progress}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Expected Velocity
                  </span>
                  <div className="text-3xl font-bold font-mono text-violet-300">
                    {project.expectedProgress || 75}%
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Logs */}
            <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Progress Logs</h3>
                <button
                  onClick={() => setShowLogForm(!showLogForm)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold"
                >
                  + Record Milestone
                </button>
              </div>

              {showLogForm && (
                <form onSubmit={handleAddProgressLog} className="p-4 rounded-2xl bg-neutral-900/90 border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-neutral-300">New Overall %:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newLogPercentage}
                      onChange={(e) => setNewLogPercentage(Number(e.target.value))}
                      className="w-20 px-3 py-1 bg-neutral-800 rounded-lg text-xs font-mono text-white border border-white/5"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Describe progress (e.g. Deployed v1 to staging)"
                    value={newLogNotes}
                    onChange={(e) => setNewLogNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-800 rounded-lg text-xs text-white border border-white/5"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLogForm(false)}
                      className="px-3 py-1 text-xs text-neutral-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 rounded-lg bg-cyan-500 text-neutral-950 font-bold text-xs"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl glass-card border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-200">Milestone: Core Architecture Approved</span>
                    <p className="text-[11px] text-neutral-400">All preliminary database schemas & interfaces set up.</p>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold">Aug 28, 2026</span>
                </div>
                <div className="p-3.5 rounded-xl glass-card border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-200">Milestone: Sprint 1 Kickoff</span>
                    <p className="text-[11px] text-neutral-400">Backlog populated and scoped.</p>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold">Aug 20, 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats sidebar */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Sprint Summary
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">Total Tasks</span>
                  <span className="font-mono font-bold text-white">{projectTasks.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">Completed</span>
                  <span className="font-mono font-bold text-emerald-400">{completedTasks.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">Remaining</span>
                  <span className="font-mono font-bold text-cyan-300">{projectTasks.length - completedTasks.length}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Total Logged Time</span>
                  <span className="font-mono font-bold text-violet-300">{totalActHours} hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Project Members ({project.members.length})</h3>
            {isOwnerOrLead && (
            <button 
              onClick={() => setShowInviteCode(!showInviteCode)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold transition-colors"
            >
              {showInviteCode ? 'Hide Code' : '+ Invite Member'}
            </button>
          )}
          </div>
          
          {showInviteCode && (() => {
            const isCurrentUserOwner = isOwner;
            return (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs text-cyan-100">
              <span>Share this code with your team to let them join:</span>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm bg-cyan-500/20 px-3 py-1 rounded-lg tracking-wider">
                  {project.inviteCode || 'N/A'}
                </span>
                {isCurrentUserOwner && (
                  <button
                    onClick={() => updateProject(project.id, { inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase() })}
                    className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded font-semibold transition-colors"
                  >
                    Regenerate
                  </button>
                )}
              </div>
            </div>
            );
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {project.members.map((member) => {
               const isCurrentUserOwner = project.members.find(m => m.id === user?.id)?.role === 'owner';
               const isSelf = member.id === user?.id;
               return (
                 <div key={member.id} className="p-4 rounded-2xl glass-card border border-white/5 flex flex-col gap-3">
                   <div className="flex items-center gap-3.5">
                     <img
                       src={member.avatar}
                       alt={member.name}
                       className="w-10 h-10 rounded-full object-cover border border-white/5"
                     />
                     <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-bold text-neutral-100 truncate">{member.name} {isSelf && '(You)'}</h4>
                       <p className="text-[11px] text-neutral-400 truncate">{member.email}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between pt-3 border-t border-white/5">
                     {isCurrentUserOwner && !isSelf ? (
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(project.id, member.id, e.target.value as any)}
                          className="bg-neutral-900 border border-white/10 rounded-lg text-[10px] text-cyan-300 px-2 py-1 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="owner">Owner</option>
                          <option value="lead">Lead</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                     ) : (
                        <span className="inline-block px-2 py-1 rounded text-[10px] font-semibold bg-white/5 text-cyan-300 capitalize">
                          {member.role}
                        </span>
                     )}
                     
                     {isCurrentUserOwner && !isSelf && (
                       <button
                         onClick={() => {
                           if (window.confirm('Remove this member?')) {
                             removeMember(project.id, member.id);
                           }
                         }}
                         className="text-[10px] text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                       >
                         Remove
                       </button>
                     )}
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white">Tasks by Status</h3>
            <div className="space-y-2 text-xs">
              {['backlog', 'todo', 'in_progress', 'review', 'completed'].map((st) => {
                const count = projectTasks.filter((t) => t.status === st).length;
                const pct = projectTasks.length > 0 ? Math.round((count / projectTasks.length) * 100) : 0;
                return (
                  <div key={st} className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="capitalize text-neutral-400">{st.replace('_', ' ')}</span>
                      <span className="text-neutral-200">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-cyan-500 h-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white">Time Tracking Breakdown</h3>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Estimated</span>
                <span className="font-mono font-bold text-white">{totalEstHours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Actual</span>
                <span className="font-mono font-bold text-cyan-300">{totalActHours} hours</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-neutral-400">Efficiency</span>
                <span className="font-mono font-bold text-emerald-400">
                  {totalActHours > 0 ? `${Math.round((totalActHours / (totalEstHours || 1)) * 100)}%` : '100%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl glass-panel border border-white/5 max-w-xl space-y-6">
          <h3 className="text-base font-bold text-white">Project Settings</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Project Name</label>
              <input
                type="text"
                defaultValue={project.title}
                onChange={(e) => updateProject(project.id, { title: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-900 rounded-xl border border-white/5 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Category</label>
              <input
                type="text"
                defaultValue={project.category}
                onChange={(e) => updateProject(project.id, { category: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-900 rounded-xl border border-white/5 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Description</label>
              <textarea
                defaultValue={project.description}
                onChange={(e) => updateProject(project.id, { description: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2 bg-neutral-900 rounded-xl border border-white/5 text-white resize-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Deadline</label>
              <input
                type="date"
                defaultValue={project.deadline}
                onChange={(e) => updateProject(project.id, { deadline: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-900 rounded-xl border border-white/5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Accent Color</label>
              <div className="flex items-center gap-3">
                {['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateProject(project.id, { color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${project.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {isOwner && (
            <div className="pt-4 border-t border-rose-500/20">
              <h4 className="font-bold text-rose-400 mb-1">Danger Zone</h4>
              <p className="text-neutral-400 mb-3">Archive or delete this project permanently.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateProject(project.id, { status: project.status === 'active' ? 'completed' : 'active' })}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold transition-colors"
                >
                  {project.status === 'active' ? 'Archive Project' : 'Unarchive Project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently delete this project and all its tasks?')) {
                      deleteProject(project.id);
                      onBack();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* AI Task Planner Modal */}
      <AITaskPlannerModal 
        isOpen={isAIPlannerOpen} 
        onClose={() => setIsAIPlannerOpen(false)} 
        projectId={project.id} 
      />
    </div>
  );
};

