import React, { useState, memo } from 'react';
import { Play, Pause, RotateCcw, Zap, BarChart3, ChevronDown, CheckCircle2, Target, Shield, Crosshair, ArrowRight } from 'lucide-react';
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
  focus: { label: 'Deep Work', time: 25, color: '#6366f1' },
  shortBreak: { label: 'Recovery', time: 5, color: '#10b981' },
  longBreak: { label: 'Sabbatical', time: 15, color: '#8b5cf6' }
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
  timeLeft, isActive, mode, toggleTimer, resetTimer, changeMode,
  focusMinutesToday, restMinutesToday, tasks, activeTaskId, onSelectTask
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

  return (
    <div className="space-y-12 animate-power pb-32">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center gap-4 text-indigo-400 px-8 py-2.5 border border-indigo-400/10 rounded-full bg-indigo-500/5 backdrop-blur-3xl">
           <div className={`w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] ${isActive ? 'animate-pulse' : ''}`} />
           <span className="data-label text-indigo-400">Cognitive Focus Engine Active</span>
        </div>
        <h2 className="text-6xl font-black tracking-tight text-white uppercase italic leading-none">High Intensity</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-8">
          <div className="bento-card p-12 space-y-12 relative">
            <div className="space-y-2">
              <h3 className="data-label flex items-center gap-3 text-indigo-500">
                <Crosshair className="w-4 h-4" /> Selected Target
              </h3>
              <p className="data-label text-[0.55rem]">Current Deployment Objective</p>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex items-center justify-between transition-all hover:bg-white/[0.06] ${isDropdownOpen ? 'border-indigo-500/40 ring-4 ring-indigo-500/5' : ''}`}
              >
                <span className="text-lg font-bold text-white truncate pr-6 font-data uppercase">
                  {activeTask ? activeTask.title : 'SELECT OBJECTIVE'}
                </span>
                <ChevronDown className={`w-5 h-5 text-white/20 transition-transform ${isDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute top-full left-0 w-full mt-4 bg-[#121215] border border-white/10 rounded-3xl shadow-2xl z-20 max-h-72 overflow-y-auto custom-scrollbar animate-power">
                    {tasks.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => { onSelectTask(t.id); setIsDropdownOpen(false); }}
                        className={`w-full p-6 text-[0.65rem] font-bold uppercase tracking-widest text-left flex items-center justify-between border-b border-white/[0.03] last:border-0 hover:bg-indigo-500/10 ${activeTaskId === t.id ? 'text-indigo-400 bg-indigo-500/5' : 'text-white/40 hover:text-white'}`}
                      >
                        <span className="truncate">{t.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[2rem] space-y-5">
              <div className="flex items-center gap-4">
                 <Shield className="w-5 h-5 text-indigo-500/30" />
                 <span className="data-label">Security Logic</span>
              </div>
              <p className="text-[1.05rem] text-white/40 leading-relaxed italic border-l-2 border-indigo-500/20 pl-6">
                {activeTask ? `Active protocol: ${activeTask.title}. External noise filtered. Secure depth established.` : "Engine idle. Select mission to initiate focus sequence."}
              </p>
            </div>
          </div>

          <div className="bento-card p-12 space-y-12">
            <h3 className="data-label flex items-center gap-3 text-white/30">
              <BarChart3 className="w-4 h-4" /> Focus Intelligence
            </h3>
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="data-label">Sustain Level</span>
                  <span className="text-3xl font-bold text-white font-data">{focusMinutesToday}M</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                    style={{ width: `${Math.min(100, (focusMinutesToday/180)*100)}%` }} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="space-y-1">
                   <span className="data-label">Burn Rate</span>
                   <div className="text-3xl font-bold text-emerald-500 font-data">{(focusMinutesToday / (restMinutesToday || 1)).toFixed(1)}x</div>
                </div>
                <Zap className="w-10 h-10 text-emerald-500/10" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="relative group/gauge">
            <div className={`absolute inset-0 rounded-full bg-indigo-500/5 blur-[120px] transition-all duration-[2000ms] pointer-events-none ${isActive ? 'opacity-100 scale-125' : 'opacity-0 scale-90'}`} />
            
            <div className="relative z-10 w-[340px] h-[340px] md:w-[540px] md:h-[540px] flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90 pointer-events-none drop-shadow-2xl">
                <circle cx="50%" cy="50%" r="44%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" fill="transparent" />
                <circle
                  cx="50%" cy="50%" r="44%"
                  stroke="#6366f1"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="276.5% 276.5%"
                  strokeDashoffset={`${276.5 * (1 - progress)}%`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                  style={{ filter: isActive ? 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.4))' : 'none' }}
                />
              </svg>
              
              <div className="flex flex-col items-center justify-center space-y-10 z-20">
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-[2rem]">
                  {(Object.keys(MODES) as TimerMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => changeMode(m)}
                      className={`px-6 py-2.5 rounded-2xl data-label text-[0.6rem] transition-all ${
                        mode === m 
                          ? 'bg-indigo-500 text-white shadow-xl' 
                          : 'text-white/20 hover:text-white/50'
                      }`}
                    >
                      {MODES[m].label}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-col items-center">
                   <div className="text-[120px] md:text-[180px] font-bold tracking-tighter text-white leading-none tabular-nums font-data">
                    {formatTime(timeLeft)}
                  </div>
                  <div className={`data-label text-indigo-500 tracking-[0.8em] mt-[-10px] transition-all duration-1000 ${isActive ? 'opacity-100 translate-y-4' : 'opacity-0'}`}>
                    SEQUENCING DEPTH
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-12 mt-16 relative z-30">
              <button 
                onClick={resetTimer}
                className="w-20 h-20 bento-card rounded-[2.5rem] flex items-center justify-center text-white/20 hover:text-rose-500 transition-all hover:scale-110 active:scale-90"
              >
                <RotateCcw className="w-7 h-7" />
              </button>
              
              <button 
                onClick={toggleTimer}
                className={`w-40 h-40 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl ${isActive ? 'bg-white text-black' : 'bg-indigo-500 text-white'}`}
              >
                {isActive ? <Pause className="w-16 h-16 fill-current" /> : <Play className="w-16 h-16 fill-current ml-3" />}
              </button>

              <div className="w-20 h-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;