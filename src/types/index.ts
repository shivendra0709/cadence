export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  dob?: string;
  profession?: string;
  profileCompleted?: boolean;
  avatar?: string;
  bio?: string;
  timezone: string;
  joinedDate: string;
  focusAreas?: string[];
  trackItems?: string[];
  consistencyThreshold: number; // e.g. 70
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'lead' | 'member' | 'viewer';
  avatar: string;
}

export interface ProgressHistoryPoint {
  id: string;
  date: string; // ISO date string or YYYY-MM-DD
  progress: number; // 0 - 100
  note?: string;
  updatedBy: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  durationMinutes: number;
  date: string;
  note?: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  memberIds: string[];
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0 - 100
  expectedProgress?: number; // for at-risk calculations
  deadline: string; // YYYY-MM-DD
  reminderTime?: string;
  estimatedHours: number;
  actualHours: number;
  assignee: ProjectMember;
  tags: string[];
  comments: Comment[];
  progressHistory: ProgressHistoryPoint[];
  timeEntries: TimeEntry[];
  attachments?: { name: string; size: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  progress: number; // 0 - 100
  expectedProgress: number;
  deadline: string;
  members: ProjectMember[];
  memberIds: string[];
  inviteCode?: string;
  category: string;
  color: string;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  durationMinutes: number;
  priority: TaskPriority;
  category: string;
  scheduledTime?: string; // e.g. "09:00 AM"
  reminderTime?: string;
  notes?: string;
  projectId?: string;
  order: number;
  timerState?: 'stopped' | 'running' | 'paused';
  elapsedSeconds?: number;
}

export interface DailySummary {
  date: string;
  planned: number;
  completed: number;
  consistencyPercentage: number;
  qualifiedForStreak: boolean;
  tasks: DailyTask[];
}

export interface ConsistencyStats {
  currentStreak: number;
  bestStreak: number;
  thirtyDayScore: number;
  sevenDayAverage: number;
  todayPlanned: number;
  todayCompleted: number;
  todayPercentage: number;
  weeklyPlanned: number;
  weeklyCompleted: number;
  weeklyPercentage: number;
  monthlyPlanned: number;
  monthlyCompleted: number;
  monthlyPercentage: number;
  threshold: number;
  last7Days: { date: string; score: number; completed: number; planned: number }[];
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'task_completed' | 'progress_updated' | 'task_created' | 'project_updated' | 'streak_milestone' | 'comment_added';
  title: string;
  description: string;
  timestamp: string;
  projectId?: string;
  taskId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'task_reminder' | 'deadline_warning' | 'streak_alert' | 'comment' | 'project_update';
  linkUrl?: string;
}

export interface CategoryPerformance {
  category: string;
  completed: number;
  planned: number;
  rate: number;
  color: string;
}
