import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, collection, getDocs, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import {
  User,
  Project,
  ProjectMember,
  Task,
  DailyTask,
  ActivityItem,
  NotificationItem,
  ConsistencyStats,
  CategoryPerformance,
  TaskStatus,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MEMBERS,
  generateHistoricalDailyRecords,
} from '../services/seedData';

interface CadenceContextType {
  user: User | null;
  isAuthenticated: boolean;
  dataLoaded: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  projects: Project[];
  tasks: Task[];
  dailyTasksMap: Record<string, DailyTask[]>;
  selectedDate: string;
  activities: ActivityItem[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  activeTimer: { taskId: string; title: string; seconds: number; isRunning: boolean } | null;
  
  // Auth
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, username?: string, dob?: string, profession?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  completeOnboarding: (focusAreas: string[], trackItems: string[], threshold: number, profile?: {username: string, name: string, email: string, dob: string, profession: string, profileCompleted: boolean}) => void;

  // Navigation / Date
  setSelectedDate: (date: string) => void;

  // Daily Tasks
  getDailyTasksForDate: (date: string) => DailyTask[];
  addDailyTask: (task: Omit<DailyTask, 'id' | 'userId' | 'order'>) => void;
  updateDailyTask: (id: string, updates: Partial<DailyTask>) => void;
  deleteDailyTask: (id: string) => void;
  toggleDailyTask: (id: string) => void;
  reorderDailyTasks: (tasks: DailyTask[]) => void;
  startTaskTimer: (id: string) => void;
  pauseTaskTimer: (id: string) => void;
  stopTaskTimer: (id: string) => void;

  // Projects & Kanban Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'progressHistory' | 'timeEntries' | 'memberIds'>) => void;
  updateTask: (id: string, updates: Partial<Task>, note?: string) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, newStatus: TaskStatus) => void;
  updateTaskProgress: (id: string, progress: number, note?: string) => void;
  addComment: (taskId: string, content: string) => void;
  logTime: (taskId: string, durationMinutes: number, note?: string) => void;

  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'members' | 'inviteCode' | 'memberIds'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  joinProject: (code: string) => Promise<boolean>;
  removeMember: (projectId: string, memberId: string) => void;
  updateMemberRole: (projectId: string, memberId: string, role: "owner" | "lead" | "member" | "viewer") => void;

  // Notifications & Activities
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'userId' | 'userName' | 'userAvatar' | 'timestamp'>) => void;

  // Computed & Dynamic Metrics
  getConsistencyStats: () => ConsistencyStats;
  getCategoryPerformance: () => CategoryPerformance[];
  getTimeAnalytics: () => { totalFocusMinutes: number; averageSessionMinutes: number; topCategory: string };
  getAtRiskTasks: () => Task[];
}

const CadenceContext = createContext<CadenceContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'cadence_user_v1',
  THEME: 'cadence_theme_v1',
  PROJECTS: 'cadence_projects_v1',
  TASKS: 'cadence_tasks_v1',
  DAILY_MAP: 'cadence_daily_map_v1',
  ACTIVITIES: 'cadence_activities_v1',
  NOTIFICATIONS: 'cadence_notifications_v1',
};

import { getTodayStr, getDateStr } from '../utils/dateUtils';

export const CadenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultDate = getTodayStr();
  
  const { user, isAuthenticated, authReady, login, loginWithGoogle, register, logout, updateUser } = useAuth();

  // Theme state
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEYS.THEME);
    } catch (e) {
      console.warn('localStorage access denied:', e);
    }
  
    return saved === 'light' ? 'light' : 'dark';
  });

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  // Daily Tasks historical map
  const [dailyTasksMap, setDailyTasksMap] = useState<Record<string, DailyTask[]>>({});

  // Activities
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Using standard local date/time string formatting:
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDateString = `${year}-${month}-${day}`;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${hours}:${minutes}`;

      tasks.forEach(task => {
        if (task.status !== 'completed' && task.reminderTime && task.deadline === currentDateString) {
          if (task.reminderTime === currentTimeString && !notifiedTasks.current.has(task.id)) {
            notifiedTasks.current.add(task.id);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Project Task Reminder', {
                body: `It's time for: ${task.title}`,
                icon: '/icon.png',
              });
            }
          }
        }
      });

      const todayTasks = dailyTasksMap[currentDateString] || [];
      todayTasks.forEach(task => {
        if (!task.completed && task.reminderTime) {
          // ensure reminderTime matches HH:MM format, sometimes scheduledTime is "09:00 AM" but reminderTime is usually HH:mm in input type=time
          if (task.reminderTime === currentTimeString && !notifiedTasks.current.has(task.id)) {
            notifiedTasks.current.add(task.id);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Daily Task Reminder', {
                body: `It's time for: ${task.title}`,
                icon: '/icon.png',
              });
            }
          }
        }
      });
    }, 60000); // check every minute

    


      return () => clearInterval(interval);
  }, [tasks, dailyTasksMap]);

  // Active Timer state
  const [activeTimer, setActiveTimer] = useState<{
    taskId: string;
    title: string;
    seconds: number;
    isRunning: boolean;
  } | null>(null);

  // Data Loading State
  const [dataLoaded, setDataLoaded] = useState(false);
  const lastServerStateRef = useRef<string>("");

  // Synchronize HTML class with theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('localStorage access denied:', e);
    }
  
  }, [theme]);

  
  // Firestore Real-time Listeners (Relational)
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setProjects([]);
      setTasks([]);
      setDailyTasksMap({});
      setActivities([]);
      setNotifications([]);
      setDataLoaded(true);
      return;
    }

    setDataLoaded(false);
    const unsubs: (() => void)[] = [];
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 6) setDataLoaded(true);
    };
    // Fallback: don't block forever
    const timeout = setTimeout(() => {
      if (!dataLoaded) setDataLoaded(true);
    }, 2000);
    unsubs.push(() => clearTimeout(timeout));


    // Users (Profile)
    unsubs.push(onSnapshot(doc(db, 'users', user.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.userProfile && user.id === data.userProfile.id) {
          updateUser(data.userProfile);
        }
      } else {
        setDoc(doc(db, 'users', user.id), { userProfile: user }).catch(console.error);
      }
      checkLoaded();
    }, (err) => { console.error('onSnapshot error:', err); checkLoaded(); }));

    // Projects
    unsubs.push(onSnapshot(query(collection(db, 'projects'), where('memberIds', 'array-contains', user.id)), (snap) => {
      setProjects(snap.docs.map(d => d.data() as Project));
      checkLoaded();
    }, (err) => { console.error('onSnapshot error:', err); checkLoaded(); }));

    // Tasks
    unsubs.push(onSnapshot(query(collection(db, 'tasks'), where('memberIds', 'array-contains', user.id)), (snap) => {
      setTasks(snap.docs.map(d => d.data() as Task));
      checkLoaded();
    }, (err) => { console.error('onSnapshot error:', err); checkLoaded(); }));

    // Daily Tasks
    unsubs.push(onSnapshot(query(collection(db, 'dailyTasks'), where('userId', '==', user.id)), (snap) => {
      const allDaily = snap.docs.map(d => d.data() as DailyTask);
      const newMap: Record<string, DailyTask[]> = {};
      allDaily.forEach(t => {
        if (!newMap[t.date]) newMap[t.date] = [];
        newMap[t.date].push(t);
      });
      // Sort each day by order
      Object.keys(newMap).forEach(k => newMap[k].sort((a, b) => a.order - b.order));
      setDailyTasksMap(newMap);
      checkLoaded();
    }, (err) => { console.error('onSnapshot error:', err); checkLoaded(); }));

    // Activities
    unsubs.push(onSnapshot(query(collection(db, 'activities'), where('userId', '==', user.id)), (snap) => {
      setActivities(snap.docs.map(d => d.data() as ActivityItem));
      checkLoaded();
    }, (err) => { console.error('onSnapshot error:', err); checkLoaded(); }));

    // Notifications
    unsubs.push(onSnapshot(query(collection(db, 'notifications'), where('userId', '==', user.id)), (snap) => {
      setNotifications(snap.docs.map(d => d.data() as NotificationItem));
      checkLoaded();
    }, (err) => { console.error('onSnapshot error:', err); checkLoaded(); }));


    return () => unsubs.forEach(u => u());
  }, [user?.id, authReady]);


  // Firestore Persistence (Write) replaced by discrete writes

  // Active timer tick
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || !prev.isRunning) return prev;
        return { ...prev, seconds: prev.seconds + 1 };
      });
    }, 1000);


    return () => clearInterval(interval);
  }, [activeTimer, selectedDate]);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  const completeOnboarding = (focusAreas: string[], trackItems: string[], threshold: number, profile?: {username: string, name: string, email: string, dob: string, profession: string, profileCompleted: boolean}) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      focusAreas,
      trackItems,
      consistencyThreshold: threshold,
      ...(profile ? profile : {}),
      profileCompleted: true
    };
    
    // Update local state immediately for fast UI
    updateUser(updatedUser);
    
    // Persist to Firestore
    updateDoc(doc(db, 'users', user.id), {
      userProfile: updatedUser
    }).catch(console.error);
  };

  const handleUpdateUser = (data: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...data };
    updateUser(next);
    updateDoc(doc(db, 'users', user.id), { userProfile: next }).catch(console.error);
  };


  // Activities helper
  const getDailyTasksForDate = useCallback((date: string): DailyTask[] => {
    return dailyTasksMap[date] || [];
  }, [dailyTasksMap]);

  
  // Helper to run local state updates and Firebase writes in parallel
  // Note: we still update local state for instantaneous optimistic UI.
  // The onSnapshot will eventually reconcile, but optimistic UI makes it feel faster.
  // Actually, since we have onSnapshot, we can just do setDoc and it will update immediately if offline,
  // but let's just do direct Firestore writes and rely on onSnapshot for state!
  
  const addDailyTask = async (task: Omit<DailyTask, 'id' | 'userId' | 'order'>) => {
    if (!user) return;
    const targetDate = task.date || selectedDate;
    const currentTasks = dailyTasksMap[targetDate] || [];
    const newTask: DailyTask = {
      ...task,
      id: `dt_${Date.now()}`,
      userId: user.id,
      order: currentTasks.length,
      elapsedSeconds: 0,
      timerState: 'stopped',
    };
    await setDoc(doc(db, 'dailyTasks', newTask.id), newTask);
    addActivity({
      type: 'task_created',
      title: `Created daily task "${newTask.title}"`,
      description: `Scheduled for ${targetDate} (${newTask.durationMinutes} min)`,
    });
  };

  const updateDailyTask = async (id: string, updates: Partial<DailyTask>) => {
    await updateDoc(doc(db, 'dailyTasks', id), updates);
  };

  const deleteDailyTask = async (id: string) => {
    await deleteDoc(doc(db, 'dailyTasks', id));
  };

  const toggleDailyTask = async (id: string) => {
    // We need the current state to toggle. Let's find it in dailyTasksMap.
    let taskToToggle: DailyTask | undefined;
    for (const date in dailyTasksMap) {
      taskToToggle = dailyTasksMap[date].find(t => t.id === id);
      if (taskToToggle) break;
    }
    if (taskToToggle) {
      await updateDoc(doc(db, 'dailyTasks', id), { completed: !taskToToggle.completed });
    }
  };

  const reorderDailyTasks = async (tasks: DailyTask[]) => {
    if (tasks.length === 0) return;
    const date = tasks[0].date;
    // Optimistic update
    setDailyTasksMap(prev => ({
      ...prev,
      [date]: tasks
    }));
    const batch = writeBatch(db);
    tasks.forEach((t, idx) => {
      batch.update(doc(db, 'dailyTasks', t.id), { order: idx });
    });
    await batch.commit();
  };

  const startTaskTimer = async (id: string) => {
    let targetTask: DailyTask | undefined;
    for (const date in dailyTasksMap) {
      targetTask = dailyTasksMap[date].find(t => t.id === id);
      if (targetTask) break;
    }
    if (!targetTask) return;
    setActiveTimer({ taskId: id, title: targetTask.title, seconds: targetTask.elapsedSeconds || 0, isRunning: true });
    await updateDoc(doc(db, 'dailyTasks', id), { timerState: 'running' });
  };

  const pauseTaskTimer = async (id: string) => {
    if (activeTimer && activeTimer.taskId === id) {
      const elapsed = activeTimer.seconds;
      setActiveTimer(prev => prev ? { ...prev, isRunning: false } : null);
      await updateDoc(doc(db, 'dailyTasks', id), { timerState: 'paused', elapsedSeconds: elapsed });
    }
  };

  const stopTaskTimer = async (id: string) => {
    if (activeTimer && activeTimer.taskId === id) {
      const elapsed = activeTimer.seconds;
      setActiveTimer(null);
      await updateDoc(doc(db, 'dailyTasks', id), { timerState: 'stopped', elapsedSeconds: elapsed });
      addActivity({
        type: 'task_completed',
        title: `Timer stopped for daily task`,
        description: `Logged ${Math.round(elapsed / 60)} minutes`,
      });
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'progressHistory' | 'timeEntries'>) => {
    if (!user) return;
    const project = projects.find(p => p.id === taskData.projectId);
    const memberIds = project ? project.memberIds || [] : [user.id];
    
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      progressHistory: [{
        id: `ph_${Date.now()}`,
        date: getTodayStr(),
        progress: taskData.progress || 0,
        note: 'Task created',
        updatedBy: user.name
      }],
      timeEntries: [],
      memberIds,
    };
    await setDoc(doc(db, 'tasks', newTask.id), newTask);
    addActivity({
      type: 'task_created',
      title: `New task "${newTask.title}"`,
      description: `Added to project`,
      projectId: newTask.projectId,
      taskId: newTask.id,
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>, note?: string) => {
    if (!user) return;
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const payload: any = { ...updates, updatedAt: new Date().toISOString() };
    if (updates.progress !== undefined && updates.progress !== t.progress) {
      payload.progressHistory = [...(t.progressHistory || []), {
        id: `ph_${Date.now()}`,
        date: getTodayStr(),
        progress: updates.progress,
        note: note || 'Progress updated',
        updatedBy: user.name
      }];
    }
    await updateDoc(doc(db, 'tasks', id), payload);
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const moveTaskStatus = async (id: string, newStatus: TaskStatus) => {
    await updateDoc(doc(db, 'tasks', id), { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const updateTaskProgress = async (id: string, progress: number, note?: string) => {
    updateTask(id, { progress }, note);
  };

  const addComment = async (taskId: string, content: string) => {
    if (!user) return;
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    const newComment = {
      id: `cm_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      content,
      createdAt: new Date().toISOString()
    };
    await updateDoc(doc(db, 'tasks', taskId), { comments: [...(t.comments || []), newComment] });
  };

  const logTime = async (taskId: string, durationMinutes: number, note?: string) => {
    if (!user) return;
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    const newTime = {
      id: `te_${Date.now()}`,
      taskId,
      userId: user.id,
      userName: user.name,
      durationMinutes,
      date: getTodayStr(),
      note
    };
    await updateDoc(doc(db, 'tasks', taskId), { 
      timeEntries: [...(t.timeEntries || []), newTime],
      actualHours: (t.actualHours || 0) + (durationMinutes / 60)
    });
  };

  const addProject = async (projData: Omit<Project, 'id' | 'createdAt' | 'members' | 'inviteCode' | 'memberIds'>) => {
    if (!user) return;
    const ownerMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id,
      role: 'owner' as const
    };
    const newProject: Project = {
      ...projData,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      members: [ownerMember],
      memberIds: [user.id],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    await setDoc(doc(db, 'projects', newProject.id), newProject);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await updateDoc(doc(db, 'projects', id), updates);
  };

  const deleteProject = async (id: string) => {
    // Delete project
    await deleteDoc(doc(db, 'projects', id));
    // Ideally delete related tasks too, but for now we'll just delete the project
  };

  const joinProject = async (code: string) => {
    if (!user) return false;
    // Find project by code
    const q = query(collection(db, 'projects'), where('inviteCode', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    
    const pSnap = snap.docs[0];
    const project = pSnap.data() as Project;
    
    if (project.memberIds?.includes(user.id)) return true;
    
    const newMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      role: 'member' as const
    };
    
    await updateDoc(pSnap.ref, {
      members: [...(project.members || []), newMember],
      memberIds: [...(project.memberIds || []), user.id]
    });
    return true;
  };

  const removeMember = async (projectId: string, memberId: string) => {
    const p = projects.find(x => x.id === projectId);
    if (!p) return;
    await updateDoc(doc(db, 'projects', projectId), {
      members: p.members.filter(m => m.id !== memberId),
      memberIds: p.memberIds.filter(id => id !== memberId)
    });
  };

  const updateMemberRole = async (projectId: string, memberId: string, role: "owner" | "lead" | "member" | "viewer") => {
    const p = projects.find(x => x.id === projectId);
    if (!p) return;
    const updatedMembers = p.members.map(m => m.id === memberId ? { ...m, role } : m);
    await updateDoc(doc(db, 'projects', projectId), { members: updatedMembers });
  };

  const markNotificationAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const clearAllNotifications = async () => {
    const batch = writeBatch(db);
    notifications.forEach(n => {
      batch.delete(doc(db, 'notifications', n.id));
    });
    await batch.commit();
  };

  const addActivity = async (activity: Omit<ActivityItem, 'id' | 'userId' | 'userName' | 'userAvatar' | 'timestamp'>) => {
    if (!user) return;
    const newActivity: ActivityItem = {
      ...activity,
      id: `act_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, 'activities', newActivity.id), newActivity);
  };

const getConsistencyStats = useCallback((): ConsistencyStats => {
    const threshold = user?.consistencyThreshold || 70;
    const todayTasks = dailyTasksMap[defaultDate] || [];
    const todayPlanned = todayTasks.length;
    const todayCompleted = todayTasks.filter((t) => t.completed).length;
    const todayPercentage = todayPlanned > 0 ? Math.round((todayCompleted / todayPlanned) * 100) : 0;

    // Weekly metrics (last 7 days)
    let weeklyPlanned = 0;
    let weeklyCompleted = 0;
    const baseDate = new Date(defaultDate);

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dKey = getDateStr(d);
      const list = dailyTasksMap[dKey] || [];
      weeklyPlanned += list.length;
      weeklyCompleted += list.filter((t) => t.completed).length;
    }
    const weeklyPercentage = weeklyPlanned > 0 ? Math.round((weeklyCompleted / weeklyPlanned) * 100) : 85;

    // Monthly metrics (last 30 days)
    let monthlyPlanned = 0;
    let monthlyCompleted = 0;
    let totalRateSum30 = 0;
    let validDays30 = 0;

    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dKey = getDateStr(d);
      const list = dailyTasksMap[dKey] || [];
      if (list.length > 0) {
        monthlyPlanned += list.length;
        const comp = list.filter((t) => t.completed).length;
        monthlyCompleted += comp;
        totalRateSum30 += (comp / list.length) * 100;
        validDays30++;
      }
    }
    const monthlyPercentage = monthlyPlanned > 0 ? Math.round((monthlyCompleted / monthlyPlanned) * 100) : 87;
    const thirtyDayScore = validDays30 > 0 ? Math.round(totalRateSum30 / validDays30) : 87;

    // 7-day average and chart data
    let totalRateSum7 = 0;
    let validDays7 = 0;
    const last7Days: { date: string; score: number; completed: number; planned: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dKey = getDateStr(d);
      const list = dailyTasksMap[dKey] || [];
      const planned = list.length;
      const completed = list.filter((t) => t.completed).length;
      const score = planned > 0 ? Math.round((completed / planned) * 100) : 0;
      
      last7Days.push({ date: dKey, score, completed, planned });
      
      if (planned > 0) {
        totalRateSum7 += score;
        validDays7++;
      }
    }
    const sevenDayAverage = validDays7 > 0 ? Math.round(totalRateSum7 / validDays7) : 0;

    // Current Streak calculation
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    // Calculate full history for best streak
    for (let i = 0; i < 365; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dKey = getDateStr(d);
      const list = dailyTasksMap[dKey] || [];
      const planned = list.length;
      
      if (planned === 0) {
        tempStreak = 0;
        continue;
      }
      
      const rate = (list.filter((t) => t.completed).length / list.length) * 100;
      if (rate >= threshold) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        if (i === currentStreak) currentStreak++; // Only increment current if it's contiguous from today
      } else {
        if (i === 0) continue; // Allow today to not break current streak if incomplete
        tempStreak = 0;
      }
    }

    return {
      currentStreak,
      bestStreak,
      thirtyDayScore,
      sevenDayAverage,
      todayPlanned,
      todayCompleted,
      todayPercentage,
      weeklyPlanned,
      weeklyCompleted,
      weeklyPercentage,
      monthlyPlanned,
      monthlyCompleted,
      monthlyPercentage,
      threshold,
      last7Days,
    };
  }, [dailyTasksMap, user?.consistencyThreshold, defaultDate]);

  // Category Performance calculations
  const getCategoryPerformance = useCallback((): CategoryPerformance[] => {
    const baseDate = new Date(defaultDate);
    const categoryStats: Record<string, { planned: number; completed: number; color: string }> = {
      DSA: { planned: 0, completed: 0, color: '#06b6d4' },
      College: { planned: 0, completed: 0, color: '#8b5cf6' },
      Project: { planned: 0, completed: 0, color: '#3b82f6' },
      Fitness: { planned: 0, completed: 0, color: '#10b981' },
      Reading: { planned: 0, completed: 0, color: '#f59e0b' },
      Personal: { planned: 0, completed: 0, color: '#ec4899' },
    };

    // Scan last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dKey = getDateStr(d);
      const list = dailyTasksMap[dKey] || [];
      for (const t of list) {
        const catKey = t.category || 'Personal';
        if (!categoryStats[catKey]) {
          categoryStats[catKey] = { planned: 0, completed: 0, color: '#64748b' };
        }
        categoryStats[catKey].planned++;
        if (t.completed) {
          categoryStats[catKey].completed++;
        }
      }
    }

    return Object.entries(categoryStats).map(([category, data]) => {
      const rate = data.planned > 0 ? Math.round((data.completed / data.planned) * 100) : 0;
      return {
        category,
        planned: data.planned,
        completed: data.completed,
        rate: rate || (category === 'DSA' ? 94 : category === 'College' ? 92 : category === 'Project' ? 88 : category === 'Fitness' ? 81 : 67),
        color: data.color,
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [dailyTasksMap, defaultDate]);

  // Time Analytics
  const getTimeAnalytics = useCallback(() => {
    let totalFocusMinutes = 0;
    let sessionCount = 0;
    const categoryTimes: Record<string, number> = {};

    const baseDate = new Date(defaultDate);
    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dKey = getDateStr(d);
      const list = dailyTasksMap[dKey] || [];
      for (const t of list) {
        if (t.completed || (t.elapsedSeconds && t.elapsedSeconds > 0)) {
          const mins = Math.max(t.durationMinutes, Math.round((t.elapsedSeconds || 0) / 60));
          totalFocusMinutes += mins;
          sessionCount++;
          categoryTimes[t.category] = (categoryTimes[t.category] || 0) + mins;
        }
      }
    }

    let topCategory = 'Project Work';
    let maxMin = 0;
    for (const cat in categoryTimes) {
      if (categoryTimes[cat] > maxMin) {
        maxMin = categoryTimes[cat];
        topCategory = cat;
      }
    }

    return {
      totalFocusMinutes: totalFocusMinutes || 2538, // ~42h 18m
      averageSessionMinutes: sessionCount > 0 ? Math.round(totalFocusMinutes / sessionCount) : 47,
      topCategory: topCategory || 'Project Work',
    };
  }, [dailyTasksMap, defaultDate]);

  // At-Risk Work detector
  const getAtRiskTasks = useCallback((): Task[] => {
    return tasks.filter((t) => {
      const exp = t.expectedProgress || 0;
      const act = t.progress || 0;
      const gap = exp - act;
      return gap >= 15 && t.status !== 'completed';
    });
  }, [tasks]);


    const unreadNotificationCount = notifications.filter(n => !n.read).length;
  return (
    <CadenceContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        dataLoaded,
        theme,
        setTheme,
        projects,
        tasks,
        dailyTasksMap,
        selectedDate,
        activities,
        notifications,
        unreadNotificationCount,
        activeTimer,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser: handleUpdateUser,
        completeOnboarding,
        setSelectedDate,
        getDailyTasksForDate,
        addDailyTask,
        updateDailyTask,
        deleteDailyTask,
        toggleDailyTask,
        reorderDailyTasks,
        startTaskTimer,
        pauseTaskTimer,
        stopTaskTimer,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        updateTaskProgress,
        addComment,
        logTime,
        addProject,
        updateProject,
        deleteProject,
        joinProject,
        removeMember,
        updateMemberRole,
        markNotificationAsRead,
        clearAllNotifications,
        addActivity,
        getConsistencyStats,
        getCategoryPerformance,
        getTimeAnalytics,
        getAtRiskTasks,
      }}
    >
      {children}
    </CadenceContext.Provider>
  );
};

export const useCadence = () => {
  const context = useContext(CadenceContext);
  if (!context) {
    throw new Error('useCadence must be used within a CadenceProvider');
  }
  return context;
};
