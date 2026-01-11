
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import GoalCard from './components/GoalCard';
import HabitTracker from './components/HabitTracker';
import PomodoroTimer from './components/PomodoroTimer';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import ProjectManager from './components/ProjectManager';
import InspirationBoard from './components/InspirationBoard';
import SecureVault from './components/SecureVault';
import { AppState, Goal, Task, DailySummary, TimerMode, CalendarEvent, TimeHorizon, FocusSession, Language, DesignProject, InspirationItem, PrivateIntel, FinancialLog } from './types';
import { INITIAL_GOALS, INITIAL_TASKS } from './constants';
import { getDailyMotivation, getStrategicPerformanceReport } from './services/geminiService';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { audio } from './services/audioService';
import { translations } from './translations';
import { 
  Plus, X, ShieldCheck, 
  Zap, Smile, 
  ArrowRight, History,
  Activity, Timer, Coffee, CheckCircle,
  TrendingUp, Target, DollarSign, ListTodo,
  TrendingDown, Brain, Calendar as CalendarIcon,
  Award, Star, Rocket, Play
} from 'lucide-react';

const TIMER_MODES: Record<TimerMode, { label: string; time: number; color: string }> = {
  focus: { label: 'Deep Work', time: 25, color: '#2eaadc' },
  shortBreak: { label: 'Short Rest', time: 5, color: '#10B981' },
  longBreak: { label: 'Long Rest', time: 15, color: '#8B5CF6' }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [motivation, setMotivation] = useState<string>('Loading inspiration...');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [strategicReport, setStrategicReport] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    category: 'Business' as Task['category'],
    frequency: 'Daily' as Task['frequency'],
    estimatedMinutes: 25
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    horizon: 'Monthly' as TimeHorizon,
    category: 'Business' as Goal['category'],
    targetValue: 0,
    unit: '',
    durationDays: 30
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('youssef_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...parsed,
        sessionHistory: parsed.sessionHistory || [],
        language: parsed.language || 'en',
        rewardPoints: parsed.rewardPoints || 0,
        totalXP: parsed.totalXP || 0,
        projects: parsed.projects || [],
        inspiration: parsed.inspiration || [],
        privateIntel: parsed.privateIntel || [],
        financialLogs: parsed.financialLogs || []
      };
    }
    return {
      goals: INITIAL_GOALS,
      tasks: INITIAL_TASKS,
      projects: [],
      inspiration: [],
      privateIntel: [],
      financialLogs: [],
      calendarEvents: [],
      sessionHistory: [],
      journal: [],
      summaries: [],
      incomeTotal: 0,
      thumbnails: [],
      dailyMoods: {},
      focusMinutesToday: 0,
      restMinutesToday: 0,
      totalSessionsCompleted: 0,
      timerTimeLeft: TIMER_MODES.focus.time * 60,
      isTimerActive: false,
      timerMode: 'focus',
      activeFocusTaskId: undefined,
      language: 'en',
      rewardPoints: 0,
      totalXP: 0
    };
  });

  const t = translations[state.language];

  useEffect(() => {
    localStorage.setItem('youssef_app_state', JSON.stringify(state));
  }, [state]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.isTimerActive && state.timerTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, timerTimeLeft: prev.timerTimeLeft - 1 }));
      }, 1000);
    } else if (state.timerTimeLeft === 0) {
      handleTimerEnd();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isTimerActive, state.timerTimeLeft === 0]);

  const setLanguage = (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const toggleTimer = () => {
    setState(prev => ({ ...prev, isTimerActive: !prev.isTimerActive }));
  };

  const resetTimer = () => {
    setState(prev => ({ 
      ...prev, 
      isTimerActive: false, 
      timerTimeLeft: TIMER_MODES[prev.timerMode].time * 60 
    }));
  };

  const changeTimerMode = (mode: TimerMode) => {
    setState(prev => ({ 
      ...prev, 
      timerMode: mode, 
      timerTimeLeft: TIMER_MODES[mode].time * 60,
      isTimerActive: false
    }));
  };

  const selectFocusTask = (id: string) => {
    setState(prev => ({ ...prev, activeFocusTaskId: id }));
  };

  const awardPoints = (points: number) => {
    setState(prev => ({
      ...prev,
      rewardPoints: prev.rewardPoints + points,
      totalXP: prev.totalXP + points
    }));
  };

  const handleTimerEnd = () => {
    audio.playSuccess();
    const type = state.timerMode === 'focus' ? 'focus' : 'rest';
    const mins = TIMER_MODES[state.timerMode].time;
    const nextMode: TimerMode = state.timerMode === 'focus' ? 'shortBreak' : 'focus';
    
    if (type === 'focus') awardPoints(100);

    setState(prev => {
      const newSession: FocusSession = {
        id: `s-${Date.now()}`,
        taskId: prev.activeFocusTaskId,
        startTime: new Date().toISOString(),
        durationMinutes: mins,
        type: prev.timerMode === 'focus' ? 'focus' : 'shortBreak'
      };

      let updatedTasks = [...prev.tasks];
      if (prev.activeFocusTaskId && type === 'focus') {
        updatedTasks = updatedTasks.map(t => 
          t.id === prev.activeFocusTaskId 
            ? { 
                ...t, 
                actualMinutesSpent: (t.actualMinutesSpent || 0) + mins,
                isCompleted: (t.actualMinutesSpent || 0) + mins >= (t.estimatedMinutes || 25),
                streakCount: t.streakCount + 1 
              } 
            : t
        );
      }

      return {
        ...prev,
        tasks: updatedTasks,
        sessionHistory: [newSession, ...prev.sessionHistory],
        isTimerActive: false,
        timerMode: nextMode,
        timerTimeLeft: TIMER_MODES[nextMode].time * 60,
        focusMinutesToday: type === 'focus' ? prev.focusMinutesToday + mins : prev.focusMinutesToday,
        restMinutesToday: type === 'rest' ? prev.restMinutesToday + mins : prev.restMinutesToday,
        totalSessionsCompleted: type === 'focus' ? prev.totalSessionsCompleted + 1 : prev.totalSessionsCompleted,
        activeFocusTaskId: undefined
      };
    });
  };

  const handleToggleTask = (id: string) => {
    setState(prev => {
      const taskIndex = prev.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      const targetTask = prev.tasks[taskIndex];
      const isBecomingCompleted = !targetTask.isCompleted;
      
      if (isBecomingCompleted) {
        audio.playSuccess();
        return {
          ...prev,
          rewardPoints: prev.rewardPoints + 50,
          totalXP: prev.totalXP + 50,
          tasks: prev.tasks.map((t, idx) => idx === taskIndex ? {
            ...t,
            isCompleted: true,
            isSkipped: false,
            streakCount: t.streakCount + 1
          } : t)
        };
      } else {
        audio.playPop();
        return {
          ...prev,
          tasks: prev.tasks.map((t, idx) => idx === taskIndex ? {
            ...t,
            isCompleted: false,
            streakCount: Math.max(0, t.streakCount - 1)
          } : t)
        };
      }
    });
  };

  const updateGoalProgress = (id: string, val: number) => {
    setState(prev => {
      const goal = prev.goals.find(g => g.id === id);
      if (!goal) return prev;
      
      const isFinishing = val >= goal.targetValue && !goal.isCompleted;
      if (isFinishing) {
        audio.playSuccess();
        return {
          ...prev,
          rewardPoints: prev.rewardPoints + 1000,
          totalXP: prev.totalXP + 1000,
          goals: prev.goals.map(g => g.id === id ? { ...g, currentValue: val, isCompleted: true } : g)
        };
      }

      return {
        ...prev,
        goals: prev.goals.map(g => g.id === id ? { ...g, currentValue: val } : g)
      };
    });
  };

  const getRank = () => {
    const xp = state.totalXP;
    if (xp < 1000) return t.rank_novice;
    if (xp < 5000) return t.rank_operator;
    if (xp < 15000) return t.rank_strategist;
    if (xp < 40000) return t.rank_elite;
    return t.rank_sovereign;
  };

  const disciplineScore = useMemo(() => {
    const completed = state.tasks.filter(t => t.isCompleted).length;
    const total = state.tasks.length || 1;
    return Math.round((completed / total) * 100);
  }, [state.tasks]);

  const roadmapGoals = useMemo(() => {
    return state.goals.filter(g => g.horizon === 'SixMonth');
  }, [state.goals]);

  const chartData = useMemo(() => {
    const historical = [...state.summaries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6)
      .map(s => {
        const completedCount = s.tasksSnapshot.filter(t => t.isCompleted).length;
        const totalCount = s.tasksSnapshot.length || 1;
        return {
          name: s.date.split('-').slice(1).join('/'),
          score: Math.round((completedCount / totalCount) * 100)
        };
      });
    return [...historical, { name: state.language === 'en' ? 'Live' : 'مباشر', score: disciplineScore }];
  }, [state.summaries, disciplineScore, state.language]);

  useEffect(() => {
    getDailyMotivation().then(setMotivation);
  }, []);

  const handleGenerateReport = async () => {
    audio.playClick();
    setIsLoadingReport(true);
    try {
      const report = await getStrategicPerformanceReport(state);
      setStrategicReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    audio.playSuccess();
    const task: Task = {
      id: `t-${Date.now()}`,
      title: newTask.title,
      category: newTask.category,
      frequency: newTask.frequency,
      estimatedMinutes: newTask.estimatedMinutes,
      actualMinutesSpent: 0,
      isCompleted: false,
      streakCount: 0
    };
    setState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setIsAddingTask(false);
    setNewTask({ title: '', category: 'Business', frequency: 'Daily', estimatedMinutes: 25 });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || newGoal.targetValue <= 0) return;
    audio.playSuccess();

    const targetDateObj = new Date();
    targetDateObj.setDate(targetDateObj.getDate() + newGoal.durationDays);

    const goal: Goal = {
      id: `g-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      horizon: newGoal.horizon,
      category: newGoal.category,
      targetValue: newGoal.targetValue,
      unit: newGoal.unit,
      currentValue: 0,
      isCompleted: false,
      targetDate: targetDateObj.toISOString()
    };

    setState(prev => ({ ...prev, goals: [...prev.goals, goal] }));
    setIsAddingGoal(false);
    setNewGoal({
      title: '',
      description: '',
      horizon: 'Monthly',
      category: 'Business',
      targetValue: 0,
      unit: '',
      durationDays: 30
    });
  };

  const handleAddInspiration = (item: Omit<InspirationItem, 'id' | 'createdAt'>) => {
    const newItem: InspirationItem = {
      ...item,
      id: `i-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, inspiration: [newItem, ...prev.inspiration] }));
  };

  const handleDeleteInspiration = (id: string) => {
    setState(prev => ({ ...prev, inspiration: prev.inspiration.filter(i => i.id !== id) }));
  };

  const handleAddIntel = (item: Omit<PrivateIntel, 'id' | 'updatedAt'>) => {
    const newItem: PrivateIntel = {
      ...item,
      id: `intel-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, privateIntel: [newItem, ...prev.privateIntel] }));
  };

  const handleAddLog = (log: Omit<FinancialLog, 'id'>) => {
    const newLog: FinancialLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    setState(prev => ({ ...prev, financialLogs: [newLog, ...prev.financialLogs] }));
  };

  const renderDashboard = () => (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#2eaadc] shadow-[0_0_10px_#2eaadc] animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t.systemActive}</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-white italic">{t.commandCenter}</h2>
          <p className="text-sm text-white/40 font-medium italic max-w-xl">"{motivation}"</p>
        </div>
        <div className="flex gap-4">
           <div className="px-8 py-4 bg-[#141414] border border-white/5 rounded-3xl flex flex-col items-center justify-center min-w-[140px] shadow-xl">
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block mb-1">{t.disciplineScore}</span>
              <span className="text-2xl font-black text-[#2eaadc] leading-none">{disciplineScore}%</span>
           </div>
        </div>
      </header>

      {/* REWARD SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 relative p-10 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#2eaadc]/30 rounded-[48px] shadow-2xl overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-10">
              <Award className="w-40 h-40 text-[#2eaadc]" />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-[#2eaadc]/20 rounded-2xl">
                    <Star className="w-6 h-6 text-[#2eaadc]" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">{t.rewardEmporium}</h3>
                    <p className="text-[10px] text-[#2eaadc] font-black uppercase tracking-[0.3em]">{t.unlockedPotential}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-4">
                 <div className="space-y-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{t.growthCredits}</span>
                    <div className="text-3xl font-black text-[#2eaadc] tracking-tighter">{state.rewardPoints.toLocaleString()}</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{t.level}</span>
                    <div className="text-3xl font-black text-white tracking-tighter">{getRank()}</div>
                 </div>
                 <div className="hidden md:block space-y-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{t.nextLevel}</span>
                    <div className="h-2 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-[#2eaadc] to-[#1e7aa0]" style={{ width: `${(state.totalXP % 5000) / 50}%` }}></div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <section className="lg:col-span-4 p-8 bg-[#141414] border border-white/5 rounded-[40px] shadow-xl flex flex-col justify-between group">
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2"><DollarSign className="w-3 h-3" /> {t.revenueGoal}</h3>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-black tracking-tighter text-white leading-none italic">$1,000</span>
                <span className="block text-[10px] font-black uppercase text-white/20 tracking-widest">{t.targetIncome}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#10B981] to-[#2eaadc]" style={{ width: '12%' }}></div>
              </div>
           </div>
           <button 
            onClick={() => setActiveTab('goals')}
            className="w-full py-4 mt-8 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/80 transition-all"
           >
             {t.viewRoadmap}
           </button>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5">
             <div className="p-3 bg-blue-500/10 rounded-2xl"><Timer className="w-5 h-5 text-[#2eaadc]" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">{t.focusTime}</span><span className="text-lg font-black text-white">{state.focusMinutesToday}m</span></div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5">
             <div className="p-3 bg-emerald-500/10 rounded-2xl"><Coffee className="w-5 h-5 text-emerald-500" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">{t.restTime}</span><span className="text-lg font-black text-white">{state.restMinutesToday}m</span></div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5">
             <div className="p-3 bg-orange-500/10 rounded-2xl"><Zap className="w-5 h-5 text-orange-500" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">{t.sessions}</span><span className="text-lg font-black text-white">{state.totalSessionsCompleted}</span></div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5">
             <div className="p-3 bg-purple-500/10 rounded-2xl"><ShieldCheck className="w-5 h-5 text-purple-500" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">{t.rank}</span><span className="text-lg font-black text-white">{getRank()}</span></div>
          </div>
      </div>
    </div>
  );

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isTimerActive={state.isTimerActive} 
      timerTimeLeft={state.timerTimeLeft}
      language={state.language}
      setLanguage={setLanguage}
      points={state.rewardPoints}
    >
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'focus' && (
        <PomodoroTimer 
          timeLeft={state.timerTimeLeft}
          isActive={state.isTimerActive}
          mode={state.timerMode}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          changeMode={changeTimerMode}
          focusMinutesToday={state.focusMinutesToday} 
          restMinutesToday={state.restMinutesToday} 
          tasks={state.tasks.filter(t => !t.isCompleted)}
          activeTaskId={state.activeFocusTaskId}
          onSelectTask={selectFocusTask}
        />
      )}
      {activeTab === 'projects' && (
        <ProjectManager 
          projects={state.projects} 
          tasks={state.tasks}
          language={state.language}
          onAddProject={(p) => setState(prev => ({ ...prev, projects: [...prev.projects, { ...p, id: `p-${Date.now()}` }] }))}
          onUpdateProject={(id, updates) => setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p) }))}
          onDeleteProject={(id) => setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }))}
        />
      )}
      {activeTab === 'inspiration' && (
        <InspirationBoard 
          items={state.inspiration}
          language={state.language}
          onAddItem={handleAddInspiration}
          onDeleteItem={handleDeleteInspiration}
        />
      )}
      {activeTab === 'vault' && (
        <SecureVault 
          language={state.language}
          intel={state.privateIntel}
          logs={state.financialLogs}
          onAddIntel={handleAddIntel}
          onAddLog={handleAddLog}
          onDeleteIntel={(id) => setState(p => ({ ...p, privateIntel: p.privateIntel.filter(x => x.id !== id) }))}
          onDeleteLog={(id) => setState(p => ({ ...p, financialLogs: p.financialLogs.filter(x => x.id !== id) }))}
        />
      )}
      {activeTab === 'calendar' && (
        <CalendarView 
          events={state.calendarEvents} 
          goals={state.goals}
          onAddEvent={(ev) => setState(p => ({ ...p, calendarEvents: [...p.calendarEvents, { ...ev, id: `e-${Date.now()}` }] }))}
          onDeleteEvent={(id) => setState(p => ({ ...p, calendarEvents: p.calendarEvents.filter(e => e.id !== id) }))}
          onToggleEvent={(id) => setState(p => ({ ...p, calendarEvents: p.calendarEvents.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e) }))}
        />
      )}
      {activeTab === 'analytics' && (
        <AnalyticsView 
          state={state} 
          reportText={strategicReport} 
          onGenerateReport={handleGenerateReport} 
          isLoadingReport={isLoadingReport} 
        />
      )}
      {activeTab === 'goals' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">{t.strategicRoadmap}</h2>
            <button 
              onClick={() => setIsAddingGoal(true)}
              className="px-8 py-4 bg-[#2eaadc] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              + {t.addGoal}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {state.goals.map(g => (
              <GoalCard 
                key={g.id} 
                goal={g} 
                language={state.language}
                onUpdateProgress={updateGoalProgress}
                onDeleteGoal={(id) => setState(p => ({ ...p, goals: p.goals.filter(goal => goal.id !== id) }))}
              />
            ))}
          </div>
        </div>
      )}
      {activeTab === 'tasks' && (
        <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase">{t.protocols}</h2>
            <button onClick={() => setIsAddingTask(true)} className="px-6 py-3 bg-[#2eaadc] text-white rounded-xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">+ {t.addProtocol}</button>
          </div>
          <HabitTracker 
            tasks={state.tasks} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={(id) => setState(p => ({...p, tasks: p.tasks.filter(x => x.id !== id)}))} 
            onSkipTask={(id) => setState(p => ({...p, tasks: p.tasks.map(x => x.id === id ? {...x, isSkipped: !x.isSkipped} : x)}))} 
          />
        </div>
      )}

      {/* MODAL: ADD GOAL */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#141414] border border-white/10 w-full max-w-xl rounded-[48px] overflow-hidden my-auto shadow-2xl">
             <div className="p-10 flex justify-between items-center border-b border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">{t.strategicBriefing}</h3>
                <button onClick={() => setIsAddingGoal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-6 h-6 opacity-30" /></button>
             </div>
             <form onSubmit={handleAddGoal} className="p-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">{state.language === 'en' ? 'Title & Vision' : 'العنوان والرؤية'}</label>
                  <input required type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="E.G., EARN $5,000 ONLINE..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" />
                  <textarea value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} placeholder="BRIEF DESCRIPTION..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest h-24 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">{state.language === 'en' ? 'Category' : 'الفئة'}</label>
                    <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value as any})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-xs font-black text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest">
                      <option value="Business">Business</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Learning">Learning</option>
                      <option value="Spirituality">Spirituality</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">{t.timeframe}</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button type="button" onClick={() => setNewGoal({...newGoal, horizon: 'Weekly', durationDays: 7})} className={`p-3 rounded-xl text-[9px] font-black uppercase border transition-all ${newGoal.horizon === 'Weekly' ? 'bg-[#2eaadc] border-[#2eaadc]' : 'bg-white/5 border-white/5 opacity-40'}`}>{t.oneWeek}</button>
                       <button type="button" onClick={() => setNewGoal({...newGoal, horizon: 'Monthly', durationDays: 30})} className={`p-3 rounded-xl text-[9px] font-black uppercase border transition-all ${newGoal.horizon === 'Monthly' ? 'bg-[#2eaadc] border-[#2eaadc]' : 'bg-white/5 border-white/5 opacity-40'}`}>{t.oneMonth}</button>
                       <button type="button" onClick={() => setNewGoal({...newGoal, horizon: 'TwoMonth', durationDays: 60})} className={`p-3 rounded-xl text-[9px] font-black uppercase border transition-all ${newGoal.horizon === 'TwoMonth' ? 'bg-[#2eaadc] border-[#2eaadc]' : 'bg-white/5 border-white/5 opacity-40'}`}>{t.twoMonths}</button>
                       <button type="button" onClick={() => setNewGoal({...newGoal, horizon: 'SixMonth', durationDays: 180})} className={`p-3 rounded-xl text-[9px] font-black uppercase border transition-all ${newGoal.horizon === 'SixMonth' ? 'bg-[#2eaadc] border-[#2eaadc]' : 'bg-white/5 border-white/5 opacity-40'}`}>{t.sixMonths}</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">{state.language === 'en' ? 'Target Value' : 'القيمة المستهدفة'}</label>
                    <input required type="number" value={newGoal.targetValue || ''} onChange={e => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value)})} placeholder="E.G., 5000" className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">{state.language === 'en' ? 'Unit' : 'الوحدة'}</label>
                    <input required type="text" value={newGoal.unit} onChange={e => setNewGoal({...newGoal, unit: e.target.value})} placeholder="E.G., $, KG, HOURS" className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" />
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-[#2eaadc] text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">{t.addGoal}</button>
             </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
