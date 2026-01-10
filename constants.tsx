
import React from 'react';
import { Goal, Task } from './types';
import { Briefcase, Activity, BookOpen, Heart } from 'lucide-react';

export const CATEGORY_COLORS = {
  Business: '#10B981',
  Fitness: '#F43F5E',
  Learning: '#F59E0B',
  Spirituality: '#8B5CF6',
};

export const CATEGORY_ICONS = {
  Business: <div style={{ color: CATEGORY_COLORS.Business }} className="icon-3d"><Briefcase className="w-5 h-5" /></div>,
  Fitness: <div style={{ color: CATEGORY_COLORS.Fitness }} className="icon-3d"><Activity className="w-5 h-5" /></div>,
  Learning: <div style={{ color: CATEGORY_COLORS.Learning }} className="icon-3d"><BookOpen className="w-5 h-5" /></div>,
  Spirituality: <div style={{ color: CATEGORY_COLORS.Spirituality }} className="icon-3d"><Heart className="w-5 h-5" /></div>,
};

export const INITIAL_GOALS: Goal[] = [
  // 6-Month Goals
  { id: 'g1', title: 'Earn first $1,000 Online', description: 'Business milestone', horizon: 'SixMonth', category: 'Business', targetValue: 1000, currentValue: 0, unit: '$', isCompleted: false },
  { id: 'g2', title: 'Reach 85kg Body Weight', description: 'Target fitness level', horizon: 'SixMonth', category: 'Fitness', targetValue: 85, currentValue: 78, unit: 'kg', isCompleted: false },
  { id: 'g3', title: 'Master Sales & Marketing', description: 'Core skill acquisition', horizon: 'SixMonth', category: 'Learning', targetValue: 100, currentValue: 20, unit: '%', isCompleted: false },
  { id: 'g4', title: 'Spiritual Excellence', description: 'Daily discipline in Deen', horizon: 'SixMonth', category: 'Spirituality', targetValue: 100, currentValue: 40, unit: '%', isCompleted: false },
  
  // Monthly Goals
  { id: 'm1', title: 'Design 25 Thumbnails', description: 'Build professional portfolio', horizon: 'Monthly', category: 'Business', targetValue: 25, currentValue: 0, unit: 'Thumbnails', isCompleted: false },
  { id: 'm2', title: '16 Gym Workouts', description: 'Monthly fitness intensity', horizon: 'Monthly', category: 'Fitness', targetValue: 16, currentValue: 0, unit: 'Workouts', isCompleted: false },
  { id: 'm3', title: 'Fajr Consistency', description: 'Prayer on time streak', horizon: 'Monthly', category: 'Spirituality', targetValue: 30, currentValue: 0, unit: 'Days', isCompleted: false },
];

export const INITIAL_TASKS: Task[] = [
  // Spirituality
  { id: 't1', title: 'Wake up at 5:30 AM', category: 'Spirituality', isCompleted: false, frequency: 'Daily', streakCount: 0 },
  { id: 't2', title: 'PRAY FAJAR', category: 'Spirituality', isCompleted: false, frequency: 'Daily', streakCount: 0, linkedGoalId: 'm3' },
  
  // Fitness / Health
  { id: 't3', title: 'Cold Water (Shower)', category: 'Fitness', isCompleted: false, frequency: 'Daily', streakCount: 0 },
  { id: 't4', title: 'Drink 10 glasses of water', category: 'Fitness', isCompleted: false, frequency: 'Daily', streakCount: 0 },
  { id: 't5', title: 'Workout (4x/week)', category: 'Fitness', isCompleted: false, frequency: 'Weekly', streakCount: 0, linkedGoalId: 'm2' },
  
  // Learning
  { id: 't6', title: 'Learn Sales Skills', category: 'Learning', isCompleted: false, frequency: 'Daily', streakCount: 0 },
  { id: 't7', title: 'Learn English', category: 'Learning', isCompleted: false, frequency: 'Daily', streakCount: 0 },
  { id: 't8', title: 'Educational Podcast/Video (30m)', category: 'Learning', isCompleted: false, frequency: 'Daily', streakCount: 0 },
  
  // Business
  { id: 't9', title: 'Work 3 to 4 Hours', category: 'Business', isCompleted: false, frequency: 'Daily', streakCount: 0 },
  { id: 't10', title: 'Finish 1 Thumbnail', category: 'Business', isCompleted: false, frequency: 'Daily', streakCount: 0, linkedGoalId: 'm1' },
];
