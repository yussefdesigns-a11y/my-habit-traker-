
export type TimeHorizon = 'Weekly' | 'Monthly' | 'TwoMonth' | 'SixMonth';
export type Language = 'en' | 'ar';

export type InspirationType = 'image' | 'color' | 'font' | 'link';

export interface InspirationItem {
  id: string;
  type: InspirationType;
  title: string;
  category: string;
  content: string; // Base64 for images, hex for colors, URL for links, font-family for fonts
  notes: string;
  tags: string[];
  createdAt: string;
}

export interface DesignProject {
  id: string;
  clientName: string;
  projectName: string;
  projectType: string;
  status: 'In Progress' | 'Under Review' | 'Completed';
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  links: string[]; 
  progress: number;
  imageUrl?: string; // Base64 or URL for the project image
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  horizon: TimeHorizon;
  category: 'Business' | 'Fitness' | 'Spirituality' | 'Learning';
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted: boolean;
  targetDate?: string; // ISO string for the deadline
}

export interface Task {
  id: string;
  title: string;
  category: 'Business' | 'Fitness' | 'Spirituality' | 'Learning';
  isCompleted: boolean;
  isSkipped?: boolean;
  frequency: 'Daily' | 'Weekly';
  streakCount: number;
  lastCompletedDate?: string; // ISO string
  linkedGoalId?: string;
  linkedProjectId?: string; // New: link to project
  estimatedMinutes?: number; 
  actualMinutesSpent?: number; 
}

export interface FocusSession {
  id: string;
  taskId?: string;
  startTime: string; // ISO
  durationMinutes: number;
  type: 'focus' | 'shortBreak' | 'longBreak';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: 'Business' | 'Fitness' | 'Spirituality' | 'Learning';
  isCompleted: boolean;
  description?: string;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  mood: string;
  reflection: string;
  tasksSnapshot: {
    title: string;
    isCompleted: boolean;
    isSkipped: boolean;
  }[];
  incomeLogged: number;
}

export interface PrivateIntel {
  id: string;
  title: string;
  content: string;
  category: 'Strategy' | 'Financial' | 'Network';
  updatedAt: string;
}

export interface FinancialLog {
  id: string;
  amount: number;
  description: string;
  type: 'Credit' | 'Debit';
  date: string;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface AppState {
  goals: Goal[];
  tasks: Task[];
  projects: DesignProject[];
  inspiration: InspirationItem[]; 
  calendarEvents: CalendarEvent[];
  sessionHistory: FocusSession[]; 
  journal: any[]; 
  summaries: DailySummary[];
  privateIntel: PrivateIntel[];
  financialLogs: FinancialLog[];
  incomeTotal: number;
  thumbnails: string[]; 
  dailyMoods: Record<string, string>; 
  focusMinutesToday: number;
  restMinutesToday: number;
  totalSessionsCompleted: number;
  timerTimeLeft: number;
  isTimerActive: boolean;
  timerMode: TimerMode;
  activeFocusTaskId?: string;
  language: Language;
  rewardPoints: number; 
  totalXP: number; 
}
