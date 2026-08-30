import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';

interface ProjectsViewProps {
  onNavigate: (route: string) => void;
  onOpenNewProject: () => void;
  onOpenJoinProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onNavigate,
  onOpenNewProject,
  onOpenJoinProject,
}) => {
  const { projects, tasks } = useCadence();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const filteredProjects = projects.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Projects & Workflows
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track milestones, deliverables, and team sprint velocity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={onOpenJoinProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-bold transition-all"
          >
            Join via Code
          </button>
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & View Switcher */}
      <div className="p-3.5 rounded-2xl glass-panel border border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'active'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Active ({projects.filter((p) => p.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'completed'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Completed ({projects.filter((p) => p.status === 'completed').length})
          </button>
        </div>

        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid or List Layout */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const completedCount = projectTasks.filter((t) => t.status === 'completed').length;

            return (
              <div
                key={project.id}
                onClick={() => onNavigate(`project-${project.id}`)}
                className="p-6 rounded-3xl glass-panel border border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer space-y-5 group relative overflow-hidden"
              >
                {/* Accent top gradient glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-opacity"
                  style={{ backgroundColor: project.color }}
                />

                {/* Header: Category + Target Date */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 font-medium text-neutral-300">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{project.deadline}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Completion</span>
                    <span className="font-bold text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>

                {/* Footer: Tasks Count & Members */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <span className="text-neutral-400 font-mono">
                    {completedCount} / {projectTasks.length} tasks done
                  </span>

                  <div className="flex items-center -space-x-2">
                    {project.members.slice(0, 3).map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar}
                        alt={m.name}
                        className="w-6 h-6 rounded-full border-2 border-neutral-900 object-cover"
                        title={m.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const completedCount = projectTasks.filter((t) => t.status === 'completed').length;

            return (
              <div
                key={project.id}
                onClick={() => onNavigate(`project-${project.id}`)}
                className="p-4 rounded-2xl glass-card border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate">{project.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="w-32 hidden md:block">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-mono text-neutral-400">
                    {completedCount}/{projectTasks.length} tasks
                  </span>

                  <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                    {project.deadline}
                  </span>

                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
