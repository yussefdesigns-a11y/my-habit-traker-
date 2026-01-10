
export type TimeHorizon = 'Weekly' | 'Monthly' | 'SixMonth';

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
  linkedGoalId?: string; // ID of the goal this task contributes to
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

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface AppState {
  goals: Goal[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  journal: any[]; 
  summaries: DailySummary[];
  incomeTotal: number;
  thumbnails: string[]; 
  dailyMoods: Record<string, string>; 
  focusMinutesToday: number;
  restMinutesToday: number;
  totalSessionsCompleted: number;
  // Global Timer State
  timerTimeLeft: number;
  isTimerActive: boolean;
  timerMode: TimerMode;
}
