import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import GoalCard from './components/GoalCard';
import HabitTracker from './components/HabitTracker';
import PomodoroTimer from './components/PomodoroTimer';
import { AppState, Goal, Task, DailySummary, CalendarEvent, TimerMode } from './types';
import { INITIAL_GOALS, INITIAL_TASKS } from './constants';
import { getDailyMotivation, getWeeklyReview } from './services/geminiService';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { audio } from './services/audioService';
import { 
  Plus, CheckCircle, X, ShieldCheck, 
  Zap, Smile, 
  ClipboardCheck, ArrowRight, History, Ban, LineChart as ChartIcon,
  Target, ChevronLeft, ChevronRight, Trash2,
  RotateCcw, ExternalLink, Activity, Timer, Coffee
} from 'lucide-react';

const TIMER_MODES: Record<TimerMode, { label: string; time: number; color: string }> = {
  focus: { label: 'Deep Work', time: 25, color: '#2eaadc' },
  shortBreak: { label: 'Short Rest', time: 5, color: '#10B981' },
  longBreak: { label: 'Long Rest', time: 15, color: '#8B5CF6' }
};

const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const formatMonth = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [motivation, setMotivation] = useState<string>('Loading inspiration...');
  const [review, setReview] = useState<string | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [isReviewingDay, setIsReviewingDay] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [dayReflection, setDayReflection] = useState('');
  const [viewingSummary, setViewingSummary] = useState<DailySummary | null>(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    category: 'Business' as Task['category'],
    frequency: 'Daily' as Task['frequency']
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('youssef_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        focusMinutesToday: parsed.focusMinutesToday || 0,
        restMinutesToday: parsed.restMinutesToday || 0,
        totalSessionsCompleted: parsed.totalSessionsCompleted || 0,
        timerTimeLeft: parsed.timerTimeLeft ?? (TIMER_MODES.focus.time * 60),
        isTimerActive: parsed.isTimerActive ?? false,
        timerMode: parsed.timerMode ?? 'focus'
      };
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
      timerMode: 'focus'
    };
  });

  // Save state on change
  useEffect(() => {
    localStorage.setItem('youssef_app_state', JSON.stringify(state));
  }, [state]);

  // Global Timer Logic
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
    
    // Auto-switch modes
    const nextMode: TimerMode = state.timerMode === 'focus' ? 'shortBreak' : 'focus';
    
    setState(prev => ({
      ...prev,
      isTimerActive: false,
      timerMode: nextMode,
      timerTimeLeft: TIMER_MODES[nextMode].time * 60,
      focusMinutesToday: type === 'focus' ? prev.focusMinutesToday + mins : prev.focusMinutesToday,
      restMinutesToday: type === 'rest' ? prev.restMinutesToday + mins : prev.restMinutesToday,
      totalSessionsCompleted: type === 'focus' ? prev.totalSessionsCompleted + 1 : prev.totalSessionsCompleted
    }));
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

  useEffect(() => {
    getDailyMotivation().then(setMotivation);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasReviewedToday = state.summaries.some(s => s.date === todayStr);

  const disciplineScore = useMemo(() => {
    const completed = state.tasks.filter(t => t.isCompleted).length;
    const total = state.tasks.length || 1;
    return Math.round((completed / total) * 100);
  }, [state.tasks]);

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

  const handleUpdateGoal = (id: string, newVal: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === id ? { ...g, currentValue: Math.max(0, newVal), isCompleted: newVal >= g.targetValue } : g
      )
    }));
  };

  const handleDeleteGoal = (id: string) => {
    audio.playDelete();
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  const handleToggleTask = (id: string) => {
    setState(prev => {
      const taskIndex = prev.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      const targetTask = prev.tasks[taskIndex];
      const isBecomingCompleted = !targetTask.isCompleted;
      const newTasks = [...prev.tasks];
      newTasks[taskIndex] = {
        ...targetTask,
        isCompleted: isBecomingCompleted,
        isSkipped: false,
        streakCount: isBecomingCompleted ? targetTask.streakCount + 1 : Math.max(0, targetTask.streakCount - 1)
      };
      let newGoals = [...prev.goals];
      if (targetTask.linkedGoalId) {
        newGoals = newGoals.map(g => {
          if (g.id === targetTask.linkedGoalId) {
            const updateAmount = isBecomingCompleted ? 1 : -1;
            const updatedVal = Math.max(0, g.currentValue + updateAmount);
            return { ...g, currentValue: updatedVal, isCompleted: updatedVal >= g.targetValue };
          }
          return g;
        });
      }
      return { ...prev, tasks: newTasks, goals: newGoals };
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

  const handleSkipTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, isSkipped: !t.isSkipped, isCompleted: false } : t)
    }));
  };

  const handleDeleteTask = (id: string) => {
    audio.playDelete();
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const finalizeDayReview = () => {
    audio.playSuccess();
    const newSummary: DailySummary = {
      date: todayStr,
      mood: state.dailyMoods[todayStr] || 'Neutral',
      reflection: dayReflection,
      incomeLogged: 0,
      tasksSnapshot: state.tasks.map(t => ({ title: t.title, isCompleted: t.isCompleted, isSkipped: !!t.isSkipped }))
    };
    setState(prev => ({ 
      ...prev, 
      summaries: [newSummary, ...prev.summaries],
      focusMinutesToday: 0,
      restMinutesToday: 0 
    }));
    setIsReviewingDay(false);
    setDayReflection('');
    setActiveTab('journal');
  };

  const handleWeeklyReview = async () => {
    audio.playPop();
    setIsLoadingReview(true);
    const feedback = await getWeeklyReview(state);
    setReview(feedback);
    setIsLoadingReview(false);
  };

  const renderDashboard = () => (
    <div className="space-y-12 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white">YOUSSEF PROTOCOL</h2>
          <p className="text-[14px] text-white/40 font-medium italic">"{motivation}"</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block mb-1">Discipline</span>
              <span className="text-xl font-black text-[#2eaadc] leading-none">{disciplineScore}%</span>
           </div>
           <div className="px-6 py-3 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block mb-1">Capital</span>
              <span className="text-xl font-black text-emerald-500 leading-none">${state.incomeTotal}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-xl flex items-center gap-5">
             <div className="p-3 bg-blue-500/10 rounded-2xl"><Timer className="w-5 h-5 text-[#2eaadc]" /></div>
             <div>
                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Focus Time</span>
                <span className="text-lg font-black text-white">{state.focusMinutesToday}m</span>
             </div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-xl flex items-center gap-5">
             <div className="p-3 bg-emerald-500/10 rounded-2xl"><Coffee className="w-5 h-5 text-emerald-500" /></div>
             <div>
                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Rest Time</span>
                <span className="text-lg font-black text-white">{state.restMinutesToday}m</span>
             </div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-xl flex items-center gap-5">
             <div className="p-3 bg-orange-500/10 rounded-2xl"><Zap className="w-5 h-5 text-orange-500" /></div>
             <div>
                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Sessions</span>
                <span className="text-lg font-black text-white">{state.totalSessionsCompleted}</span>
             </div>
          </div>
          <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-xl flex items-center gap-5">
             <div className="p-3 bg-purple-500/10 rounded-2xl"><ShieldCheck className="w-5 h-5 text-purple-500" /></div>
             <div>
                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Rank</span>
                <span className="text-lg font-black text-white">{state.totalSessionsCompleted > 4 ? 'Elite' : 'Grinder'}</span>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-[#141414] border border-white/5 rounded-[32px] space-y-6 shadow-2xl">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] flex items-center gap-3">
            <Smile className="w-4 h-4" /> Energy Protocol
          </h3>
          <div className="flex gap-3">
            {[{emoji: '🚀', l: 'LIT'}, {emoji: '⚖️', l: 'CALM'}, {emoji: '📉', l: 'SLOW'}, {emoji: '🛠️', l: 'GRIND'}].map(m => (
              <button key={m.l} onClick={() => { audio.playPop(); setState(p => ({...p, dailyMoods: {...p.dailyMoods, [todayStr]: m.emoji}})); }}
                className={`flex-1 p-5 rounded-2xl border transition-all duration-200 ${state.dailyMoods[todayStr] === m.emoji ? 'bg-[#2eaadc]/10 border-[#2eaadc]/30 scale-[1.05] shadow-[0_0_20px_rgba(46,170,220,0.1)]' : 'bg-white/[0.01] border-white/5 opacity-40 hover:opacity-100 hover:bg-white/[0.03]'}`}>
                <div className="text-2xl mb-2">{m.emoji}</div>
                <div className="text-[9px] font-black uppercase tracking-widest">{m.l}</div>
              </button>
            ))}
          </div>
          {!hasReviewedToday && (
             <button onClick={() => { audio.playPop(); setIsReviewingDay(true); }} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/5 active:scale-95">
               <History className="w-4 h-4" /> ARCHIVE DAY
             </button>
          )}
        </div>
        
        <div className="p-8 bg-[#141414] border border-white/5 rounded-[32px] space-y-4 h-[300px] shadow-2xl relative overflow-hidden">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] flex items-center gap-3 mb-4">
            <Activity className="w-4 h-4" /> Execution Velocity
          </h3>
          <div className="h-full pb-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorSc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2eaadc" stopOpacity={0.3}/><stop offset="95%" stopColor="#2eaadc" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="score" stroke="#2eaadc" strokeWidth={3} fillOpacity={1} fill="url(#colorSc)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <section>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Protocols</h3>
                 <button onClick={() => setActiveTab('tasks')} className="text-[10px] text-[#2eaadc] font-black uppercase tracking-widest hover:underline">View All</button>
              </div>
              <HabitTracker tasks={state.tasks.slice(0, 6)} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onSkipTask={handleSkipTask} />
           </section>
        </div>
        <div className="space-y-8">
           <section className="bg-[#141414] border border-white/5 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2eaadc]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Weekly Intel</h3>
              {review ? (
                <div className="text-[13px] text-white/60 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2">{review}</div>
              ) : (
                <button onClick={handleWeeklyReview} disabled={isLoadingReview} className="w-full py-4 bg-[#2eaadc]/10 text-[#2eaadc] border border-[#2eaadc]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2eaadc]/20 transition-all active:scale-[0.98]">
                  {isLoadingReview ? 'Analyzing System...' : 'Generate AI Review'}
                </button>
              )}
           </section>
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
        />
      )}
      {activeTab === 'calendar' && <CalendarSection state={state} setState={setState} />}
      {activeTab === 'goals' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
          <div className="flex justify-between items-end">
             <div className="space-y-2">
               <h2 className="text-4xl font-black tracking-tighter uppercase">STRATEGIC ROADMAP</h2>
               <p className="text-[11px] text-white/20 font-black tracking-[0.5em] uppercase">Phase: Execution & Growth</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {state.goals.map(g => (
              <GoalCard 
                key={g.id} 
                goal={g} 
                onUpdateProgress={handleUpdateGoal} 
                onDeleteGoal={() => handleDeleteGoal(g.id)}
              />
            ))}
          </div>
        </div>
      )}
      {activeTab === 'tasks' && (
        <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase">Protocols</h2>
            <button onClick={() => { audio.playPop(); setIsAddingTask(true); }} className="px-6 py-3 bg-[#2eaadc] text-white rounded-xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">+ Protocol</button>
          </div>
          <div className="bg-[#141414] border border-white/5 rounded-[48px] p-8 md:p-12 shadow-3xl">
            <HabitTracker tasks={state.tasks} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onSkipTask={handleSkipTask} />
          </div>
        </div>
      )}
      {activeTab === 'journal' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
           <h2 className="text-4xl font-black tracking-tighter uppercase">Archive</h2>
           <div className="grid gap-4">
              {state.summaries.map(s => (
                <div key={s.date} onClick={() => setViewingSummary(s)} className="p-6 bg-[#141414] border border-white/5 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-[#2eaadc]/20 transition-all active:scale-[0.99]">
                  <div className="flex items-center gap-6">
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{s.mood}</span>
                    <div><span className="text-[10px] text-[#2eaadc] font-black uppercase mb-1 block">{s.date}</span><h3 className="text-lg font-black text-white/80">Execution Record</h3></div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-[#2eaadc] transition-all group-hover:translate-x-1" />
                </div>
              ))}
              {state.summaries.length === 0 && (
                <div className="text-center py-20 opacity-10 uppercase font-black tracking-widest text-[13px]">No records archived yet.</div>
              )}
           </div>
        </div>
      )}

      {/* Universal FAB Button */}
      <button 
        onClick={() => { audio.playPop(); setIsAddingTask(true); }}
        className="fixed bottom-10 right-10 w-16 h-16 bg-[#2eaadc] text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(46,170,220,0.4)] hover:scale-110 active:scale-90 transition-all z-50 border-4 border-white/10"
      >
        <Plus className="w-8 h-8 font-black" />
      </button>

      {/* Modals */}
      {isAddingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 w-full max-w-lg rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
             <div className="p-10 flex justify-between items-center border-b border-white/5">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black uppercase tracking-tighter">New Protocol</h3>
                   <p className="text-[10px] text-white/20 font-black tracking-[0.3em] uppercase">Define your discipline</p>
                </div>
                <button onClick={() => setIsAddingTask(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6 opacity-30" /></button>
             </div>
             <form onSubmit={handleAddTask} className="p-10 space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-[#2eaadc] tracking-[0.4em] ml-2">Objective</label>
                  <input autoFocus required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="E.G. READ 20 PAGES..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest placeholder:text-white/5" />
                </div>
                <div class="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em] ml-2">Classification</label>
                    <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value as any})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white/60 uppercase">
                      <option value="Business">Business</option><option value="Fitness">Fitness</option><option value="Spirituality">Spirituality</option><option value="Learning">Learning</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em] ml-2">Cycle</label>
                    <select value={newTask.frequency} onChange={e => setNewTask({...newTask, frequency: e.target.value as any})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white/60 uppercase">
                      <option value="Daily">Daily</option><option value="Weekly">Weekly</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-[#2eaadc] text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-blue-500/20">INITIATE ENTRY</button>
             </form>
          </div>
        </div>
      )}

      {isReviewingDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 w-full max-w-lg rounded-[48px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Daily Recap</h3>
            <textarea autoFocus value={dayReflection} onChange={e => setDayReflection(e.target.value)} placeholder="Key takeaways from today..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 text-sm font-medium text-white/80 h-48 focus:outline-none focus:border-[#2eaadc]/30 uppercase tracking-widest placeholder:text-white/5 resize-none shadow-inner" />
            <div className="flex justify-between items-center px-4 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Day Efficiency</span>
              <span className="text-3xl font-black text-[#2eaadc]">{disciplineScore}%</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsReviewingDay(false)} className="px-6 py-5 bg-white/5 text-white/40 rounded-3xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={finalizeDayReview} className="flex-1 py-5 bg-[#2eaadc] text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/10 active:scale-[0.98]">Confirm Archive</button>
            </div>
          </div>
        </div>
      )}

      {viewingSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 w-full max-w-xl rounded-[48px] p-10 space-y-8 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <div><span className="text-[10px] font-black text-[#2eaadc] uppercase block tracking-widest mb-1">{viewingSummary.date}</span><h3 className="text-2xl font-black uppercase text-white">Execution Snapshot</h3></div>
              <button onClick={() => setViewingSummary(null)} className="p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all"><X className="w-5 h-5 opacity-40" /></button>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center gap-8 shadow-inner"><span className="text-6xl">{viewingSummary.mood}</span><div><p className="text-white font-black text-xl uppercase tracking-tighter">Peak Performance Mode</p></div></div>
            <div className="space-y-4"><h4 className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-4">Observations</h4><div className="p-8 bg-[#1A1A1A] rounded-[32px] border border-white/5 italic text-white/60 font-medium uppercase tracking-widest leading-relaxed shadow-inner">"{viewingSummary.reflection || 'NO REFLECTION ENTERED.'}"</div></div>
            <button onClick={() => setViewingSummary(null)} className="w-full py-6 bg-white/5 text-white/60 rounded-[32px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

const CalendarSection: React.FC<{ state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }> = ({ state, setState }) => {
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const [isAdd, setIsAdd] = useState(false);
  const [evName, setEvName] = useState('');

  const total = daysInMonth(date);
  const start = startDayOfMonth(date);
  const days = [];
  for (let i = 0; i < start; i++) days.push(<div key={`e-${i}`} className="h-32 border-r border-b border-white/5 bg-white/[0.01]" />);
  for (let day = 1; day <= total; day++) {
    const dStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const evs = state.calendarEvents.filter(e => e.date === dStr);
    days.push(
      <div key={day} onClick={() => { audio.playClick(); setSelected(dStr); }} className={`h-32 border-r border-b border-white/5 p-3 cursor-pointer transition-all hover:bg-white/[0.03] ${selected === dStr ? 'bg-[#2eaadc]/5' : ''}`}>
        <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-lg ${dStr === new Date().toISOString().split('T')[0] ? 'bg-[#2eaadc] text-white shadow-lg shadow-blue-500/20' : 'text-white/20'}`}>{day}</span>
        <div className="mt-3 space-y-1">{evs.slice(0, 2).map(e => <div key={e.id} className="text-[8px] font-black bg-[#2eaadc]/10 text-[#2eaadc] p-1.5 rounded-lg uppercase truncate border border-[#2eaadc]/10">{e.title}</div>)}</div>
      </div>
    );
  }

  const addEv = (e: React.FormEvent) => {
    e.preventDefault(); if (!evName) return;
    audio.playSuccess();
    setState(p => ({...p, calendarEvents: [...p.calendarEvents, {id: `e-${Date.now()}`, title: evName, date: selected, category: 'Business', isCompleted: false}]}));
    setEvName(''); setIsAdd(false);
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{formatMonth(date)}</h2>
        <div className="flex gap-3"><button onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><ChevronLeft className="w-5 h-5 opacity-40" /></button><button onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><ChevronRight className="w-5 h-5 opacity-40" /></button></div>
      </div>
      <div className="flex flex-col xl:flex-row gap-12">
        <div className="flex-1 grid grid-cols-7 border-t border-l border-white/5 rounded-[40px] overflow-hidden shadow-2xl bg-[#141414]">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="py-4 text-center text-[10px] font-black text-white/10 border-r border-b border-white/5 uppercase tracking-[0.4em] bg-white/[0.01]">{d}</div>)}
          {days}
        </div>
        <div className="xl:w-80 space-y-8">
           <div className="p-8 bg-[#141414] border border-white/5 rounded-[32px] shadow-2xl sticky top-10">
              <h3 className="text-[11px] font-black uppercase text-[#2eaadc] tracking-[0.4em] mb-8 border-b border-white/5 pb-4">{selected}</h3>
              <div className="space-y-4 mb-10">
                 {state.calendarEvents.filter(e => e.date === selected).map(e => (
                   <div key={e.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group animate-in slide-in-from-right-4">
                     <span className="text-[13px] font-bold text-white/80 uppercase tracking-tight">{e.title}</span>
                     <button onClick={() => { audio.playDelete(); setState(p => ({...p, calendarEvents: p.calendarEvents.filter(x => x.id !== e.id)})); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-500/40 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 ))}
                 {state.calendarEvents.filter(e => e.date === selected).length === 0 && (
                    <div className="text-center py-10 opacity-10 font-black text-[10px] tracking-widest uppercase">No Scheduled Events</div>
                 )}
              </div>
              {isAdd ? (
                <form onSubmit={addEv} className="space-y-4 animate-in zoom-in-95"><input autoFocus value={evName} onChange={e => setEvName(e.target.value)} placeholder="PROTOCOL TITLE..." className="w-full bg-black border border-white/5 p-4 rounded-2xl text-[11px] font-black uppercase focus:outline-none focus:border-[#2eaadc]/50 shadow-inner" /><button className="w-full py-4 bg-[#2eaadc] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Add Protocol</button></form>
              ) : (
                <button onClick={() => setIsAdd(true)} className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-[10px] font-black uppercase text-white/20 hover:text-[#2eaadc] hover:border-[#2eaadc]/40 transition-all">+ Add Intel Entry</button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;