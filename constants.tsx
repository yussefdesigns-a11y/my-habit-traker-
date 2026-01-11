
import React from 'react';
import { Goal, Task, CalendarEvent } from './types';
import { Briefcase, Activity, BookOpen, Heart } from 'lucide-react';

export const CATEGORY_COLORS = {
  Business: '#6366f1', // Electric Indigo
  Fitness: '#10b981', // Success Emerald
  Learning: '#f59e0b', // Amber Warning
  Spirituality: '#8b5cf6', // Deep Violet
};

export const CATEGORY_ICONS = {
  Business: <div style={{ color: CATEGORY_COLORS.Business }}><Briefcase className="w-5 h-5" /></div>,
  Fitness: <div style={{ color: CATEGORY_COLORS.Fitness }}><Activity className="w-5 h-5" /></div>,
  Learning: <div style={{ color: CATEGORY_COLORS.Learning }}><BookOpen className="w-5 h-5" /></div>,
  Spirituality: <div style={{ color: CATEGORY_COLORS.Spirituality }}><Heart className="w-5 h-5" /></div>,
};

export const INITIAL_GOALS: Goal[] = [
  { id: 'g1', title: 'Revenue Milestone: $1k', description: 'Initial online traction', horizon: 'SixMonth', category: 'Business', targetValue: 1000, currentValue: 120, unit: '$', isCompleted: false },
  { id: 'g2', title: 'Body Optimization: 85kg', description: 'Peak physical condition', horizon: 'SixMonth', category: 'Fitness', targetValue: 85, currentValue: 78, unit: 'kg', isCompleted: false },
  { id: 'm1', title: '25 Professional Assets', description: 'High-quality portfolio build', horizon: 'Monthly', category: 'Business', targetValue: 25, currentValue: 8, unit: 'Units', isCompleted: false },
];

export const INITIAL_TASKS: Task[] = [
  { id: 't9', title: 'High-Impact Work Block', category: 'Business', isCompleted: false, frequency: 'Daily', streakCount: 3, estimatedMinutes: 180 },
  { id: 't1', title: 'Early Rise: 05:30', category: 'Spirituality', isCompleted: true, frequency: 'Daily', streakCount: 5, estimatedMinutes: 15 },
  { id: 't3', title: 'Metabolic Shower', category: 'Fitness', isCompleted: false, frequency: 'Daily', streakCount: 2, estimatedMinutes: 10 },
  { id: 't10', title: 'Production Phase: 1 Unit', category: 'Business', isCompleted: false, frequency: 'Daily', streakCount: 1, estimatedMinutes: 60, linkedGoalId: 'm1' },
];

// Helper for dynamic dates
const getTodayStr = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Weekly Revenue Audit', date: getTodayStr(0), time: '09:00', category: 'Business', isCompleted: false, description: 'Review all payment gateways and pending invoices.' },
  { id: 'e2', title: 'Strategic Network Sync', date: getTodayStr(1), time: '11:30', category: 'Business', isCompleted: false, description: 'Briefing with lead development partners.' },
  { id: 'e3', title: 'Skill Acquisition: UI/UX', date: getTodayStr(0), time: '14:00', category: 'Learning', isCompleted: true, description: 'Mastering Figma prototyping for next asset build.' },
  { id: 'e4', title: 'Deep Cardio Session', date: getTodayStr(2), time: '07:00', category: 'Fitness', isCompleted: false, description: 'High-intensity interval training for peak metabolic rate.' },
  { id: 'e5', title: 'Friday Reflection & Reset', date: getTodayStr(3), time: '16:00', category: 'Spirituality', isCompleted: false, description: 'Quiet meditation and performance review of the weekly cycle.' }
];
