
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, 
  CheckCircle2, Circle, Calendar as CalendarIcon,
  Briefcase, Activity, BookOpen, Heart, Clock
} from 'lucide-react';
import { CalendarEvent, Goal } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { audio } from '../services/audioService';

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
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Business' as CalendarEvent['category'],
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    audio.playClick();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    audio.playClick();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayEvents = events.filter(e => e.date === selectedDateStr);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    audio.playSuccess();
    onAddEvent({
      ...newEvent,
      isCompleted: false,
      date: selectedDateStr
    });
    setIsAddingEvent(false);
    setNewEvent(prev => ({ ...prev, title: '', description: '' }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white italic">Protocol Schedule</h2>
          <p className="text-[11px] text-white/20 font-black tracking-[0.6em] uppercase">Tactical Planning & Milestones</p>
        </div>
        <div className="flex items-center gap-4 bg-[#141414] border border-white/5 p-2 rounded-2xl shadow-xl">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-xs font-black uppercase tracking-widest text-white px-4 min-w-[140px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-[#141414] border border-white/5 rounded-[48px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2eaadc]/5 blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;
              
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const dateStr = date.toISOString().split('T')[0];
              const hasEvents = events.some(e => e.date === dateStr);
              
              return (
                <button
                  key={idx}
                  onClick={() => { audio.playClick(); setSelectedDate(date); }}
                  className={`aspect-square relative rounded-2xl border transition-all flex flex-col items-center justify-center group ${
                    isSelected 
                      ? 'bg-[#2eaadc] border-[#2eaadc] text-white shadow-lg shadow-blue-500/20' 
                      : isToday 
                      ? 'bg-white/[0.05] border-white/10 text-white' 
                      : 'bg-transparent border-white/[0.03] text-white/40 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="text-sm font-black tracking-tighter">{date.getDate()}</span>
                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-2 w-1 h-1 rounded-full bg-[#2eaadc]" />
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/40" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#141414] border border-white/5 rounded-[40px] p-8 shadow-2xl min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tighter text-white uppercase italic">
                  {selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                </h3>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Selected Window</p>
              </div>
              <button 
                onClick={() => setIsAddingEvent(true)}
                className="w-10 h-10 bg-[#2eaadc] text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-90 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {dayEvents.length > 0 ? (
                dayEvents.map(event => (
                  <div key={event.id} className="group flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                    <button 
                      onClick={() => onToggleEvent(event.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {event.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2eaadc]" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/10 group-hover:text-white/20" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold leading-tight truncate ${event.isCompleted ? 'text-white/20 line-through' : 'text-white/80'}`}>
                        {event.title}
                      </p>
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: CATEGORY_COLORS[event.category] }}>
                        {event.category}
                      </span>
                    </div>
                    <button 
                      onClick={() => { audio.playPop(); onDeleteEvent(event.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-white/10 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-10">
                  <Clock className="w-10 h-10 mb-4 stroke-1" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Operational Void</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#2eaadc]/10 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2eaadc] mb-6 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Strategic Milestones
            </h3>
            <div className="space-y-5">
              {goals.filter(g => g.horizon === 'SixMonth').slice(0, 3).map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-white/60">{goal.title}</span>
                    <span className="text-white/20">Target End Q3</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/10" 
                      style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl">
            <div className="p-10 flex justify-between items-center border-b border-white/5">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Schedule Item</h3>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Locked for {selectedDate.toDateString()}</p>
              </div>
              <button onClick={() => setIsAddingEvent(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"><Plus className="w-6 h-6 opacity-30 rotate-45" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-10 space-y-8">
              <div className="space-y-4">
                <input 
                  autoFocus required type="text" 
                  value={newEvent.title} 
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                  placeholder="EVENT TITLE..." 
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest" 
                />
                
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewEvent({...newEvent, category: cat})}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        newEvent.category === cat 
                          ? 'bg-white/10 border-white/20 text-white shadow-xl' 
                          : 'bg-transparent border-white/5 text-white/20 hover:text-white/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <textarea 
                  value={newEvent.description} 
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})} 
                  placeholder="OPTIONAL DESCRIPTION..." 
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-[#2eaadc]/50 focus:outline-none uppercase tracking-widest h-32 resize-none" 
                />
              </div>
              <button type="submit" className="w-full py-6 bg-[#2eaadc] text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">CONFIRM ENTRY</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
