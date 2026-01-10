
import React from 'react';
import { Task } from '../types';
import { Flame, CheckCircle2, Circle, Trash2, FastForward, Ban } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';
import { audio } from '../services/audioService';

interface HabitTrackerProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSkipTask: (id: string) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ tasks, onToggleTask, onDeleteTask, onSkipTask }) => {
  const categories = ['Spirituality', 'Fitness', 'Learning', 'Business'] as const;

  const handleToggle = (id: string, isCompleted: boolean) => {
    if (!isCompleted) {
      audio.playSuccess();
    } else {
      audio.playPop();
    }
    onToggleTask(id);
  };

  const handleDelete = (id: string) => {
    // Immediate action for professional execution speed
    onDeleteTask(id);
  };

  return (
    <div className="space-y-12">
      {categories.map(category => {
        const categoryTasks = tasks.filter(t => t.category === category);
        if (categoryTasks.length === 0) return null;
        const color = CATEGORY_COLORS[category];

        return (
          <div key={category} className="space-y-4">
            <h2 className="px-4 text-[11px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} />
                {category}
              </span>
              <span className="text-[10px] font-bold opacity-30 tracking-widest bg-white/[0.02] px-2 py-0.5 rounded-lg border border-white/5">
                {categoryTasks.filter(t => t.isCompleted).length} / {categoryTasks.length}
              </span>
            </h2>
            <div className="space-y-3">
              {categoryTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggle(task.id, task.isCompleted);
                  }}
                  className={`px-6 py-4 flex items-center justify-between group cursor-pointer transition-all duration-200 rounded-[24px] border ${
                    task.isCompleted 
                      ? 'bg-white/[0.01] border-white/5 opacity-40 scale-[0.99]' 
                      : task.isSkipped 
                      ? 'border-dashed border-white/10 opacity-30 bg-transparent' 
                      : 'bg-[#181818] border-white/5 hover:border-white/20 hover:bg-[#1C1C1C] hover:scale-[1.01] shadow-2xl active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 transition-all duration-300 group-hover:scale-125">
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" style={{ color }} />
                      ) : task.isSkipped ? (
                        <Ban className="w-6 h-6 text-white/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-white/10 group-hover:text-white/40" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[16px] font-bold tracking-tight transition-all ${
                        task.isCompleted ? 'text-white/30 line-through' : 
                        task.isSkipped ? 'text-white/20 italic' : 'text-white/95'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    {task.streakCount > 0 && !task.isSkipped && (
                      <div className="flex items-center gap-2 text-[11px] font-black px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 transition-colors" style={{ color: task.isCompleted ? 'rgba(255,255,255,0.2)' : color }}>
                        <Flame className="w-4 h-4" />
                        {task.streakCount}
                      </div>
                    )}

                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0">
                      {!task.isCompleted && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            audio.playPop();
                            onSkipTask(task.id);
                          }}
                          className="p-2.5 text-white/20 hover:text-[#2eaadc] hover:bg-white/5 rounded-xl transition-all"
                        >
                          <FastForward className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        className="p-2.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitTracker;
