import React, { useState, useRef, useEffect, memo } from 'react';
import { Goal, Language } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
// Added missing Clock import
import { Check, X, Trash2, Calendar as CalendarIcon, GripVertical, Target, TrendingUp, AlertCircle, Plus, Minus, Info, Clock } from 'lucide-react';
import { translations } from '../translations';

interface GoalCardProps {
  goal: Goal;
  language: Language;
  onUpdateProgress: (id: string, newVal: number) => void;
  onDeleteGoal?: (id: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = memo(({ goal, language, onUpdateProgress, onDeleteGoal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [editValue, setEditValue] = useState(goal.currentValue.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  const categoryColor = CATEGORY_COLORS[goal.category] || '#6366f1';
  const t = translations[language];

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) onUpdateProgress(goal.id, val);
    setIsEditing(false);
  };

  const handleQuickAdjust = (delta: number) => {
    const newVal = Math.max(0, goal.currentValue + delta);
    onUpdateProgress(goal.id, newVal);
    setEditValue(newVal.toString());
  };

  return (
    <div className={`relative overflow-hidden transition-all duration-300 rounded-[2.5rem] border group bento-card ${isEditing ? 'border-indigo-500/50 ring-2 ring-indigo-500/10 scale-[1.01] z-10' : 'border-white/5'}`}>
      <div className="flex items-center justify-between px-8 py-5 bg-white/[0.01] border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="data-label text-[0.6rem] text-white/20">ID-{goal.id.toUpperCase().slice(-6)}</span>
        </div>
        <div className="flex items-center gap-2">
          {percentage >= 100 ? (
            <span className="px-4 py-1.5 bg-emerald-500/5 text-emerald-500 rounded-full text-[0.6rem] font-bold uppercase tracking-widest border border-emerald-500/10">MISSION SUCCESS</span>
          ) : (
            <span className="px-4 py-1.5 bg-indigo-500/5 text-indigo-500 rounded-full text-[0.6rem] font-bold uppercase tracking-widest border border-indigo-500/10">ACTIVE OBJECTIVE</span>
          )}
          <button onClick={() => setShowInfo(!showInfo)} className={`p-1.5 rounded-full transition-colors ${showInfo ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/20 hover:text-white'}`}>
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="px-8 py-6 bg-indigo-500/5 border-b border-white/5 animate-power">
          <p className="text-sm text-white/50 leading-relaxed italic">
            <span className="data-label text-indigo-400 block mb-1">Strategic Rationale</span>
            {goal.description || "No strategic data provided for this objective."}
          </p>
        </div>
      )}

      <div className="p-10 space-y-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] shadow-xl">{CATEGORY_ICONS[goal.category]}</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase italic">{goal.title}</h3>
              <p className="data-label text-indigo-500/40">{goal.category} Sector</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); if(onDeleteGoal) onDeleteGoal(goal.id); }} className="opacity-0 group-hover:opacity-100 p-3 bg-white/5 rounded-2xl text-white/10 hover:text-rose-500 transition-all"><Trash2 className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-end px-1">
            <div className="space-y-1.5">
              <span className="data-label">Strategy Progress</span>
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <input
                    ref={inputRef} type="number" value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="w-24 bg-white/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 text-lg font-bold text-white focus:outline-none font-data"
                  />
                ) : (
                  <div className="flex items-center gap-4">
                    <span onClick={() => setIsEditing(true)} className="text-4xl font-bold text-white tracking-tighter tabular-nums hover:text-indigo-400 cursor-pointer transition-colors font-data">
                      {goal.currentValue.toLocaleString()}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleQuickAdjust(1)} className="p-1.5 bg-white/5 rounded-lg text-white/20 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => handleQuickAdjust(-1)} className="p-1.5 bg-white/5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Minus className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
                <span className="text-sm font-bold text-white/10 pt-2 font-data">/ {goal.targetValue.toLocaleString()} {goal.unit}</span>
              </div>
            </div>
            <div className="text-right"><span className="text-xl font-data font-bold text-indigo-500">{percentage}%</span></div>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%`, backgroundColor: percentage >= 100 ? '#10b981' : categoryColor, boxShadow: `0 0 20px ${percentage >= 100 ? '#10b98144' : categoryColor + '44'}` }} />
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-white/30 font-bold"><Target className="w-4 h-4" /> {t[goal.horizon as keyof typeof t] || goal.horizon} Period</div>
          {percentage < 100 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Phase</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default GoalCard;