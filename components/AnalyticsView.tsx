
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { AppState, FocusSession } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { 
  Activity, Zap, Target, Brain, 
  TrendingUp, AlertCircle, Sparkles, Clock
} from 'lucide-react';

interface AnalyticsViewProps {
  state: AppState;
  reportText: string | null;
  onGenerateReport: () => void;
  isLoadingReport: boolean;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state, reportText, onGenerateReport, isLoadingReport }) => {
  
  // 1. Time of Day Analysis (Productivity Peak)
  const timeOfDayData = useMemo(() => {
    const buckets = Array(24).fill(0).map((_, i) => ({ hour: i, sessions: 0 }));
    state.sessionHistory.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      buckets[hour].sessions += 1;
    });
    return buckets;
  }, [state.sessionHistory]);

  // 2. Category Distribution
  const categoryData = useMemo(() => {
    const distribution: Record<string, number> = {};
    state.sessionHistory.filter(s => s.type === 'focus').forEach(s => {
      // Find the task category if linked
      const task = state.tasks.find(t => t.id === s.taskId);
      const cat = task ? task.category : 'Deep Work';
      distribution[cat] = (distribution[cat] || 0) + s.durationMinutes;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [state.sessionHistory, state.tasks]);

  // 3. Planning Accuracy (Estimates vs Actuals)
  const planningAccuracy = useMemo(() => {
    const completedWithEstimates = state.tasks.filter(t => t.isCompleted && t.estimatedMinutes);
    if (completedWithEstimates.length === 0) return 0;
    
    const totalEst = completedWithEstimates.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    const totalAct = completedWithEstimates.reduce((acc, t) => acc + (t.actualMinutesSpent || 0), 0);
    
    return Math.round((totalEst / (totalAct || 1)) * 100);
  }, [state.tasks]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white italic">Execution Intel</h2>
          <p className="text-[11px] text-white/20 font-black tracking-[0.6em] uppercase">Advanced Performance Metrics</p>
        </div>
        <button 
          onClick={onGenerateReport}
          disabled={isLoadingReport}
          className="px-8 py-4 bg-[#2eaadc] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isLoadingReport ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : <Sparkles className="w-4 h-4" />}
          Generate Strategic Audit
        </button>
      </header>

      {/* PRIMARY VITAL SIGNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-[#141414] border border-white/5 rounded-[40px] shadow-xl space-y-4">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Planning Accuracy</span>
              <AlertCircle className="w-4 h-4 text-orange-500/50" />
           </div>
           <div className="text-4xl font-black text-white">{planningAccuracy}%</div>
           <p className="text-[11px] text-white/30 font-medium italic">Accuracy of task duration estimates vs actual execution time.</p>
        </div>
        <div className="p-8 bg-[#141414] border border-white/5 rounded-[40px] shadow-xl space-y-4">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Focus Velocity</span>
              <Zap className="w-4 h-4 text-[#2eaadc]/50" />
           </div>
           <div className="text-4xl font-black text-white">{state.totalSessionsCompleted}</div>
           <p className="text-[11px] text-white/30 font-medium italic">Total high-intensity focus sessions initiated this cycle.</p>
        </div>
        <div className="p-8 bg-[#141414] border border-white/5 rounded-[40px] shadow-xl space-y-4">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Execution Ratio</span>
              <Target className="w-4 h-4 text-emerald-500/50" />
           </div>
           <div className="text-4xl font-black text-white">
             {Math.round((state.tasks.filter(t => t.isCompleted).length / (state.tasks.length || 1)) * 100)}%
           </div>
           <p className="text-[11px] text-white/30 font-medium italic">Percentage of total protocols successfully terminated.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Heatmap/Activity Flow */}
        <div className="lg:col-span-8 p-10 bg-[#141414] border border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2eaadc]/5 blur-[100px] pointer-events-none" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] flex items-center gap-3 mb-8">
            <Clock className="w-4 h-4" /> Hourly Execution Density
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeOfDayData}>
                <defs>
                  <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2eaadc" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2eaadc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                   itemStyle={{ color: '#2eaadc' }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#2eaadc" strokeWidth={3} fillOpacity={1} fill="url(#colorHour)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Radar/Pie */}
        <div className="lg:col-span-4 p-10 bg-[#141414] border border-white/5 rounded-[48px] shadow-2xl">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2 mb-8">
            <Brain className="w-4 h-4" /> Cognitive Load
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#2eaadc'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[10px] font-black uppercase text-white/10 tracking-widest text-center italic">
                Awaiting Data Points
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI STRATEGIC REPORT */}
      <section className="p-12 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#2eaadc]/20 rounded-[56px] shadow-3xl relative overflow-hidden mission-glow">
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#2eaadc] flex items-center gap-3">
              <Sparkles className="w-4 h-4" /> Strategic Performance Briefing
            </h3>
            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Level 4 Clearance Required</span>
          </div>
          
          {reportText ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="prose prose-invert prose-sm max-w-none text-white/70 font-medium italic leading-relaxed whitespace-pre-line">
                 {reportText}
               </div>
               <div className="space-y-6">
                  <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-2">
                     <span className="text-[10px] font-black uppercase text-[#2eaadc] tracking-widest">Tactical Tip</span>
                     <p className="text-[12px] text-white/40 leading-relaxed">
                       Your data suggests peak cognitive load occurs in the morning. Shift all "Business" tasks to the 5 AM - 8 AM window for maximum ROI.
                     </p>
                  </div>
                  <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-2">
                     <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Stability Alert</span>
                     <p className="text-[12px] text-white/40 leading-relaxed">
                       Rest session duration is optimal. You are maintaining a sustainable pace for long-term growth.
                     </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.2em]">Initiate strategic audit to reveal patterns</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsView;
