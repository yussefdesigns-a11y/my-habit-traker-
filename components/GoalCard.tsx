
import React, { useState, useRef, useEffect } from 'react';
import { Goal } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { Check, X, Trash2 } from 'lucide-react';
import { audio } from '../services/audioService';

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (id: string, newVal: number) => void;
  onDeleteGoal?: (id: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdateProgress, onDeleteGoal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.currentValue.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  const categoryColor = CATEGORY_COLORS[goal.category] || '#2eaadc';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      if (val > goal.currentValue) audio.playSuccess();
      else audio.playPop();
      onUpdateProgress(goal.id, val);
    }
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteGoal) {
      onDeleteGoal(goal.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const startEdit = () => {
    audio.playPop();
    setIsEditing(true);
  };

  return (
    <div 
      onClick={() => !isEditing && startEdit()}
      className={`relative overflow-hidden transition-all duration-300 rounded-[32px] p-8 cursor-pointer border group ${
        isEditing 
          ? 'border-[#2eaadc]/50 bg-[#1A1A1A] scale-[1.02] shadow-2xl shadow-[#2eaadc]/10' 
          : 'border-white/5 bg-[#141414] hover:border-white/20 hover:bg-[#181818] shadow-lg'
      }`}
    >
      {/* Background Subtle Gradient */}
      <div 
        className="absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 opacity-[0.05] blur-3xl pointer-events-none group-hover:opacity-[0.08] transition-opacity"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5 transition-transform duration-500 group-hover:scale-110">
            {CATEGORY_ICONS[goal.category]}
          </div>
          <div>
            <h3 className="text-[18px] font-black text-white/95 leading-tight tracking-tight">
              {goal.title}
            </h3>
            <span className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em]">{goal.horizon}</span>
          </div>
        </div>
        
        {!isEditing && onDeleteGoal && (
          <button 
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-3 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end">
          {isEditing ? (
            <div className="flex items-center gap-4 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-24 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#2eaadc] shadow-inner"
              />
              <span className="text-[12px] font-bold text-white/20">/ {goal.targetValue} {goal.unit}</span>
              <div className="flex gap-2 ml-auto">
                <button onClick={handleSave} className="p-3 bg-[#2eaadc] text-white rounded-2xl shadow-xl shadow-blue-500/20 active:scale-90 transition-transform"><Check className="w-5 h-5" /></button>
                <button onClick={() => setIsEditing(false)} className="p-3 bg-white/5 text-white/40 rounded-2xl hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[24px] font-black text-white leading-none tracking-tighter">
                {goal.currentValue} <span className="text-[13px] text-white/20 font-black uppercase tracking-[0.2em] ml-2">/ {goal.targetValue} {goal.unit}</span>
              </p>
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-black tracking-[0.2em] uppercase" style={{ color: percentage >= 100 ? '#10B981' : 'rgba(255,255,255,0.4)' }}>
                  {percentage}%
                </span>
              </div>
            </>
          )}
        </div>

        <div className="h-2.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: percentage >= 100 ? '#10B981' : categoryColor,
              boxShadow: `0 0 25px ${percentage >= 100 ? '#10B98155' : categoryColor + '55'}`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
