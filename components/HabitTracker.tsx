
import React, { memo } from 'react';
import { Task } from '../types';
import { Flame, CheckCircle2, Trash2, Zap, Plus, Clock, ChevronUp, ChevronDown, Flag, Shield, Moon, Smartphone, Minus } from 'lucide-react';

interface HabitTrackerProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  onTerminateDay: () => void;
  isTerminating: boolean;
  sleepHours: number;
  phoneHours: number;
  onUpdateSleep: (hours: number) => void;
  onUpdatePhone: (hours: number) => void;
}

const TaskItem = memo(({ 
  task, onToggle, onDelete, onMove 
}: { 
  task: Task; onToggle: () => void; onDelete: () => void; onMove: (dir: 'up' | 'down') => void;
}) => (
  <div 
    onClick={onToggle}
    className={`group relative transition-all duration-300 p-5 rounded-[2rem] border cursor-pointer bento-card active:scale-[0.99] ${
      task.isCompleted ? 'opacity-30 border-white/5 bg-emerald-500/[0.02]' : 'border-white/5 bg-white/[0.01]'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-5">
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
           task.isCompleted 
            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
            : 'bg-white/5 text-white/20 border-white/10 group-hover:border-white/20'
         }`}>
            {task.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
         </div>

         <div className="space-y-0.5">
            <h4 className={`text-lg font-bold tracking-tight transition-all italic ${
              task.isCompleted ? 'text-white/40 line-through' : 'text-white/95'
            }`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-4">
              <span className="data-label text-[0.55rem] text-white/20">
                 {task.category}
              </span>
              {task.estimatedMinutes && !task.isCompleted && (
                <div className="flex items-center gap-1.5 text-indigo-500/40">
                   <Clock className="w-3.5 h-3.5" />
                   <span className="data-label text-[0.55rem]">{task.estimatedMinutes}M Depth</span>
                </div>
              )}
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4">
         {task.streakCount > 0 && !task.isCompleted && (
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
              <Flame className={`w-3.5 h-3.5 ${task.streakCount > 5 ? 'text-orange-500' : 'text-indigo-400'}`} />
              <span className="text-sm font-bold text-white font-data">{task.streakCount}</span>
           </div>
         )}

         <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={(e) => { e.stopPropagation(); onMove('up'); }} className="p-1 hover:text-indigo-500 text-white/10 hover:bg-white/5 rounded-md"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onMove('down'); }} className="p-1 hover:text-indigo-500 text-white/10 hover:bg-white/5 rounded-md"><ChevronDown className="w-4 h-4" /></button>
         </div>

         <button 
           onClick={(e) => { e.stopPropagation(); onDelete(); }}
           className="opacity-0 group-hover:opacity-100 p-2.5 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
         >
           <Trash2 className="w-5 h-5" />
         </button>
      </div>
    </div>
  </div>
));

const HabitTracker: React.FC<HabitTrackerProps> = ({ 
  tasks, onToggleTask, onDeleteTask, onMoveTask, onTerminateDay, isTerminating,
  sleepHours, phoneHours, onUpdateSleep, onUpdatePhone
}) => {
  return (
    <div className="space-y-10 animate-power">
      {/* Biometric Sync Section */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bento-card p-6 border-indigo-500/10 bg-indigo-500/[0.02] flex flex-col justify-between min-h-[160px]">
           <div className="flex items-center justify-between mb-2">
              <span className="data-label text-indigo-400">Recovery Window</span>
              <Moon className="w-4 h-4 text-indigo-400" />
           </div>
           <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-white font-data">{sleepHours}H</span>
              <div className="flex gap-2">
                 <button onClick={() => onUpdateSleep(Math.max(0, sleepHours - 0.5))} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><Minus className="w-4 h-4 text-white/40" /></button>
                 <button onClick={() => onUpdateSleep(Math.min(24, sleepHours + 0.5))} className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"><Plus className="w-4 h-4" /></button>
              </div>
           </div>
           <p className="data-label text-[0.5rem] text-white/10 pt-4">Target: 7.5H - 8.5H</p>
        </div>

        <div className="bento-card p-6 border-amber-500/10 bg-amber-500/[0.02] flex flex-col justify-between min-h-[160px]">
           <div className="flex items-center justify-between mb-2">
              <span className="data-label text-amber-500">Digital Leakage</span>
              <Smartphone className="w-4 h-4 text-amber-500" />
           </div>
           <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-white font-data">{phoneHours}H</span>
              <div className="flex gap-2">
                 <button onClick={() => onUpdatePhone(Math.max(0, phoneHours - 0.5))} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><Minus className="w-4 h-4 text-white/40" /></button>
                 <button onClick={() => onUpdatePhone(Math.min(24, phoneHours + 0.5))} className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"><Plus className="w-4 h-4" /></button>
              </div>
           </div>
           <p className="data-label text-[0.5rem] text-white/10 pt-4">Risk Threshold: &gt; 3H</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
          <TaskItem 
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onMove={(dir) => onMoveTask(task.id, dir)}
          />
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="pt-8 border-t border-white/5 space-y-6">
           <button 
             onClick={onTerminateDay}
             disabled={isTerminating}
             className="group w-full py-7 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-[2.5rem] font-bold text-[0.75rem] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-5 disabled:opacity-50"
           >
             {isTerminating ? (
               <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
             ) : (
               <>
                <Flag className="w-5 h-5 group-hover:animate-bounce" />
                Terminate Day & Generate Audit
               </>
             )}
           </button>
           <div className="flex items-center justify-center gap-3 opacity-20">
              <Shield className="w-3.5 h-3.5" />
              <p className="data-label text-[0.6rem]">Mission data will be archived to the Executive Timeline</p>
           </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center opacity-10">
           <Zap className="w-16 h-16 mb-6 stroke-1" />
           <p className="text-lg font-bold uppercase tracking-[0.5em]">System Idle</p>
           <p className="data-label mt-2">Deploy new targets to initiate growth sequence</p>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
