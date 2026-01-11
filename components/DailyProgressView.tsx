
import React from 'react';
import { DailySummary } from '../types';
import { TrendingUp, AlertCircle, Clock, CheckCircle, Brain, Calendar, ShieldCheck, Zap, Moon, Smartphone } from 'lucide-react';

interface DailyProgressViewProps {
  summaries: DailySummary[];
}

const DailyProgressView: React.FC<DailyProgressViewProps> = ({ summaries }) => {
  return (
    <div className="space-y-12 animate-power pb-32">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-indigo-500" />
           <span className="data-label text-indigo-500">Historical Archive</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white">Execution Timeline</h2>
        <p className="text-lg text-white/30 max-w-xl">A complete record of your daily discipline, performance scores, and strategic audits.</p>
      </header>

      {summaries.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center text-center opacity-20">
           <Calendar className="w-16 h-16 mb-6 stroke-1" />
           <p className="text-xl font-bold uppercase tracking-widest">Archive Empty</p>
           <p className="data-label mt-2">Terminate your first day to begin the timeline</p>
        </div>
      ) : (
        <div className="space-y-10 relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5" />
          
          {summaries.slice().reverse().map((day) => (
            <div key={day.id} className="relative pl-24 group">
              {/* Timeline Indicator */}
              <div className={`absolute left-[30px] top-6 w-4 h-4 rounded-full border-4 border-[#050505] z-10 transition-all group-hover:scale-125 ${
                day.verdict === 'Diligent' ? 'bg-emerald-500' : day.verdict === 'Lazy' ? 'bg-rose-500' : 'bg-white/20'
              }`} />

              <div className="bento-card p-10 space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <span className="data-label text-white/20">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                       <h3 className="text-2xl font-bold text-white font-data">MISSION ENTRY #{day.id.slice(-4).toUpperCase()}</h3>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <p className="data-label text-white/20 mb-1">Commander's Score</p>
                          <div className={`text-4xl font-bold font-data ${day.score >= 80 ? 'text-emerald-500' : day.score >= 50 ? 'text-indigo-500' : 'text-rose-500'}`}>
                            {day.score}%
                          </div>
                       </div>
                       <div className={`px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] ${
                         day.verdict === 'Diligent' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                       }`}>
                          {day.verdict}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-6">
                       <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                          <Brain className="absolute -bottom-4 -right-4 w-24 h-24 text-white/[0.02]" />
                          <h4 className="data-label text-[#2eaadc] mb-4 flex items-center gap-3"><Zap className="w-4 h-4" /> Strategic Audit</h4>
                          <p className="text-lg text-white/60 leading-relaxed italic">"{day.aiReflection}"</p>
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                       <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                          <span className="data-label flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> Executed Protocols</span>
                          <div className="flex flex-wrap gap-2">
                             {day.tasksSnapshot.map((t, i) => (
                               <span key={i} className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
                                 t.isCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-white/5 text-white/10 border-white/5 line-through'
                               }`}>
                                 {t.title}
                               </span>
                             ))}
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-3">
                          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <Clock className="w-4 h-4 text-indigo-500/40" />
                               <span className="data-label text-[0.5rem]">Focus Depth</span>
                            </div>
                            <span className="text-xl font-bold font-data text-white">{day.focusMinutes}M</span>
                          </div>
                          
                          <div className="p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <Moon className="w-4 h-4 text-indigo-400/40" />
                               <span className="data-label text-[0.5rem]">Recovery</span>
                            </div>
                            <span className="text-xl font-bold font-data text-indigo-400">{day.sleepHours}H</span>
                          </div>

                          <div className="p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <Smartphone className="w-4 h-4 text-amber-400/40" />
                               <span className="data-label text-[0.5rem]">Leakage</span>
                            </div>
                            <span className="text-xl font-bold font-data text-amber-400">{day.phoneHours}H</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyProgressView;
