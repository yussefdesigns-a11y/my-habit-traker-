import React from 'react';
import { 
  LayoutDashboard, Target, CalendarDays, ClipboardList, 
  Languages, Award, Briefcase, Timer, BarChart3,
  Sparkles, Lock, History
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isTimerActive: boolean;
  timerTimeLeft: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  points: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setActiveTab, 
  isTimerActive, timerTimeLeft, 
  language, setLanguage,
  points
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'focus', icon: Timer, label: t.focus },
    { id: 'tasks', icon: ClipboardList, label: t.habits },
    { id: 'progress', icon: History, label: 'Timeline' },
    { id: 'projects', icon: Briefcase, label: t.projects },
    { id: 'inspiration', icon: Sparkles, label: t.inspiration },
    { id: 'analytics', icon: BarChart3, label: t.performance },
    { id: 'calendar', icon: CalendarDays, label: t.calendar },
    { id: 'goals', icon: Target, label: t.goals },
    { id: 'vault', icon: Lock, label: t.privateVault, secure: true },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans select-none" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Executive Sidebar */}
      <aside className={`hidden md:flex flex-col w-80 bg-[#0d0d0d] border-${isRTL ? 'l' : 'r'} border-white/[0.04] relative z-50`}>
        <div className="p-12 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl font-data">
              {isRTL ? 'ب' : 'P'}
            </div>
            <div className="space-y-0">
               <h1 className="text-2xl font-black tracking-tight text-white italic">{t.appName}</h1>
               <span className="data-label opacity-40">System Core v3.0</span>
            </div>
          </div>
        </div>

        <div className="px-10 pb-10">
           <div className="p-6 bg-indigo-500/5 rounded-[2rem] flex items-center gap-5 border border-indigo-500/10">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                 <Award className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="space-y-0">
                 <p className="data-label text-indigo-500/60">Venture Points</p>
                 <p className="text-2xl font-bold text-white font-data leading-none">{points.toLocaleString()}</p>
              </div>
           </div>
        </div>
        
        <nav className="flex-1 px-6 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-[14px] transition-all duration-300 group relative ${
                activeTab === tab.id
                  ? 'bg-white/5 text-white'
                  : 'text-white/20 hover:bg-white/[0.02] hover:text-white/40'
              }`}
            >
              <tab.icon className={`w-5 h-5 transition-all ${
                activeTab === tab.id ? (tab.secure ? 'text-emerald-500' : 'text-indigo-500') : 'opacity-20 group-hover:opacity-40'
              }`} />
              <div className="flex-1 text-left">
                <span className={`font-bold uppercase tracking-widest text-[0.7rem] ${activeTab === tab.id ? 'text-white' : 'text-white/30'}`}>
                  {tab.label}
                </span>
                {tab.id === 'focus' && isTimerActive && (
                  <p className="text-[0.7rem] font-bold text-indigo-500 font-data">{formatTime(timerTimeLeft)}</p>
                )}
              </div>
              {activeTab === tab.id && (
                <div className={`w-1.5 h-1.5 ${tab.secure ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-full`} />
              )}
            </button>
          ))}
        </nav>

        <div className="p-10 border-t border-white/[0.04]">
          <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="data-label hover:text-white transition-colors flex items-center gap-3 w-full px-6 py-4">
            <Languages className="w-4 h-4" /> Language: {language.toUpperCase()}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#050505] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.03)_0%,transparent_50%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto w-full p-10 md:p-16 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;