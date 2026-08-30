import { getDateStr } from '../utils/dateUtils';
import { User, Project, Task, DailyTask, ActivityItem, NotificationItem } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_shivendra_1',
  name: 'Shivendra',
  email: 'shivendra@cadence.app',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Full-Stack Developer & Productivity Architect. Focused on daily deep work and consistent shipping.',
  timezone: 'Asia/Kolkata (GMT+5:30)',
  joinedDate: '2026-01-15',
  profileCompleted: false,
  focusAreas: ['Study', 'Work', 'Projects', 'Fitness'],
  trackItems: ['Daily Tasks', 'Projects', 'Consistency', 'Time'],
  consistencyThreshold: 70, // 70% threshold
};

export const INITIAL_MEMBERS = [
  {
    id: 'usr_shivendra_1',
    name: 'Shivendra',
    email: 'shivendra@cadence.app',
    role: 'owner' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_sarah_2',
    name: 'Sarah Chen',
    email: 'sarah.c@cadence.app',
    role: 'lead' as const,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_alex_3',
    name: 'Alex Rivera',
    email: 'alex.r@cadence.app',
    role: 'member' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_elena_4',
    name: 'Elena Rostova',
    email: 'elena@cadence.app',
    role: 'member' as const,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_marcus_5',
    name: 'Marcus Vance',
    email: 'marcus.v@cadence.app',
    role: 'viewer' as const,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_website_redesign',
    title: 'Website Redesign',
    description: 'Next-generation modern design overhaul for the core marketing website and user portal.',
    status: 'active',
    progress: 82,
    expectedProgress: 80,
    deadline: '2026-09-12', memberIds: ["usr_shivendra_1"],
    category: 'Design & Frontend',
    color: '#06b6d4', // cyan
    createdAt: '2026-08-01',
    members: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[1], INITIAL_MEMBERS[2]],
  },
  {
    id: 'proj_mobile_app',
    title: 'Mobile Application',
    description: 'Cross-platform iOS and Android mobile client built with React Native and offline sync.',
    status: 'active',
    progress: 64,
    expectedProgress: 75, // At risk gap
    deadline: '2026-09-28', memberIds: ["usr_shivendra_1"],
    category: 'Mobile Dev',
    color: '#8b5cf6', // violet
    createdAt: '2026-08-05',
    members: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[2], INITIAL_MEMBERS[3]],
  },
  {
    id: 'proj_marketing_campaign',
    title: 'Marketing Campaign',
    description: 'Q3 global developer adoption sprint, product hunt launch, and interactive demo sandboxes.',
    status: 'active',
    progress: 94,
    expectedProgress: 90,
    deadline: '2026-09-05', memberIds: ["usr_shivendra_1"],
    category: 'Growth',
    color: '#10b981', // emerald
    createdAt: '2026-07-20',
    members: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[1], INITIAL_MEMBERS[4]],
  },
  {
    id: 'proj_ai_assistant',
    title: 'AI Productivity Assistant',
    description: 'Smart rhythm synthesizer analyzing time blocks and weekly consistency velocity.',
    status: 'active',
    progress: 45,
    expectedProgress: 50,
    deadline: '2026-10-15', memberIds: ["usr_shivendra_1"],
    category: 'AI Engine',
    color: '#3b82f6', // blue
    createdAt: '2026-08-15',
    members: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[3]],
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_api_integration',
    projectId: 'proj_website_redesign',
    projectName: 'Website Redesign',
    title: 'API Integration',
    description: 'Connect REST and WebSocket endpoints for real-time task updates and consistency sync.',
    status: 'in_progress',
    priority: 'high',
    progress: 62,
    expectedProgress: 85, // -23% gap -> At Risk!
    deadline: '2026-09-02', memberIds: ["usr_shivendra_1"],
    estimatedHours: 8,
    actualHours: 6,
    assignee: INITIAL_MEMBERS[0],
    tags: ['Backend', 'WebSocket', 'Security'],
    createdAt: '2026-08-20',
    updatedAt: '2026-08-28T21:40:00Z',
    comments: [
      {
        id: 'comm_1',
        userId: 'usr_sarah_2',
        userName: 'Sarah Chen',
        userAvatar: INITIAL_MEMBERS[1].avatar,
        content: 'JWT refresh token route is tested and ready. Let me know once WebSocket handshake is verified.',
        createdAt: '2026-08-28T18:30:00Z',
      },
      {
        id: 'comm_2',
        userId: 'usr_shivendra_1',
        userName: 'Shivendra',
        userAvatar: INITIAL_MEMBERS[0].avatar,
        content: 'Working on subscription multiplexing now. Progress is at 62%, on track for morning test.',
        createdAt: '2026-08-28T20:15:00Z',
      },
    ],
    progressHistory: [
      { id: 'ph_1', date: '2026-08-24', progress: 15, note: 'Initial schema created', updatedBy: 'Shivendra' },
      { id: 'ph_2', date: '2026-08-26', progress: 40, note: 'REST handlers implemented', updatedBy: 'Shivendra' },
      { id: 'ph_3', date: '2026-08-27', progress: 55, note: 'Auth middleware added', updatedBy: 'Shivendra' },
      { id: 'ph_4', date: '2026-08-28', progress: 62, note: 'WebSocket channel connected', updatedBy: 'Shivendra' },
    ],
    timeEntries: [
      { id: 'te_1', taskId: 'task_api_integration', userId: 'usr_shivendra_1', userName: 'Shivendra', durationMinutes: 180, date: '2026-08-27', note: 'Core endpoints' },
      { id: 'te_2', taskId: 'task_api_integration', userId: 'usr_shivendra_1', userName: 'Shivendra', durationMinutes: 180, date: '2026-08-28', note: 'Realtime events' },
    ],
  },
  {
    id: 'task_login_ui',
    projectId: 'proj_website_redesign',
    projectName: 'Website Redesign',
    title: 'Login UI & Glassmorphism Design',
    description: 'Polished glassmorphism auth flow with password strength meter and seamless social logins.',
    status: 'completed',
    priority: 'high',
    progress: 100,
    expectedProgress: 100,
    deadline: '2026-08-28', memberIds: ["usr_shivendra_1"],
    estimatedHours: 6,
    actualHours: 5,
    assignee: INITIAL_MEMBERS[0],
    tags: ['UI/UX', 'Auth', 'Tailwind'],
    createdAt: '2026-08-22',
    updatedAt: '2026-08-28T22:50:00Z',
    comments: [
      {
        id: 'comm_3',
        userId: 'usr_alex_3',
        userName: 'Alex Rivera',
        userAvatar: INITIAL_MEMBERS[2].avatar,
        content: 'The glassmorphic depth on the form is super clean! Approved.',
        createdAt: '2026-08-28T22:45:00Z',
      },
    ],
    progressHistory: [
      { id: 'ph_5', date: '2026-08-25', progress: 30, note: 'Wireframes & SVG mark', updatedBy: 'Shivendra' },
      { id: 'ph_6', date: '2026-08-27', progress: 70, note: 'Interactive states & forms', updatedBy: 'Shivendra' },
      { id: 'ph_7', date: '2026-08-28', progress: 100, note: 'Completed & reviewed', updatedBy: 'Shivendra' },
    ],
    timeEntries: [
      { id: 'te_3', taskId: 'task_login_ui', userId: 'usr_shivendra_1', userName: 'Shivendra', durationMinutes: 300, date: '2026-08-28', note: 'Polished UI & micro-interactions' },
    ],
  },
  {
    id: 'task_kanban_dnd',
    projectId: 'proj_website_redesign',
    projectName: 'Website Redesign',
    title: 'Kanban Drag & Drop Architecture',
    description: 'Fluid drag and drop column sorting with optimistic UI updates and backend persistence.',
    status: 'in_progress',
    priority: 'high',
    progress: 80,
    expectedProgress: 80,
    deadline: '2026-09-04', memberIds: ["usr_shivendra_1"],
    estimatedHours: 10,
    actualHours: 8,
    assignee: INITIAL_MEMBERS[2],
    tags: ['Kanban', 'Interactions'],
    createdAt: '2026-08-24',
    updatedAt: '2026-08-28T19:00:00Z',
    comments: [],
    progressHistory: [
      { id: 'ph_8', date: '2026-08-26', progress: 40, note: 'Column wrappers setup', updatedBy: 'Alex Rivera' },
      { id: 'ph_9', date: '2026-08-28', progress: 80, note: 'Added drag listeners and drop zones', updatedBy: 'Alex Rivera' },
    ],
    timeEntries: [],
  },
  {
    id: 'task_analytics_charts',
    projectId: 'proj_website_redesign',
    projectName: 'Website Redesign',
    title: 'Productivity Analytics & Velocity Charts',
    description: 'Build Recharts-powered interactive trends, time breakdown, and velocity bar charts.',
    status: 'review',
    priority: 'medium',
    progress: 90,
    expectedProgress: 90,
    deadline: '2026-09-03', memberIds: ["usr_shivendra_1"],
    estimatedHours: 8,
    actualHours: 7,
    assignee: INITIAL_MEMBERS[1],
    tags: ['Analytics', 'Recharts'],
    createdAt: '2026-08-21',
    updatedAt: '2026-08-28T17:00:00Z',
    comments: [],
    progressHistory: [
      { id: 'ph_10', date: '2026-08-25', progress: 50, note: 'Velocity calculations', updatedBy: 'Sarah Chen' },
      { id: 'ph_11', date: '2026-08-28', progress: 90, note: 'Interactive tooltips styled', updatedBy: 'Sarah Chen' },
    ],
    timeEntries: [],
  },
  {
    id: 'task_offline_cache',
    projectId: 'proj_mobile_app',
    projectName: 'Mobile Application',
    title: 'Offline Local State Cache Engine',
    description: 'Implement SQLite & MMKV persistence with auto background conflict resolution.',
    status: 'todo',
    priority: 'high',
    progress: 25,
    expectedProgress: 40, // at risk
    deadline: '2026-09-10', memberIds: ["usr_shivendra_1"],
    estimatedHours: 12,
    actualHours: 3,
    assignee: INITIAL_MEMBERS[3],
    tags: ['Mobile', 'Cache', 'SQLite'],
    createdAt: '2026-08-24',
    updatedAt: '2026-08-27T10:00:00Z',
    comments: [],
    progressHistory: [],
    timeEntries: [],
  },
  {
    id: 'task_push_notifications',
    projectId: 'proj_mobile_app',
    projectName: 'Mobile Application',
    title: 'Smart Daily Streak Push Reminders',
    description: 'Dynamic push notifications scheduled based on user daily rhythm and unfinished task count.',
    status: 'backlog',
    priority: 'medium',
    progress: 0,
    expectedProgress: 0,
    deadline: '2026-09-20', memberIds: ["usr_shivendra_1"],
    estimatedHours: 6,
    actualHours: 0,
    assignee: INITIAL_MEMBERS[3],
    tags: ['Mobile', 'Notifications'],
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25T10:00:00Z',
    comments: [],
    progressHistory: [],
    timeEntries: [],
  },
  {
    id: 'task_press_kit',
    projectId: 'proj_marketing_campaign',
    projectName: 'Marketing Campaign',
    title: 'Product Hunt Launch & Interactive Playground',
    description: 'Assemble high-resolution glassmorphism previews, interactive live demo sandbox, and press release.',
    status: 'review',
    priority: 'urgent',
    progress: 95,
    expectedProgress: 95,
    deadline: '2026-09-01', memberIds: ["usr_shivendra_1"],
    estimatedHours: 15,
    actualHours: 14,
    assignee: INITIAL_MEMBERS[4],
    tags: ['Marketing', 'ProductHunt', 'Media'],
    createdAt: '2026-08-18',
    updatedAt: '2026-08-28T15:00:00Z',
    comments: [],
    progressHistory: [],
    timeEntries: [],
  },
];

export const INITIAL_TODAY_DAILY_TASKS: DailyTask[] = [
  {
    id: 'dt_1',
    userId: 'usr_shivendra_1',
    title: 'DSA Practice',
    date: '2026-08-29',
    completed: true,
    durationMinutes: 60,
    priority: 'high',
    category: 'Study',
    scheduledTime: '08:00 AM',
    notes: 'Graphs: Dijkstra algorithm and topological sort practice.',
    order: 0,
    elapsedSeconds: 3600,
    timerState: 'stopped',
  },
  {
    id: 'dt_2',
    userId: 'usr_shivendra_1',
    title: 'College Study',
    date: '2026-08-29',
    completed: true,
    durationMinutes: 90,
    priority: 'medium',
    category: 'College',
    scheduledTime: '10:00 AM',
    notes: 'Operating Systems chapter 6: Deadlocks and Banker Algorithm.',
    order: 1,
    elapsedSeconds: 5400,
    timerState: 'stopped',
  },
  {
    id: 'dt_3',
    userId: 'usr_shivendra_1',
    title: 'Project Work',
    date: '2026-08-29',
    completed: true,
    durationMinutes: 60,
    priority: 'high',
    category: 'Project',
    scheduledTime: '02:00 PM',
    notes: 'Cadence glassmorphism design system & Kanban backend sync.',
    order: 2,
    elapsedSeconds: 3600,
    timerState: 'stopped',
  },
  {
    id: 'dt_4',
    userId: 'usr_shivendra_1',
    title: 'Workout',
    date: '2026-08-29',
    completed: true,
    durationMinutes: 30,
    priority: 'medium',
    category: 'Fitness',
    scheduledTime: '05:30 PM',
    notes: 'Upper body hypertrophy + 10 min dynamic stretching.',
    order: 3,
    elapsedSeconds: 1800,
    timerState: 'stopped',
  },
  {
    id: 'dt_5',
    userId: 'usr_shivendra_1',
    title: 'Reading',
    date: '2026-08-29',
    completed: true,
    durationMinutes: 30,
    priority: 'low',
    category: 'Personal',
    scheduledTime: '09:00 PM',
    notes: 'Atomic Habits - Chapter 12: The Law of Least Effort.',
    order: 4,
    elapsedSeconds: 1800,
    timerState: 'stopped',
  },
  {
    id: 'dt_6',
    userId: 'usr_shivendra_1',
    title: 'Revision',
    date: '2026-08-29',
    completed: false,
    durationMinutes: 30,
    priority: 'medium',
    category: 'Study',
    scheduledTime: '10:30 PM',
    notes: 'Spaced repetition flashcards for computer networks.',
    order: 5,
    elapsedSeconds: 0,
    timerState: 'stopped',
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    userId: 'usr_shivendra_1',
    userName: 'Shivendra',
    userAvatar: INITIAL_MEMBERS[0].avatar,
    type: 'task_completed',
    title: 'Completed Login UI',
    description: 'Polished glassmorphism auth layout and password strength validation.',
    timestamp: '2 minutes ago',
    projectId: 'proj_website_redesign',
    taskId: 'task_login_ui',
  },
  {
    id: 'act_2',
    userId: 'usr_shivendra_1',
    userName: 'Shivendra',
    userAvatar: INITIAL_MEMBERS[0].avatar,
    type: 'progress_updated',
    title: 'Updated API Integration',
    description: '60% → 80% with real-time websocket synchronization',
    timestamp: '25 minutes ago',
    projectId: 'proj_website_redesign',
    taskId: 'task_api_integration',
  },
  {
    id: 'act_3',
    userId: 'usr_sarah_2',
    userName: 'Sarah Chen',
    userAvatar: INITIAL_MEMBERS[1].avatar,
    type: 'project_updated',
    title: 'Project deadline updated',
    description: 'Website Redesign milestone confirmed for Sep 12, 2026.',
    timestamp: '2 hours ago',
    projectId: 'proj_website_redesign',
  },
  {
    id: 'act_4',
    userId: 'usr_shivendra_1',
    userName: 'Shivendra',
    userAvatar: INITIAL_MEMBERS[0].avatar,
    type: 'streak_milestone',
    title: '12-Day Streak Achieved!',
    description: 'You maintained consistency above 70% for 12 consecutive days.',
    timestamp: '5 hours ago',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Task Reminder',
    message: 'Your Revision task is scheduled for 10:30 PM.',
    timestamp: '15 minutes ago',
    read: false,
    type: 'task_reminder',
  },
  {
    id: 'notif_2',
    title: 'Rhythm Status',
    message: 'You have 1 task remaining today to achieve 100% daily rhythm!',
    timestamp: '1 hour ago',
    read: false,
    type: 'streak_alert',
  },
  {
    id: 'notif_3',
    title: 'At-Risk Work Notice',
    message: 'API Integration progress gap is at -23% compared to expected timeline.',
    timestamp: '3 hours ago',
    read: false,
    type: 'deadline_warning',
  },
  {
    id: 'notif_4',
    title: 'Streak Milestone 🔥',
    message: "You're on a 12-day streak. Keep your momentum going!",
    timestamp: '1 day ago',
    read: true,
    type: 'streak_alert',
  },
];

// Helper to generate 45 days of rich historical consistency data for GitHub-style Heatmap & charts
export function generateHistoricalDailyRecords(todayStr = '2026-08-29'): Record<string, DailyTask[]> {
  const records: Record<string, DailyTask[]> = {};
  
  // Base date
  const today = new Date(todayStr);

  const sampleTasksPool = [
    { title: 'DSA Practice', cat: 'Study', duration: 60 },
    { title: 'College Study', cat: 'College', duration: 90 },
    { title: 'Project Work', cat: 'Project', duration: 60 },
    { title: 'Workout', cat: 'Fitness', duration: 30 },
    { title: 'Reading', cat: 'Personal', duration: 30 },
    { title: 'Revision', cat: 'Study', duration: 30 },
    { title: 'System Design', cat: 'Study', duration: 45 },
    { title: 'Code Review', cat: 'Work', duration: 30 },
  ];

  // 45 days backwards
  for (let i = 45; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = getDateStr(d);

    if (dateKey === todayStr) {
      records[dateKey] = INITIAL_TODAY_DAILY_TASKS;
      continue;
    }

    // Determine completion rate to create realistic 12-day active streak ending today
    // For the last 12 days (i <= 12), completion is >= 75%
    let completionRatio = 0.85;
    if (i === 13) {
      // Break point 13 days ago (created the 12-day current streak)
      completionRatio = 0.50; // Failed day (< 70%)
    } else if (i > 13 && i <= 40) {
      // Previous solid streak run (best streak = 27 days)
      completionRatio = (i % 7 === 0) ? 0.60 : 0.88;
    } else if (i > 40) {
      completionRatio = 0.75;
    }

    const dayTaskCount = 5 + (i % 3); // 5 to 7 tasks
    const dayTasks: DailyTask[] = [];

    for (let t = 0; t < dayTaskCount; t++) {
      const sample = sampleTasksPool[t % sampleTasksPool.length];
      const isCompleted = (t / dayTaskCount) < completionRatio;
      
      dayTasks.push({
        id: `hist_${dateKey}_${t}`,
        userId: 'usr_shivendra_1',
        title: sample.title,
        date: dateKey,
        completed: isCompleted,
        durationMinutes: sample.duration,
        priority: t === 0 ? 'high' : t === 1 ? 'medium' : 'low',
        category: sample.cat,
        order: t,
        elapsedSeconds: isCompleted ? sample.duration * 60 : 0,
        timerState: 'stopped',
      });
    }

    records[dateKey] = dayTasks;
  }

  return records;
}
