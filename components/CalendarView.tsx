
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, 
  CheckCircle2, Circle, Calendar as CalendarIcon,
  Clock, MapPin, MoreHorizontal, LayoutGrid, List,
  Briefcase, Activity, BookOpen, Heart, X, Zap, ChevronUp, ChevronDown,
  Target
} from 'lucide-react';
import { CalendarEvent, Goal } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface CalendarViewProps {
  events: CalendarEvent[];
  goals: Goal[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onToggleEvent: (id: string) => void;
}

const CATEGORIES = ['Business', 'Fitness', 'Learning', 'Spirituality'] as const;

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events, 
  goals,
  onAddEvent, 
  onDeleteEvent, 
  onToggleEvent 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Business' as CalendarEvent['category'],
    description: '',
    time: '09:00',
    date: new Date().toISOString().split('T')[0]
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayEvents = useMemo(() => 
    events
      .filter(e => e.date === selectedDateStr)
      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00')),
    [events, selectedDateStr]
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    onAddEvent({
      ...newEvent,
      isCompleted: false,
      date: selectedDateStr
    });
    setIsAddingEvent(false);
    setNewEvent(prev => ({ ...prev, title: '', description: '', time: '09:00' }));
  };

  return (
    <div className="space-y-12 animate-power pb-32">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
             <span className="data-label text-indigo-500">Temporal Grid Sync</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black tracking-tight text-white uppercase italic leading-none">Tactical Agenda</h2>
          <div className="flex items-center gap-6">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}><List className="w-4 h-4" /></button>
             </div>
             <p className="data-label text-white/20 pt-1">Active Scheduling Protocol v4.2</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bento-card p-2 px-6">
           <button onClick={prevMonth} className="p-2.5 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
           <div className="min-w-[160px] text-center">
              <span className="text-xl font-bold font-data text-white tracking-tight uppercase">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
           </div>
           <button onClick={nextMonth} className="p-2.5 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Interface */}
        <div className="xl:col-span-8 space-y-8">
          <div className="bento-card p-10 bg-[#0d0d0d] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-1000" />
            
            <div className="grid grid-cols-7 gap-3 mb-8">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="data-label text-center py-4 text-white/20 font-black">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="aspect-[4/5]" />;
                
                const isToday = new Date().toDateString() === date.toDateString();
                const isSelected = selectedDate.toDateString() === date.toDateString();
                const dateStr = date.toISOString().split('T')[0];
                const dayEvts = events.filter(e => e.date === dateStr);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-[4/5] relative rounded-[2rem] border transition-all duration-300 flex flex-col items-center justify-center gap-2 group/day ${
                      isSelected 
                        ? 'bg-indigo-500 border-indigo-400 text-white shadow-2xl shadow-indigo-500/30 -translate-y-1' 
                        : isToday 
                        ? 'bg-white/5 border-white/20 text-white' 
                        : 'bg-transparent border-white/5 text-white/30 hover:bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <span className={`text-2xl font-bold font-data tracking-tighter ${isSelected ? 'text-white' : isToday ? 'text-indigo-400' : 'text-white/80'}`}>{date.getDate()}</span>
                    
                    <div className="flex gap-1">
                      {dayEvts.slice(0, 3).map((e, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? '#fff' : CATEGORY_COLORS[e.category] }} />
                      ))}
                      {dayEvts.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                    </div>

                    {isToday && !isSelected && (
                      <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bento-card p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                   <Zap className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                   <p className="data-label text-emerald-500/60 mb-1">Schedule Density</p>
                   <p className="text-3xl font-bold text-white font-data">{events.length} <span className="text-sm font-bold opacity-20 uppercase tracking-widest ml-1">Total Operations</span></p>
                </div>
             </div>
             <div className="bento-card p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                   <Target className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                   <p className="data-label text-indigo-500/60 mb-1">Strategic Accuracy</p>
                   <p className="text-3xl font-bold text-white font-data">92% <span className="text-sm font-bold opacity-20 uppercase tracking-widest ml-1">Commitment Rate</span></p>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Briefing */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bento-card p-10 bg-[#0d0d0d] flex flex-col min-h-[600px] border-white/10 shadow-3xl">
            <header className="flex items-center justify-between mb-12">
               <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-white tracking-tighter italic uppercase">
                    {selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'short' })} Briefing
                  </h3>
                  <p className="data-label text-white/20 tracking-[0.3em]">Operational Window Alpha</p>
               </div>
               <button 
                 onClick={() => setIsAddingEvent(true)}
                 className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all"
               >
                 <Plus className="w-6 h-6" />
               </button>
            </header>

            <div className="flex-1 space-y-4">
              {dayEvents.length > 0 ? (
                dayEvents.map(event => (
                  <div key={event.id} className="group relative flex items-start gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-all">
                    <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl" style={{ backgroundColor: CATEGORY_COLORS[event.category] }} />
                    
                    <div className="flex flex-col items-center gap-1 min-w-[50px] pt-1">
                       <span className="text-xs font-bold text-white/60 font-data">{event.time || '--:--'}</span>
                       <button 
                          onClick={() => onToggleEvent(event.id)}
                          className="mt-2 transition-all hover:scale-110 active:scale-90"
                       >
                          {event.isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-white/10 group-hover:text-white/30" />
                          )}
                       </button>
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <p className={`text-[1.05rem] font-bold leading-tight truncate ${event.isCompleted ? 'text-white/20 line-through' : 'text-white/90'}`}>
                        {event.title}
                      </p>
                      <div className="flex items-center gap-3">
                         <span className="data-label text-[0.5rem]" style={{ color: CATEGORY_COLORS[event.category] }}>{event.category}</span>
                         {event.description && <span className="text-[10px] text-white/10 italic truncate">Secure Notes Attached</span>}
                      </div>
                    </div>

                    <button 
                      onClick={() => onDeleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10 space-y-6">
                  <Clock className="w-16 h-16 stroke-1" />
                  <div className="space-y-1">
                     <p className="text-lg font-bold uppercase tracking-[0.4em]">Grid Void</p>
                     <p className="data-label text-[0.55rem]">Awaiting new protocol deployment</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-10 border-t border-white/5 space-y-6">
               <div className="flex items-center justify-between">
                  <h4 className="data-label text-indigo-500/60">Strategic Milestones</h4>
                  <ChevronUp className="w-4 h-4 text-white/10" />
               </div>
               <div className="space-y-4">
                  {goals.filter(g => g.horizon === 'SixMonth').slice(0, 2).map(goal => (
                    <div key={goal.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-[0.65rem] font-bold text-white/60 truncate uppercase italic">{goal.title}</span>
                          <span className="text-[0.65rem] font-bold text-indigo-500 font-data">{Math.round((goal.currentValue/goal.targetValue)*100)}%</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500/40" style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Professional Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-power">
          <div className="bg-[#0f0f12] border border-white/10 w-full max-w-xl rounded-[3.5rem] overflow-hidden shadow-2xl">
            <div className="p-12 flex justify-between items-center border-b border-white/5">
              <div className="space-y-1">
                <h3 className="text-4xl font-black uppercase tracking-tighter italic text-white">New Protocol</h3>
                <p className="data-label text-indigo-500/60 tracking-[0.4em]">Grid Slot: {selectedDate.toDateString()}</p>
              </div>
              <button onClick={() => setIsAddingEvent(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all"><X className="w-8 h-8 opacity-30 text-white" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-12 space-y-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="data-label text-white/20 ml-2">Objective Designation</label>
                  <input 
                    autoFocus required type="text" 
                    value={newEvent.title} 
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                    placeholder="E.G., VENTURE CAPITAL BRIEFING..." 
                    className="venture-input w-full !rounded-[2rem] font-bold italic" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="data-label text-white/20 ml-2">Sector</label>
                    <select 
                      value={newEvent.category} 
                      onChange={e => setNewEvent({...newEvent, category: e.target.value as any})} 
                      className="venture-input w-full !rounded-[2rem] cursor-pointer appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="data-label text-white/20 ml-2">Execution Time</label>
                    <input 
                      type="time" 
                      value={newEvent.time} 
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})} 
                      className="venture-input w-full !rounded-[2rem] font-data" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="data-label text-white/20 ml-2">Secure Rationale (Optional)</label>
                  <textarea 
                    value={newEvent.description} 
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})} 
                    placeholder="DETAILED OPERATIONAL INTEL..." 
                    className="venture-input w-full !rounded-[2rem] h-32 resize-none text-white/50 italic" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-7 bg-indigo-500 text-white rounded-[2.5rem] font-bold text-[0.85rem] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all hover:bg-indigo-600">Authorize Entry</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;