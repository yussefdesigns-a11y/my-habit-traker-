
import React from 'react';
import { LayoutDashboard, Target, CalendarDays, ClipboardList, Edit3, Settings, TrendingUp, Timer } from 'lucide-react';
import { audio } from '../services/audioService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isTimerActive: boolean;
  timerTimeLeft: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isTimerActive, timerTimeLeft }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'focus', icon: Timer, label: 'Focus' },
    { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'tasks', icon: ClipboardList, label: 'Habits' },
    { id: 'journal', icon: Edit3, label: 'Archive' },
  ];

  const handleTabChange = (id: string) => {
    if (activeTab !== id) {
      audio.playClick();
      setActiveTab(id);
    }
  };

  return (
    <div className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden">
      {/* Sidebar - Modern Dark Glass */}
      <aside className="hidden md:flex flex-col w-64 bg-[#141414]/80 backdrop-blur-xl border-r border-white/5 shadow-2xl">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2eaadc] to-[#1e7aa0] rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">Y</div>
          <h1 className="text-lg font-black tracking-tighter text-white/90">
            YOUSSEF
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
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
              <tab.icon className={`w-5 h-5 transition-all duration-500 ${activeTab === tab.id ? 'text-[#2eaadc] scale-110' : 'opacity-40 group-hover:opacity-70 group-hover:scale-105'}`} />
              <div className="flex flex-col items-start">
                <span className={`font-bold tracking-tight ${activeTab === tab.id ? 'translate-x-1' : 'group-hover:translate-x-0.5 transition-transform'}`}>
                  {tab.label}
                </span>
                {tab.id === 'focus' && isTimerActive && (
                  <span className="text-[10px] font-black text-[#2eaadc] animate-pulse">
                    {formatTime(timerTimeLeft)}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <div className="ml-auto w-1 h-4 bg-[#2eaadc] rounded-full shadow-[0_0_100px_#2eaadc]" />
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
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-[#0F0F0F]">
        <div className="max-w-5xl mx-auto w-full p-8 md:p-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
