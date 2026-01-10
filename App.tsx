import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import GoalCard from './components/GoalCard';
import HabitTracker from './components/HabitTracker';
import PomodoroTimer from './components/PomodoroTimer';
import CalendarView from './components/CalendarView';
import { AppState, Goal, Task, DailySummary, TimerMode, CalendarEvent, TimeHorizon } from './types';
import { INITIAL_GOALS, INITIAL_TASKS } from './constants';
import { getDailyMotivation, getWeeklyReview } from './services/geminiService';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { audio } from './services/audioService';
import { 
  Plus, X, ShieldCheck, 
  Zap, Smile, 
  ArrowRight, History,
  Activity, Timer, Coffee, CheckCircle,
  TrendingUp, Target, DollarSign, ListTodo
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
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    category: 'Business' as Task['category'],
    frequency: 'Daily' as Task['frequency']
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    horizon: 'Monthly' as TimeHorizon,
    category: 'Business' as Goal['category'],
    targetValue: 0,
    unit: ''
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('youssef_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed };
    }
    return {
      goals: INITIAL_GOALS,
      tasks: INITIAL_TASKS,
      calendarEvents: [],
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
      activeFocusTaskId: undefined
    };
  });

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

  const handleTimerEnd = () => {
    audio.playSuccess();
    const type = state.timerMode === 'focus' ? 'focus' : 'rest';
    const mins = TIMER_MODES[state.timerMode].time;
    const nextMode: TimerMode = state.timerMode === 'focus' ? 'shortBreak' : 'focus';
    
    setState(prev => {
      let updatedTasks = [...prev.tasks];
      if (prev.activeFocusTaskId && type === 'focus') {
        updatedTasks = updatedTasks.map(t => 
          t.id === prev.activeFocusTaskId ? { ...t, isCompleted: true, streakCount: t.streakCount + 1 } : t
        );
      }
      return {
        ...prev,
        tasks: updatedTasks,
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

  const toggleTimer = () => {
    audio.playPop();
    setState(prev => ({ ...prev, isTimerActive: !prev.isTimerActive }));
  };

  const resetTimer = () => {
    audio.playClick();
    setState(prev => ({ ...prev, isTimerActive: false, timerTimeLeft: TIMER_MODES[prev.timerMode].time * 60 }));
  };

  const changeTimerMode = (newMode: TimerMode) => {
    audio.playClick();
    setState(prev => ({ 
      ...prev, 
      timerMode: newMode, 
      isTimerActive: false, 
      timerTimeLeft: TIMER_MODES[newMode].time * 60 
    }));
  };

  const selectFocusTask = (id: string) => {
    audio.playClick();
    setState(prev => ({ ...prev, activeFocusTaskId: prev.activeFocusTaskId === id ? undefined : id }));
  };

  const featuredTask = useMemo(() => {
    return state.tasks.find(t => !t.isCompleted && !t.isSkipped);
  }, [state.tasks]);

  const upcomingTasks = useMemo(() => {
    return state.tasks.filter(t => !t.isCompleted && !t.isSkipped && t.id !== featuredTask?.id).slice(0, 3);
  }, [state.tasks, featuredTask]);

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
    return [...historical, { name: 'Live', score: disciplineScore }];
  }, [state.summaries, disciplineScore]);

  useEffect(() => {
    getDailyMotivation().then(setMotivation);
  }, []);

  const handleToggleTask = (id: string) => {
    setState(prev => {
      const taskIndex = prev.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      const targetTask = prev.tasks[taskIndex];
      const isBecomingCompleted = !targetTask.isCompleted;
      if (isBecomingCompleted) audio.playSuccess();
      else audio.playPop();
      const newTasks = [...prev.tasks];
      newTasks[taskIndex] = {
        ...targetTask,
        isCompleted: isBecomingCompleted,
        isSkipped: false,
        streakCount: isBecomingCompleted ? targetTask.streakCount + 1 : Math.max(0, targetTask.streakCount - 1)
      };
      return { ...prev, tasks: newTasks };
    });
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
      isCompleted: false,
      streakCount: 0
    };
    setState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setIsAddingTask(false);
    setNewTask({ title: '', category: 'Business', frequency: 'Daily' });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || newGoal.targetValue <= 0) return;
    audio.playSuccess();
    const goal: Goal = {
      ...newGoal,
      id: `g-${Date.now()}`,
      currentValue: 0,
      isCompleted: false
    };
    setState(prev => ({ ...prev, goals: [...prev.goals, goal] }));
    setIsAddingGoal(false);
    setNewGoal({
      title: '',
      description: '',
      horizon: 'Monthly',
      category: 'Business',
      targetValue: 0,
      unit: ''
    });
  };

  const handleDeleteGoal = (id: string) => {
    audio.playDelete();
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `e-${Date.now()}`
    };
    setState(prev => ({ ...prev, calendarEvents: [...prev.calendarEvents, newEvent] }));
  };

  const handleDeleteEvent = (id: string) => {
    setState(prev => ({ ...prev, calendarEvents: prev.calendarEvents.filter(e => e.id !== id) }));
  };

  const handleToggleEvent = (id: string) => {
    setState(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map(e => 
        e.id === id ? { ...e, isCompleted: !e.isCompleted } : e
      )
    }));
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#2eaadc] shadow-[0_0_10px_#2eaadc] animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Active</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-white italic">COMMAND CENTER</h2>
          <p className="text-sm text-white/40 font-medium italic max-w-xl">"{motivation}"</p>
        </div>
        <div className="flex gap-4">
           <div className="px-8 py-4 bg-[#141414] border border-white/5 rounded-3xl flex flex-col items-center justify-center min-w-[140px] shadow-xl">
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block mb-1">Discipline Score</span>
              <span className="text-2xl font-black text-[#2eaadc] leading-none">{disciplineScore}%</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 relative p-10 bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#2eaadc]/20 rounded-[48px] shadow-2xl overflow-hidden mission-glow group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2eaadc]/5 blur-[100px] -mr-20 -mt-20 group-hover:bg-[#2eaadc]/10 transition-all duration-700"></div>
          <div className="relative z-10 h-full flex flex-col justify-between gap-12">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#2eaadc]/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-[#2eaadc] border border-[#2eaadc]/20">
                <Zap className="w-3 h-3" /> Priority Protocol
              </span>
              {featuredTask ? (
                <>
                  <h3 className="text-4xl font-black tracking-tight text-white uppercase italic leading-[0.9]">{featuredTask.title}</h3>
                  <p className="text-white/30 text-sm font-medium max-w-md">Immediate action required to sustain your current execution velocity and build discipline.</p>
                </>
              ) : (
                <>
                  <h3 className="text-4xl font-black tracking-tight text-white uppercase italic">System Saturated</h3>
                  <p className="text-white/30 text-sm font-medium">All protocols for this cycle have been executed. Review roadmap or initiate deep work.</p>
                </>
              )}
            </div>
            {featuredTask && (
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => { setActiveTab('focus'); selectFocusTask(featuredTask.id); }}
                  className="px-8 py-5 bg-white/5 text-white/80 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-xl"
                >
                  Initiate Focus
                </button>
                <button 
                  onClick={() => handleToggleTask(featuredTask.id)}
                  className="px-12 py-5 bg-[#2eaadc] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Mark Executed
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-4 p-8 bg-[#141414] border border-white/5 rounded-[40px] shadow-xl flex flex-col justify-between group">
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2"><DollarSign className="w-3 h-3" /> Revenue Goal</h3>
                <TrendingUp className="w-4 h-4 text-[#10B981] opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-black tracking-tighter text-white leading-none italic">$1,000</span>
                <span className="block text-[10px] font-black uppercase text-white/20 tracking-widest">Target Online Income</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#10B981] to-[#2eaadc] shadow-[0_0_15px_#10B98155]" style={{ width: '12%' }}></div>
              </div>
           </div>
           <button 
            onClick={() => setActiveTab('goals')}
            className="w-full py-4 mt-8 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
           >
             View Business Roadmap
           </button>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5 hover:bg-[#181818] transition-colors group">
             <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Timer className="w-5 h-5 text-[#2eaadc]" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Focus Time</span><span className="text-lg font-black text-white">{state.focusMinutesToday}m</span></div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5 hover:bg-[#181818] transition-colors group">
             <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Coffee className="w-5 h-5 text-emerald-500" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Rest Time</span><span className="text-lg font-black text-white">{state.restMinutesToday}m</span></div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5 hover:bg-[#181818] transition-colors group">
             <div className="p-3 bg-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Zap className="w-5 h-5 text-orange-500" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Sessions</span><span className="text-lg font-black text-white">{state.totalSessionsCompleted}</span></div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-lg flex items-center gap-5 hover:bg-[#181818] transition-colors group">
             <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:scale-110 transition-transform"><ShieldCheck className="w-5 h-5 text-purple-500" /></div>
             <div><span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Elite Rank</span><span className="text-lg font-black text-white">{state.totalSessionsCompleted > 4 ? 'Alpha' : 'Novice'}</span></div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-8 bg-[#141414] border border-white/5 rounded-[40px] space-y-4 h-[380px] shadow-2xl relative overflow-hidden group">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] flex items-center gap-3 mb-4"><Activity className="w-4 h-4" /> Execution Velocity</h3>
          <div className="h-full pb-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorSc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2eaadc" stopOpacity={0.3}/><stop offset="95%" stopColor="#2eaadc" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} dy={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="score" stroke="#2eaadc" strokeWidth={4} fillOpacity={1} fill="url(#colorSc)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 p-8 bg-[#141414] border border-white/5 rounded-[40px] space-y-8 shadow-2xl">
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2"><Target className="w-4 h-4" /> 6-Month Roadmap</h3>
           <div className="space-y-6">
             {roadmapGoals.slice(0, 3).map(goal => {
               const perc = Math.round((goal.currentValue / goal.targetValue) * 100);
               return (
                 <div key={goal.id} className="space-y-3 group cursor-pointer" onClick={() => setActiveTab('goals')}>
                   <div className="flex justify-between items-end">
                      <span className="text-[13px] font-bold text-white/90 group-hover:text-[#2eaadc] transition-colors truncate pr-4">{goal.title}</span>
                      <span className="text-[10px] font-black text-white/20">{perc}%</span>
                   </div>
                   <div className="h-1 w-full bg-white/[0.02] rounded-full overflow-hidden">
                      <div className="h-full bg-white/10 group-hover:bg-[#2eaadc]/50 transition-all duration-500" style={{ width: `${perc}%` }}></div>
                   </div>
                 </div>
               );
             })}
           </div>
           <div className="pt-4 border-t border-white/5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2 mb-4"><ListTodo className="w-4 h-4" /> Up Next</h3>
              <div className="space-y-3">
                 {upcomingTasks.map(t => (
                   <div key={t.id} className="flex items-center gap-3 py-1">
                      <div className="w-1 h-1 rounded-full bg-white/10"></div>
                      <span className="text-[11px] font-medium text-white/40 truncate italic">{t.title}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="p-8 bg-[#141414] border border-white/5 rounded-[48px] space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] flex items-center gap-3"><Smile className="w-4 h-4" /> Energy & State Management</h3>
          <span className="text-[9px] font-black uppercase text-white/10 tracking-widest italic">Biometric Override Required</span>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-4">
          {[{emoji: '🚀', l: 'MAX OUTPUT', desc: 'Flow State Active'}, 
            {emoji: '⚖️', l: 'STABLE', desc: 'Sustainable Pace'}, 
            {emoji: '📉', l: 'RECOVERY', desc: 'System Rebooting'}, 
            {emoji: '🛠️', l: 'DEEP GRIND', desc: 'Tunnel Vision'}].map(m => (
            <button key={m.l} 
              onClick={() => {
                audio.playClick();
                setState(p => ({...p, dailyMoods: {...p.dailyMoods, [new Date().toISOString().split('T')[0]]: m.emoji}}));
              }}
              className={`flex-1 p-6 rounded-3xl border transition-all text-left group ${state.dailyMoods[new Date().toISOString().split('T')[0]] === m.emoji ? 'bg-[#2eaadc]/10 border-[#2eaadc]/30 scale-105 shadow-xl' : 'bg-white/[0.01] border-white/5 opacity-40 hover:opacity-100 hover:bg-white/[0.03]'}`}>
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{m.emoji}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white block mb-1">{m.l}</div>
              <div className="text-[9px] font-medium text-white/20 uppercase tracking-tighter">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} isTimerActive={state.isTimerActive} timerTimeLeft={state.timerTimeLeft}>
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
      {activeTab === 'calendar' && (
        <CalendarView 
          events={state.calendarEvents} 
          goals={state.goals}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onToggleEvent={handleToggleEvent}
        />
      )}
      {activeTab === 'goals' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Strategic Roadmap</h2>
            <button 
              onClick={() => setIsAddingGoal(true)}
              className="px-8 py-4 bg-[#2eaadc] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              + Add Goal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {state.goals.map(g => (
              <GoalCard 
                key={g.id} 
                goal={g} 
                onUpdateProgress={(id, val) => setState(p => ({...p, goals: p.goals.map(x => x.id === id ? {...x, currentValue: val} : x)}))}
                onDeleteGoal={handleDeleteGoal}
              />
            ))}
            {state.goals.length === 0 && (
              <div className="col-span-full py-20 text-center bg-[#141414] border border-dashed border-white/5 rounded-[40px] opacity-20">
                <Target className="w-16 h-16 mx-auto mb-4 stroke-1" />
                <p className="font-black uppercase tracking-widest">No Active Objectives</p>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'tasks' && (
        <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase">Protocols</h2>
            <button onClick={() => setIsAddingTask(true)} className="px-6 py-3 bg-[#2eaadc] text-white rounded-xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">+ Protocol</button>
          </div>
          <HabitTracker tasks={state.tasks} onToggleTask={handleToggleTask} onDeleteTask={(id) => setState(p => ({...p, tasks: p.tasks.filter(x => x.id !== id)}))} onSkipTask={(id) => setState(p => ({...p, tasks: p.tasks.map(x => x.id === id ? {...x, isSkipped: !x.isSkipped} : x)}))} />
        </div>
      )}
      
      {/* MODAL: ADD TASK */}
      {isAddingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 w-full max-w-lg rounded-[48px] overflow-hidden">
             <div className="p-10 flex justify-between items-center border-b border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-tighter">New Protocol</h3>
                <button onClick={() => setIsAddingTask(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-6 h-6 opacity-30" /></button>
             </div>
             <form onSubmit={handleAddTask} className="p-10 space-y-10">
                <input autoFocus required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="PROTOCOL TITLE..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" />
                <button type="submit" className="w-full py-6 bg-[#2eaadc] text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20">INITIATE ENTRY</button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GOAL */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#141414] border border-white/10 w-full max-w-xl rounded-[48px] overflow-hidden my-auto shadow-2xl">
             <div className="p-10 flex justify-between items-center border-b border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Strategic Objective</h3>
                <button onClick={() => setIsAddingGoal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-6 h-6 opacity-30" /></button>
             </div>
             <form onSubmit={handleAddGoal} className="p-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Title & Vision</label>
                  <input required type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="E.G., EARN $5,000 ONLINE..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" />
                  <textarea value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} placeholder="BRIEF DESCRIPTION..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest h-24 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Category</label>
                    <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value as any})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-xs font-black text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest">
                      <option value="Business">Business</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Learning">Learning</option>
                      <option value="Spirituality">Spirituality</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Horizon</label>
                    <select value={newGoal.horizon} onChange={e => setNewGoal({...newGoal, horizon: e.target.value as any})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-xs font-black text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest">
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="SixMonth">6-Month</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Target Value</label>
                    <input required type="number" value={newGoal.targetValue || ''} onChange={e => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value)})} placeholder="E.G., 5000" className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Unit</label>
                    <input required type="text" value={newGoal.unit} onChange={e => setNewGoal({...newGoal, unit: e.target.value})} placeholder="E.G., $, KG, HOURS" className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" />
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-[#2eaadc] text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">COMMIT TO ROADMAP</button>
             </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;