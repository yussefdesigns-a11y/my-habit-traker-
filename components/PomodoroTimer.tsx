import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, BarChart3, ChevronDown, CheckCircle2 } from 'lucide-react';
import { TimerMode, Task } from '../types';

interface PomodoroTimerProps {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  toggleTimer: () => void;
  resetTimer: () => void;
  changeMode: (mode: TimerMode) => void;
  focusMinutesToday: number;
  restMinutesToday: number;
  tasks: Task[];
  activeTaskId?: string;
  onSelectTask: (id: string) => void;
}

const MODES: Record<TimerMode, { label: string; time: number; color: string }> = {
  focus: { label: 'Deep Work', time: 25, color: '#2eaadc' },
  shortBreak: { label: 'Short Rest', time: 5, color: '#10B981' },
  longBreak: { label: 'Long Rest', time: 15, color: '#8B5CF6' }
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
  timeLeft, 
  isActive, 
  mode, 
  toggleTimer, 
  resetTimer, 
  changeMode,
  focusMinutesToday, 
  restMinutesToday,
  tasks,
  activeTaskId,
  onSelectTask
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = MODES[mode].time * 60;
  const progress = 1 - (timeLeft / totalTime);
  const activeTask = tasks.find(t => t.id === activeTaskId);

  const handleTaskSelect = (id: string) => {
    onSelectTask(id);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-5xl font-black tracking-tighter uppercase text-white italic">Focus Menu</h2>
        <p className="text-[11px] text-white/20 font-black tracking-[0.8em] uppercase">Execution Phase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Context & Tasks */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#141414] border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 relative">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] flex items-center gap-3">
              <Zap className="w-4 h-4" /> Focus Protocol
            </h3>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Currently Executing</label>
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-all text-left ${isDropdownOpen ? 'border-[#2eaadc]/40 ring-1 ring-[#2eaadc]/20' : ''}`}
                >
                  <span className="text-sm font-bold text-white/80 truncate pr-4">
                    {activeTask ? activeTask.title : 'NO PROTOCOL SELECTED'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#2eaadc]' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <>
                    {/* Invisible backdrop to close dropdown on click outside */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    <div className="absolute top-full left-0 w-full mt-3 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                      {tasks.length > 0 ? (
                        tasks.map(t => (
                          <button 
                            key={t.id}
                            onClick={() => handleTaskSelect(t.id)}
                            className={`w-full p-5 text-[12px] font-bold uppercase tracking-tight hover:bg-[#2eaadc]/10 transition-all cursor-pointer flex items-center justify-between border-b border-white/[0.02] last:border-0 ${activeTaskId === t.id ? 'text-[#2eaadc] bg-[#2eaadc]/5' : 'text-white/40 hover:text-white/80'}`}
                          >
                            <span className="truncate pr-4">{t.title}</span>
                            {activeTaskId === t.id && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-[10px] text-white/20 font-black text-center italic uppercase tracking-widest">
                          No Pending Protocols
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
              <p className="text-[11px] font-black text-[#2eaadc] uppercase tracking-widest">Active Objective</p>
              <p className="text-[13px] text-white/40 font-medium leading-relaxed italic">
                {activeTask ? `Engaging in deep work for: ${activeTask.title}. Protocol auto-completes when timer hits zero.` : "Select a mission protocol to begin your session. Undirected energy is wasted energy."}
              </p>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3 mb-8">
              <BarChart3 className="w-4 h-4" /> Performance Metrics
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Deep Work</span>
                <span className="text-xl font-black text-white">{focusMinutesToday}m</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2eaadc] shadow-[0_0_15px_#2eaadc] transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (focusMinutesToday/180)*100)}%` }} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Efficiency Ratio</span>
                <span className="text-xl font-black text-emerald-500">{(focusMinutesToday / (restMinutesToday || 1)).toFixed(1)}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: The Timer */}
        <div className="lg:col-span-8 flex flex-col items-center justify-start pt-4 lg:pt-10">
          <div className="relative">
            {/* Pulsing Background Ring - Decorative only */}
            <div className={`absolute inset-0 rounded-full bg-[#2eaadc]/5 blur-[100px] transition-opacity duration-1000 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className="relative z-10 w-[320px] h-[320px] md:w-[480px] md:h-[480px] flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90 pointer-events-none">
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2eaadc" />
                    <stop offset="100%" stopColor="#1e7aa0" />
                  </linearGradient>
                  <filter id="timerGlow">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <circle
                  cx="50%" cy="50%" r="46%"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-white/[0.03]"
                />
                <circle
                  cx="50%" cy="50%" r="46%"
                  stroke="url(#timerGradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="289% 289%"
                  strokeDashoffset={`${289 * (1 - progress)}%`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                  style={{ 
                    filter: isActive ? 'url(#timerGlow)' : 'none'
                  }}
                />
              </svg>
              
              <div className="flex flex-col items-center justify-center space-y-6 z-20">
                <span className={`text-[12px] font-black uppercase tracking-[0.6em] transition-all duration-500 ${isActive ? 'text-[#2eaadc] scale-110' : 'text-white/10'}`}>
                  {isActive ? 'Execution Live' : 'System Standby'}
                </span>
                <div className="text-[100px] md:text-[140px] font-black tracking-tighter text-white leading-none tabular-nums select-none drop-shadow-2xl">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                  {(Object.keys(MODES) as TimerMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => changeMode(m)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                        mode === m 
                          ? 'bg-[#2eaadc] text-white shadow-lg shadow-blue-500/20' 
                          : 'text-white/20 hover:text-white/50 hover:bg-white/5'
                      }`}
                    >
                      {MODES[m].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls Container */}
            <div className="flex items-center justify-center gap-10 mt-12 relative z-30">
              <button 
                onClick={resetTimer}
                title="Reset Session"
                className="w-16 h-16 bg-[#141414] border border-white/10 rounded-3xl flex items-center justify-center text-white/20 hover:text-[#2eaadc] hover:border-[#2eaadc]/30 hover:bg-[#1A1A1A] transition-all active:scale-90"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              
              <button 
                onClick={toggleTimer}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl group ${isActive ? 'bg-white text-black shadow-white/10' : 'bg-[#2eaadc] text-white shadow-blue-500/30'}`}
              >
                {isActive ? (
                  <Pause className="w-10 h-10 fill-current" />
                ) : (
                  <Play className="w-10 h-10 fill-current ml-2 group-hover:scale-110 transition-transform" />
                )}
              </button>

              <div className="w-16 h-16" /> {/* Spacer for symmetry */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;