
import React from 'react';
import { 
  LayoutDashboard, Target, CalendarDays, ClipboardList, 
  Edit3, Settings, Timer, BarChart3, Languages, Award, Briefcase,
  Sparkles, ShieldCheck, Lock
} from 'lucide-react';
import { audio } from '../services/audioService';
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
    { id: 'projects', icon: Briefcase, label: t.projects },
    { id: 'inspiration', icon: Sparkles, label: t.inspiration },
    { id: 'analytics', icon: BarChart3, label: t.performance },
    { id: 'calendar', icon: CalendarDays, label: t.calendar },
    { id: 'goals', icon: Target, label: t.goals },
    { id: 'tasks', icon: ClipboardList, label: t.habits },
    { id: 'vault', icon: Lock, label: t.privateVault, secure: true },
  ];

  const handleTabChange = (id: string) => {
    if (activeTab !== id) {
      audio.playClick();
      setActiveTab(id);
    }
  };

  const toggleLanguage = () => {
    audio.playPop();
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className={`flex h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar - Modern Dark Glass */}
      <aside className={`hidden md:flex flex-col w-72 bg-[#0F0F0F]/80 backdrop-blur-2xl border-${isRTL ? 'l' : 'r'} border-white/5 shadow-2xl`}>
        <div className="p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2eaadc] to-[#1e7aa0] rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">
              {isRTL ? 'ب' : 'P'}
            </div>
            <h1 className="text-lg font-black tracking-tighter text-white/90 uppercase">
              {t.appName}
            </h1>
          </div>
          
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-[#2eaadc] flex items-center gap-2"
          >
            <Languages className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">{language}</span>
          </button>
        </div>

        {/* REWARD POINTS DISPLAY IN SIDEBAR */}
        <div className="px-6 py-4 mx-4 mb-6 bg-gradient-to-br from-[#2eaadc]/10 to-[#1e7aa0]/5 border border-[#2eaadc]/20 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-[#2eaadc]/15 transition-all">
           <div className="p-3 bg-[#2eaadc]/20 rounded-xl group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-[#2eaadc]" />
           </div>
           <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2eaadc]">{t.growthCredits}</p>
              <p className="text-lg font-black text-white tabular-nums">{points.toLocaleString()}</p>
           </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[14px] transition-all duration-300 group relative ${
                activeTab === tab.id
                  ? 'bg-white/5 text-white shadow-inner border border-white/5'
                  : 'text-white/30 hover:bg-white/[0.03] hover:text-white/60'
              }`}
            >
              <tab.icon className={`w-5 h-5 transition-all duration-500 ${
                activeTab === tab.id 
                  ? (tab.secure ? 'text-emerald-500 scale-110' : 'text-[#2eaadc] scale-110') 
                  : 'opacity-40 group-hover:opacity-70 group-hover:scale-105'
              }`} />
              <div className="flex flex-col items-start">
                <span className={`font-bold tracking-tight ${activeTab === tab.id ? (isRTL ? '-translate-x-1' : 'translate-x-1') : (isRTL ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5') + ' transition-transform'}`}>
                  {tab.label}
                </span>
                {tab.id === 'focus' && isTimerActive && (
                  <span className="text-[10px] font-black text-[#2eaadc] animate-pulse">
                    {formatTime(timerTimeLeft)}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} w-1 h-4 ${tab.secure ? 'bg-emerald-500 shadow-[0_0_20px_#10B981]' : 'bg-[#2eaadc] shadow-[0_0_20px_#2eaadc]'} rounded-full`} />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <button 
            className="flex items-center gap-4 w-full px-4 py-3 text-[14px] text-white/20 hover:text-white/50 hover:bg-white/[0.02] rounded-xl transition-all font-bold tracking-tight"
            onClick={() => handleTabChange('settings')}
          >
            <Settings className="w-5 h-5 opacity-40" />
            <span>{t.settings}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto w-full p-8 md:p-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
