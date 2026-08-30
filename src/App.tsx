/**
 * CADENCE — Full-Stack Productivity SaaS Application
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CadenceProvider, useCadence } from './context/CadenceContext';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

import { LandingPage } from './views/LandingPage';
import { AuthPages } from './views/AuthPages';
import { OnboardingFlow } from './views/OnboardingFlow';

import { DashboardView } from './views/DashboardView';
import { DailyTasksView } from './views/DailyTasksView';
import { ProjectsView } from './views/ProjectsView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { ConsistencyView } from './views/ConsistencyView';
import { StreakView } from './views/StreakView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

import { CommandPalette } from './components/modals/CommandPalette';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { NewTaskModal } from './components/modals/NewTaskModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { JoinProjectModal } from './components/modals/JoinProjectModal';
import { NewDailyTaskModal } from './components/modals/NewDailyTaskModal';

import { Task, TaskStatus } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, user, authReady } = useAuth();
  const { dataLoaded } = useCadence();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskProjectId, setNewTaskProjectId] = useState<string | undefined>(undefined);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | undefined>(undefined);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isJoinProjectOpen, setIsJoinProjectOpen] = useState(false);
  const [isNewDailyTaskOpen, setIsNewDailyTaskOpen] = useState(false);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewTaskOpen(true);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsNewTaskOpen(false);
        setIsNewProjectOpen(false);
        setIsNewDailyTaskOpen(false);
        setSelectedTaskDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewTask = (defaultProjectId?: string, status?: TaskStatus) => {
    setNewTaskProjectId(defaultProjectId);
    setNewTaskStatus(status);
    setIsNewTaskOpen(true);
  };

  const path = location.pathname;
  // Auth guarding
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!dataLoaded) return;
      if (!user.profileCompleted && !path.includes('/onboarding')) {
        navigate('/onboarding');
      } else if (user.profileCompleted && (path === '/' || path.includes('/login') || path.includes('/register') || path.includes('/onboarding'))) {
        navigate('/app');
      }
    } else if (!isAuthenticated && (path.startsWith('/app') || path.includes('/onboarding'))) {
      navigate('/login');
    }
  }, [isAuthenticated, user, path, navigate, dataLoaded]);

  if (!authReady || (isAuthenticated && !dataLoaded)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#050505] text-white">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-neutral-400">Loading your cadence...</p>
      </div>
    );
  }

  // Derived currentRoute for backwards compatibility with Nav components
  let currentRoute = 'dashboard';

  if (path === '/') currentRoute = 'landing';
  else if (path.includes('/login') || path.includes('/register') || path.includes('/forgot-password')) currentRoute = path.replace('/', '');
  else if (path === '/app/daily') currentRoute = 'daily';
  else if (path === '/app/projects') currentRoute = 'projects';
  else if (path.startsWith('/app/projects/')) currentRoute = `project-${path.split('/').pop()}`;
  else if (path === '/app/consistency') currentRoute = 'consistency';
  else if (path === '/app/streaks') currentRoute = 'streaks';
  else if (path === '/app/calendar') currentRoute = 'calendar';
  else if (path === '/app/analytics') currentRoute = 'analytics';
  else if (path === '/app/profile') currentRoute = 'profile';
  else if (path === '/app/settings') currentRoute = 'settings';
  else if (path === '/onboarding') currentRoute = 'onboarding';

  // Navigation adapter for Nav components
  const handleNavigate = (route: string) => {
    if (route === 'landing') navigate('/');
    else if (route === 'sign-in') navigate('/login');
    else if (route === 'register' || route === 'forgot-password' || route === 'onboarding') navigate(`/${route}`);
    else if (route === 'dashboard') navigate('/app');
    else if (route.startsWith('project-')) navigate(`/app/projects/${route.replace('project-', '')}`);
    else navigate(`/app/${route}`);
  };



  const isAppRoute = path.startsWith('/app');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-slate-300 selection:bg-blue-500/20 selection:text-blue-200 font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/3 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-violet-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full" />
      </div>

      {isAppRoute && (
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenNewTask={() => handleOpenNewTask()}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {isAppRoute && (
          <Navbar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenNewTask={() => handleOpenNewTask()}
          />
        )}

        <main className={`flex-1 overflow-y-auto w-full mx-auto ${isAppRoute ? 'p-4 sm:p-6 lg:p-8 max-w-7xl pb-24 md:pb-8' : ''}`}>
          <Routes>
            <Route path="/" element={<LandingPage onGetStarted={() => navigate('/register')} onSignIn={() => navigate('/login')} />} />
            <Route path="/login" element={<AuthPages initialMode="sign-in" onSuccess={(isNew) => navigate(isNew ? '/onboarding' : '/app')} onBackToLanding={() => navigate('/')} />} />
            <Route path="/register" element={<AuthPages initialMode="register" onSuccess={(isNew) => navigate(isNew ? '/onboarding' : '/app')} onBackToLanding={() => navigate('/')} />} />
            <Route path="/forgot-password" element={<AuthPages initialMode="forgot-password" onSuccess={() => navigate('/login')} onBackToLanding={() => navigate('/')} />} />
            <Route path="/onboarding" element={<OnboardingFlow onComplete={() => navigate('/app')} />} />
            
            <Route path="/app" element={<DashboardView onNavigate={handleNavigate} onOpenNewTask={() => handleOpenNewTask()} onOpenNewDailyTask={() => setIsNewDailyTaskOpen(true)} />} />
            <Route path="/app/daily" element={<DailyTasksView onOpenNewDailyTask={() => setIsNewDailyTaskOpen(true)} />} />
            <Route path="/app/projects" element={<ProjectsView onNavigate={handleNavigate} onOpenNewProject={() => setIsNewProjectOpen(true)} onOpenJoinProject={() => setIsJoinProjectOpen(true)} />} />
            <Route path="/app/projects/:projectId" element={
              <ProjectDetailView 
                projectId={currentRoute.replace('project-', '')} 
                onBack={() => navigate('/app/projects')} 
                onSelectTask={(task) => setSelectedTaskDetail(task)} 
                onOpenNewTask={(projId, status) => handleOpenNewTask(projId, status)} 
              />
            } />
            <Route path="/app/consistency" element={<ConsistencyView />} />
            <Route path="/app/streaks" element={<StreakView />} />
            <Route path="/app/calendar" element={<CalendarView />} />
            <Route path="/app/analytics" element={<AnalyticsView />} />
            <Route path="/app/profile" element={<ProfileView onNavigate={handleNavigate} />} />
            <Route path="/app/settings" element={<SettingsView />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {isAppRoute && (
          <BottomNav
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
          />
        )}
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
      />

      <TaskDetailModal isOpen={!!selectedTaskDetail} task={selectedTaskDetail} onClose={() => setSelectedTaskDetail(null)} />
      <NewTaskModal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} defaultProjectId={newTaskProjectId} defaultStatus={newTaskStatus} />
      <JoinProjectModal isOpen={isJoinProjectOpen} onClose={() => setIsJoinProjectOpen(false)} />
      <NewProjectModal isOpen={isNewProjectOpen} onClose={() => setIsNewProjectOpen(false)} />
      <NewDailyTaskModal isOpen={isNewDailyTaskOpen} onClose={() => setIsNewDailyTaskOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CadenceProvider>
          <MainAppContent />
        </CadenceProvider>
      </AuthProvider>
    </HashRouter>
  );
}
