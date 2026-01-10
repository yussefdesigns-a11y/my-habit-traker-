
import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Timer, BarChart3, Clock } from 'lucide-react';
import { TimerMode } from '../types';

interface PomodoroTimerProps {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  toggleTimer: () => void;
  resetTimer: () => void;
  changeMode: (mode: TimerMode) => void;
  focusMinutesToday: number;
  restMinutesToday: number;
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
  restMinutesToday 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (MODES[mode].time * 60));

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tighter uppercase">Focus Protocol</h2>
        <p className="text-[11px] text-white/20 font-black tracking-[0.6em] uppercase">Time is your only non-renewable asset</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Timer Main Card */}
        <div className="bg-[#141414] border border-white/5 rounded-[48px] p-12 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Timer className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 space-y-10">
            <div className="flex justify-center gap-3">
              {(Object.keys(MODES) as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => changeMode(m)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    mode === m 
                      ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                      : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
                  }`}
                >
                  {MODES[m].label}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke={MODES[mode].color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress)}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-linear"
                    style={{ filter: `drop-shadow(0 0 8px ${MODES[mode].color}44)` }}
                  />
                </svg>
                <div className="text-6xl font-black tracking-tighter text-white tabular-nums">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={resetTimer}
                className="p-5 bg-white/5 hover:bg-white/10 text-white/40 rounded-[24px] transition-all active:scale-90"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button 
                onClick={toggleTimer}
                className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all"
              >
                {isActive ? <Pause className="w-8 h-8 fill-black" /> : <Play className="w-8 h-8 fill-black ml-1" />}
              </button>
              <div className="p-5 opacity-0 pointer-events-none">
                <RotateCcw className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Info Card */}
        <div className="space-y-6">
          <div className="bg-[#141414] border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] flex items-center gap-3 mb-8">
              <BarChart3 className="w-4 h-4" /> Productivity Stats
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#2eaadc]/10 rounded-2xl">
                    <Zap className="w-5 h-5 text-[#2eaadc]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-0.5">Deep Work Today</span>
                    <span className="text-xl font-black text-white">{focusMinutesToday} MIN</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Coffee className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-0.5">Rest Tracked Today</span>
                    <span className="text-xl font-black text-white">{restMinutesToday} MIN</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-2xl">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-0.5">Total Ratio</span>
                    <span className="text-xl font-black text-white">
                      {focusMinutesToday > 0 ? (focusMinutesToday / (restMinutesToday || 1)).toFixed(1) : '0'}X
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-[40px] p-8 shadow-2xl">
             <div className="flex items-center gap-4 text-white/40">
                <Timer className="w-5 h-5 opacity-50" />
                <p className="text-[12px] font-medium leading-relaxed italic">
                  "The key is not to prioritize what's on your schedule, but to schedule your priorities."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
