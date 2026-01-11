
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import GoalCard from './components/GoalCard';
import HabitTracker from './components/HabitTracker';
import PomodoroTimer from './components/PomodoroTimer';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import ProjectManager from './components/ProjectManager';
import InspirationBoard from './components/InspirationBoard';
import SecureVault from './components/SecureVault';
import DailyProgressView from './components/DailyProgressView';
import { AppState, Goal, Task, DailySummary, TimerMode, CalendarEvent } from './types';
import { INITIAL_GOALS, INITIAL_TASKS, INITIAL_EVENTS } from './constants';
import { analyzeDailyPerformance, getStrategicPerformanceReport } from './services/geminiService';
import { 
  Plus, X, Zap, Award, Wallet, TrendingUp, BarChart
} from 'lucide-react';
import { translations } from './translations';

const TIMER_MODES: Record<TimerMode, { label: string; time: number; color: string }> = {
  focus: { label: 'Deep Work', time: 25, color: '#6366f1' },
  shortBreak: { label: 'Recovery', time: 5, color: '#10b981' },
  longBreak: { label: 'Deep Rest', time: 15, color: '#8b5cf6' }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [motivation, setMotivation] = useState<string>('Steady progress is the ultimate leverage.');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [analyticsReport, setAnalyticsReport] = useState<string | null>(null);
  const [isGeneratingAnalytics, setIsGeneratingAnalytics] = useState(false);
  
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'isCompleted'>>({
    title: '',
    description: '',
    horizon: 'Monthly',
    category: 'Business',
    targetValue: 0,
    currentValue: 0,
    unit: 'Units'
  });

  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'isCompleted' | 'streakCount'>>({
    title: '',
    category: 'Business',
    frequency: 'Daily',
    estimatedMinutes: 30,
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('youssef_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...parsed,
        sessionHistory: parsed.sessionHistory || [],
        projects: parsed.projects || [],
        inspiration: parsed.inspiration || [],
        privateIntel: parsed.privateIntel || [],
        financialLogs: parsed.financialLogs || [],
        summaries: parsed.summaries || [],
        calendarEvents: parsed.calendarEvents || INITIAL_EVENTS,
        sleepHoursToday: parsed.sleepHoursToday ?? 8,
        phoneHoursToday: parsed.phoneHoursToday ?? 2
      };
    }
    return {
      goals: INITIAL_GOALS,
      tasks: INITIAL_TASKS,
      projects: [],
      inspiration: [],
      privateIntel: [],
      financialLogs: [],
      calendarEvents: INITIAL_EVENTS,
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
      language: 'en',
      rewardPoints: 0,
      totalXP: 0,
      sleepHoursToday: 8,
      phoneHoursToday: 2
    };
  });

  const t = translations[state.language];

  useEffect(() => {
    localStorage.setItem('youssef_app_state', JSON.stringify(state));
  }, [state]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const goal: Goal = { ...newGoal, id: `g-${Date.now()}`, isCompleted: false };
    setState(prev => ({ ...prev, goals: [goal, ...prev.goals] }));
    setIsAddingGoal(false);
    setNewGoal({ title: '', description: '', horizon: 'Monthly', category: 'Business', targetValue: 0, currentValue: 0, unit: 'Units' });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = { ...newTask, id: `t-${Date.now()}`, isCompleted: false, streakCount: 0 };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
    setIsAddingTask(false);
    setNewTask({ title: '', category: 'Business', frequency: 'Daily', estimatedMinutes: 30 });
  };

  const handleMoveTask = (id: string, direction: 'up' | 'down') => {
    setState(prev => {
      const index = prev.tasks.findIndex(t => t.id === id);
      if (index === -1) return prev;
      const newTasks = [...prev.tasks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newTasks.length) return prev;
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
      return { ...prev, tasks: newTasks };
    });
  };

  const handleTerminateDay = async () => {
    if (state.tasks.length === 0) return;
    
    setIsTerminating(true);
    try {
      const analysis = await analyzeDailyPerformance(state.tasks, state.focusMinutesToday, state.sleepHoursToday, state.phoneHoursToday);
      
      const summary: DailySummary = {
        id: `summary-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        score: analysis.score || 0,
        verdict: (analysis.verdict || 'Neutral') as any,
        aiReflection: analysis.reflection || "Audit synchronization complete.",
        tasksSnapshot: state.tasks.map(t => ({ title: t.title, isCompleted: t.isCompleted })),
        focusMinutes: state.focusMinutesToday,
        sleepHours: state.sleepHoursToday,
        phoneHours: state.phoneHoursToday
      };

      setState(prev => ({
        ...prev,
        summaries: [...prev.summaries, summary],
        focusMinutesToday: 0,
        restMinutesToday: 0,
        sleepHoursToday: 8, // Reset for next day
        phoneHoursToday: 2, // Reset for next day
        tasks: prev.tasks.map(t => ({ 
          ...t, 
          isCompleted: false, 
          streakCount: t.isCompleted ? t.streakCount + 1 : 0 
        })),
        rewardPoints: prev.rewardPoints + (analysis.score ? analysis.score * 5 : 0)
      }));
      
      setActiveTab('progress');
    } catch (e) {
      console.error("Daily termination failed:", e);
    } finally {
      setIsTerminating(false);
    }
  };

  const handleGenerateAnalytics = async () => {
    setIsGeneratingAnalytics(true);
    try {
      const report = await getStrategicPerformanceReport(state);
      setAnalyticsReport(report);
    } catch (error) {
      setAnalyticsReport("System encountered a temporal bottleneck. Strategic report delayed.");
    } finally {
      setIsGeneratingAnalytics(false);
    }
  };

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.isTimerActive && state.timerTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, timerTimeLeft: prev.timerTimeLeft - 1 }));
      }, 1000);
    } else if (state.timerTimeLeft === 0 && state.isTimerActive) {
      const type = state.timerMode === 'focus' ? 'focus' : 'rest';
      const mins = TIMER_MODES[state.timerMode].time;
      const nextMode: TimerMode = state.timerMode === 'focus' ? 'shortBreak' : 'focus';
      
      setState(prev => ({
        ...prev,
        rewardPoints: prev.rewardPoints + (type === 'focus' ? 150 : 0),
        totalXP: prev.totalXP + (type === 'focus' ? 150 : 0),
        sessionHistory: [{
          id: `s-${Date.now()}`,
          taskId: prev.activeFocusTaskId,
          startTime: new Date().toISOString(),
          durationMinutes: mins,
          type: prev.timerMode === 'focus' ? 'focus' : 'shortBreak'
        }, ...prev.sessionHistory],
        isTimerActive: false,
        timerMode: nextMode,
        timerTimeLeft: TIMER_MODES[nextMode].time * 60,
        focusMinutesToday: type === 'focus' ? prev.focusMinutesToday + mins : prev.focusMinutesToday,
        restMinutesToday: type === 'rest' ? prev.restMinutesToday + mins : prev.restMinutesToday,
        totalSessionsCompleted: type === 'focus' ? prev.totalSessionsCompleted + 1 : prev.totalSessionsCompleted,
        activeFocusTaskId: undefined
      }));
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isTimerActive, state.timerTimeLeft === 0]);

  const disciplineScore = useMemo(() => {
    const completed = state.tasks.filter(t => t.isCompleted).length;
    const total = state.tasks.length || 1;
    return Math.round((completed / total) * 100);
  }, [state.tasks]);

  const toggleTimer = useCallback(() => setState(prev => ({ ...prev, isTimerActive: !prev.isTimerActive })), []);

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} 
      isTimerActive={state.isTimerActive} timerTimeLeft={state.timerTimeLeft}
      language={state.language} setLanguage={(l) => setState(p => ({...p, language: l}))}
      points={state.rewardPoints}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-10 animate-power pb-32">
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                 <span className="data-label text-emerald-500">Infrastructure Online</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-none uppercase italic">Strategic Command</h2>
              <p className="text-xl text-white/30 font-medium max-w-2xl">{motivation}</p>
            </div>
            <div className="flex-1 lg:flex-none px-10 py-8 bento-card flex flex-col items-center justify-center min-w-[220px]">
              <span className="data-label mb-3">{t.disciplineScore}</span>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-bold text-indigo-500 font-data leading-none">{disciplineScore}</span>
                <span className="text-xl font-bold text-white/20 font-data mb-1">%</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8 p-12 bento-card flex flex-col justify-between min-h-[440px]">
               <div className="flex justify-between items-start">
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                           <Award className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                           <h3 className="text-4xl font-bold text-white tracking-tight">Venture Capital</h3>
                           <p className="data-label text-indigo-500/60">Expansion Progress</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
                  <div className="space-y-3">
                     <span className="data-label">Total Credits</span>
                     <div className="text-6xl font-bold text-white font-data tracking-tight">{state.rewardPoints.toLocaleString()}</div>
                  </div>
                  <div className="space-y-3">
                     <span className="data-label">Growth Rate</span>
                     <div className="flex items-center gap-2 text-3xl font-bold text-emerald-500 font-data"><TrendingUp className="w-6 h-6" /> +12.4%</div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="data-label">Next Milestone</span>
                        <span className="text-sm font-bold text-white/40 font-data">{Math.round(((state.totalXP % 5000) / 5000) * 100)}%</span>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(state.totalXP % 5000) / 50}%` }}></div>
                     </div>
                  </div>
               </div>
            </section>
            <section className="lg:col-span-4 p-10 bento-card flex flex-col justify-between">
               <div className="space-y-10">
                  <div className="flex items-center justify-between"><h3 className="data-label flex items-center gap-3"><Wallet className="w-4 h-4" /> Capital Goal</h3><BarChart className="w-5 h-5 text-emerald-500/40" /></div>
                  <div className="space-y-2"><span className="text-7xl font-bold text-white font-data tracking-tighter leading-none italic">$1,000</span><p className="data-label pt-2">Target Monthly Inflow</p></div>
               </div>
               <button onClick={() => setActiveTab('goals')} className="w-full py-5 mt-10 bg-indigo-500 text-white rounded-3xl data-label tracking-widest hover:bg-indigo-600 transition-colors">Strategy Roadmap</button>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'focus' && (
        <PomodoroTimer 
          timeLeft={state.timerTimeLeft} isActive={state.isTimerActive}
          mode={state.timerMode} toggleTimer={toggleTimer}
          resetTimer={() => setState(p => ({...p, isTimerActive: false, timerTimeLeft: TIMER_MODES[p.timerMode].time * 60}))}
          changeMode={(m) => setState(p => ({...p, isTimerActive: false, timerMode: m, timerTimeLeft: TIMER_MODES[m].time * 60}))}
          focusMinutesToday={state.focusMinutesToday} restMinutesToday={state.restMinutesToday} 
          tasks={state.tasks.filter(t => !t.isCompleted)}
          activeTaskId={state.activeFocusTaskId} onSelectTask={(id) => setState(p => ({...p, activeFocusTaskId: id}))}
        />
      )}

      {activeTab === 'tasks' && (
        <div className="max-w-2xl mx-auto space-y-12 animate-power pb-24">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic text-white">Daily Execution</h2>
            <button onClick={() => setIsAddingTask(true)} className="px-8 py-4 bg-indigo-500 text-white rounded-2xl text-[0.65rem] font-bold uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> New Protocol
            </button>
          </div>
          <HabitTracker 
            tasks={state.tasks} 
            isTerminating={isTerminating}
            sleepHours={state.sleepHoursToday}
            phoneHours={state.phoneHoursToday}
            onUpdateSleep={(h) => setState(p => ({...p, sleepHoursToday: h}))}
            onUpdatePhone={(h) => setState(p => ({...p, phoneHoursToday: h}))}
            onToggleTask={(id) => setState(p => ({...p, tasks: p.tasks.map(t => t.id === id ? {...t, isCompleted: !t.isCompleted} : t)}))} 
            onDeleteTask={(id) => setState(p => ({...p, tasks: p.tasks.filter(x => x.id !== id)}))} 
            onMoveTask={handleMoveTask}
            onTerminateDay={handleTerminateDay}
          />
        </div>
      )}

      {activeTab === 'calendar' && (
        <CalendarView 
          events={state.calendarEvents} 
          goals={state.goals}
          onAddEvent={(event) => setState(p => ({...p, calendarEvents: [...p.calendarEvents, {...event, id: `e-${Date.now()}`}]}))}
          onDeleteEvent={(id) => setState(p => ({...p, calendarEvents: p.calendarEvents.filter(x => x.id !== id)}))}
          onToggleEvent={(id) => setState(p => ({...p, calendarEvents: p.calendarEvents.map(x => x.id === id ? {...x, isCompleted: !x.isCompleted} : x)}))}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView 
          state={state} 
          reportText={analyticsReport} 
          isLoadingReport={isGeneratingAnalytics} 
          onGenerateReport={handleGenerateAnalytics} 
        />
      )}

      {activeTab === 'progress' && (
        <DailyProgressView summaries={state.summaries} />
      )}

      {activeTab === 'goals' && (
        <div className="space-y-12 animate-power pb-24">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white">Strategic Roadmap</h2>
            <button onClick={() => setIsAddingGoal(true)} className="px-10 py-5 bg-indigo-500 text-white rounded-3xl font-bold uppercase tracking-widest text-[0.7rem] shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3">
              <Plus className="w-4 h-4" /> New Objective
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {state.goals.map(g => (
              <GoalCard 
                key={g.id} goal={g} language={state.language}
                onUpdateProgress={(id, val) => setState(p => ({...p, goals: p.goals.map(x => x.id === id ? {...x, currentValue: val, isCompleted: val >= x.targetValue} : x)}))}
                onDeleteGoal={(id) => setState(p => ({ ...p, goals: p.goals.filter(goal => goal.id !== id) }))}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <ProjectManager 
          projects={state.projects} tasks={state.tasks} language={state.language}
          onAddProject={(p) => setState(prev => ({ ...prev, projects: [...prev.projects, { ...p, id: `p-${Date.now()}` }] }))}
          onUpdateProject={(id, updates) => setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p) }))}
          onDeleteProject={(id) => setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }))}
        />
      )}

      {activeTab === 'inspiration' && (
        <InspirationBoard 
          items={state.inspiration} language={state.language}
          onAddItem={(item) => setState(p => ({...p, inspiration: [{...item, id: `i-${Date.now()}`, createdAt: new Date().toISOString()}, ...p.inspiration]}))}
          onDeleteItem={(id) => setState(p => ({...p, inspiration: p.inspiration.filter(i => i.id !== id)}))}
        />
      )}

      {activeTab === 'vault' && (
        <SecureVault 
          language={state.language} intel={state.privateIntel} logs={state.financialLogs}
          onAddIntel={(item) => setState(p => ({...p, privateIntel: [{...item, id: `intel-${Date.now()}`, updatedAt: new Date().toISOString()}, ...p.privateIntel]}))}
          onAddLog={(log) => setState(p => ({...p, financialLogs: [{...log, id: `log-${Date.now()}`}, ...p.financialLogs]}))}
          onDeleteIntel={(id) => setState(p => ({ ...p, privateIntel: p.privateIntel.filter(x => x.id !== id) }))}
          onDeleteLog={(id) => setState(p => ({ ...p, financialLogs: p.financialLogs.filter(x => x.id !== id) }))}
        />
      )}

      {/* MODALS */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-power">
          <div className="bg-[#0f0f12] border border-white/10 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl">
             <div className="p-10 flex justify-between items-center border-b border-white/5">
                <h3 className="text-3xl font-bold tracking-tight text-white italic">New Objective</h3>
                <button onClick={() => setIsAddingGoal(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><X className="w-7 h-7 opacity-30 text-white" /></button>
             </div>
             <form onSubmit={handleAddGoal} className="p-10 space-y-8">
                <input required type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="Objective Designation" className="venture-input w-full" />
                <textarea value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} placeholder="Strategic Rationale" className="venture-input w-full h-24 resize-none text-white/50" />
                <div className="grid grid-cols-2 gap-6">
                  <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value as any})} className="venture-input w-full">
                    <option value="Business">Business</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Learning">Learning</option>
                    <option value="Spirituality">Spirituality</option>
                  </select>
                  <input required type="number" value={newGoal.targetValue || ''} onChange={e => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value)})} placeholder="Numeric Target" className="venture-input w-full font-data" />
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-500 text-white rounded-[2rem] font-bold text-[0.8rem] uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-600 transition-all">Authorize Phase</button>
             </form>
          </div>
        </div>
      )}

      {isAddingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-power">
          <div className="bg-[#0f0f12] border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
             <div className="p-8 flex justify-between items-center border-b border-white/5">
                <h3 className="text-2xl font-bold tracking-tight text-white italic">Deploy Protocol</h3>
                <button onClick={() => setIsAddingTask(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"><X className="w-6 h-6 opacity-30 text-white" /></button>
             </div>
             <form onSubmit={handleAddTask} className="p-8 space-y-6">
                <div className="space-y-2">
                  <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Protocol Name" className="venture-input w-full !rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value as any})} className="venture-input w-full !rounded-2xl !px-4">
                    <option value="Business">Business</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Learning">Learning</option>
                    <option value="Spirituality">Spirituality</option>
                  </select>
                  <input required type="number" value={newTask.estimatedMinutes || ''} onChange={e => setNewTask({...newTask, estimatedMinutes: parseInt(e.target.value)})} placeholder="Mins" className="venture-input w-full !rounded-2xl font-data !px-4" />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-bold text-[0.7rem] uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Initialize
                </button>
             </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
