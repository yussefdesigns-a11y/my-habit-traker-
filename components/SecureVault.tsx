import React, { useState, useEffect } from 'react';
import { 
  Lock, ShieldAlert, Key, Zap, 
  DollarSign, Briefcase, Users, 
  Trash2, Plus, ChevronRight, Eye, EyeOff,
  TrendingUp, Wallet, ShieldCheck, FileText,
  LockKeyhole
} from 'lucide-react';
import { PrivateIntel, FinancialLog, Language } from '../types';
import { translations } from '../translations';

interface SecureVaultProps {
  language: Language;
  intel: PrivateIntel[];
  logs: FinancialLog[];
  onAddIntel: (item: Omit<PrivateIntel, 'id' | 'updatedAt'>) => void;
  onAddLog: (log: Omit<FinancialLog, 'id'>) => void;
  onDeleteIntel: (id: string) => void;
  onDeleteLog: (id: string) => void;
}

const SecureVault: React.FC<SecureVaultProps> = ({ 
  language, intel, logs, 
  onAddIntel, onAddLog, onDeleteIntel, onDeleteLog 
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [showValues, setShowValues] = useState(false);
  
  const t = translations[language];
  const CORRECT_PASSCODE = "1997"; // Symbolic high-security default

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === CORRECT_PASSCODE) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 2000);
    }
  };

  const netBalance = logs.reduce((acc, log) => 
    log.type === 'Credit' ? acc + log.amount : acc - log.amount, 0);

  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-full max-w-md bg-[#0D0D0D] border border-white/5 rounded-[48px] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2eaadc] to-transparent opacity-20" />
          
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center border transition-all duration-500 ${error ? 'bg-rose-500/10 border-rose-500 shadow-rose-500/20 animate-shake' : 'bg-white/5 border-white/10 group-hover:border-[#2eaadc]/40 shadow-xl'}`}>
              <LockKeyhole className={`w-10 h-10 ${error ? 'text-rose-500' : 'text-white/40 group-hover:text-[#2eaadc]'} transition-colors`} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">{t.accessRestricted}</h2>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">{t.enterPasscode}</p>
            </div>

            <form onSubmit={handleUnlock} className="w-full space-y-6">
              <input 
                autoFocus
                type="password"
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 text-2xl text-center font-black tracking-[1em] text-white focus:outline-none focus:border-[#2eaadc]/50 focus:bg-white/[0.08] transition-all placeholder:text-white/5"
              />
              <button 
                type="submit"
                className="w-full py-6 bg-[#2eaadc] text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all hover:shadow-blue-500/40"
              >
                AUTHORIZE ACCESS
              </button>
            </form>
            
            <div className="pt-4 flex items-center gap-3 opacity-20">
              <ShieldAlert className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Local Encryption Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-item">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-emerald-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Authorized Personnel Only</span>
          </div>
          <h2 className="text-6xl font-black tracking-tight text-white uppercase italic leading-none">{t.privateVault}</h2>
          <p className="text-[12px] text-white/20 font-black tracking-[0.6em] uppercase">Strategic Assets & Sovereign Capital</p>
        </div>

        <button 
          onClick={() => { setIsUnlocked(false); setPasscode(''); }}
          className="px-10 py-5 bg-white/5 text-white/40 rounded-[24px] font-black uppercase tracking-widest text-[11px] hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-4"
        >
          <Key className="w-4 h-4" /> LOCK TERMINAL
        </button>
      </header>

      {/* Financial Protocol Section */}
      <section className="reveal-item delay-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 p-12 bg-gradient-to-br from-[#121212] to-[#080808] border border-white/5 rounded-[56px] shadow-2xl space-y-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5">
              <Wallet className="w-40 h-40 text-emerald-500" />
           </div>
           
           <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-3">
                 <DollarSign className="w-3.5 h-3.5" /> {t.financialProtocol}
              </span>
              <div className="flex items-center justify-between">
                <h3 className="text-5xl font-black text-white tracking-tighter tabular-nums">
                   {showValues ? `$${netBalance.toLocaleString()}` : '••••••••'}
                </h3>
                <button 
                  onClick={() => setShowValues(!showValues)}
                  className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/20 hover:text-white"
                >
                  {showValues ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              <p className="text-[10px] font-black uppercase text-white/20 tracking-widest pt-2">Current Sovereign Liquidity</p>
           </div>

           <div className="space-y-4 relative z-10">
              <button 
                onClick={() => {
                  const desc = prompt("Transaction Description:");
                  const amt = prompt("Amount:");
                  if (desc && amt) onAddLog({ 
                    description: desc, 
                    amount: parseFloat(amt), 
                    type: 'Credit', 
                    date: new Date().toISOString() 
                  });
                }}
                className="w-full py-5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600/20 transition-all flex items-center justify-center gap-4"
              >
                <Plus className="w-4 h-4" /> Log Liquid Inflow
              </button>
              <button 
                onClick={() => {
                  const desc = prompt("Expense Description:");
                  const amt = prompt("Amount:");
                  if (desc && amt) onAddLog({ 
                    description: desc, 
                    amount: parseFloat(amt), 
                    type: 'Debit', 
                    date: new Date().toISOString() 
                  });
                }}
                className="w-full py-5 bg-white/5 border border-white/5 text-white/20 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all flex items-center justify-center gap-4"
              >
                <TrendingUp className="w-4 h-4 rotate-180" /> Log Operational Expense
              </button>
           </div>
        </div>

        <div className="lg:col-span-8 p-12 bg-[#0D0D0D] border border-white/5 rounded-[56px] shadow-2xl space-y-10">
           <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/20">Sovereign Transaction Log</h3>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-4 py-2 bg-emerald-500/10 rounded-full">{logs.length} Operations</span>
           </div>
           
           <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
              {logs.length === 0 ? (
                <div className="py-20 text-center opacity-10">
                   <p className="text-[12px] font-black uppercase tracking-widest italic">Awaiting Financial Synchronization</p>
                </div>
              ) : (
                logs.slice().reverse().map(log => (
                  <div key={log.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.05] transition-all">
                     <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${log.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                           {log.type === 'Credit' ? <Plus className="w-6 h-6" /> : <TrendingUp className="w-6 h-6 rotate-180" />}
                        </div>
                        <div>
                           <p className="text-[15px] font-black text-white/90 uppercase tracking-tight">{log.description}</p>
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <span className={`text-lg font-black tabular-nums ${log.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {log.type === 'Credit' ? '+' : '-'}${log.amount.toLocaleString()}
                        </span>
                        <button 
                          onClick={() => onDeleteLog(log.id)}
                          className="opacity-0 group-hover:opacity-100 p-3 text-white/10 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </section>

      {/* Strategic Intelligence Section */}
      <section className="reveal-item delay-2 grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="p-16 bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-white/5 rounded-[64px] shadow-3xl space-y-12">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{t.strategicIntel}</h3>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Confidential Business Blueprints</p>
              </div>
              <button 
                onClick={() => {
                  const title = prompt("Intel Title:");
                  const content = prompt("Content:");
                  if (title && content) onAddIntel({ title, content, category: 'Strategy' });
                }}
                className="p-5 bg-[#2eaadc] text-white rounded-3xl shadow-xl shadow-blue-500/20 hover:scale-110 active:scale-90 transition-all"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            <div className="space-y-6">
               {intel.filter(i => i.category === 'Strategy').length === 0 ? (
                 <div className="p-20 border border-dashed border-white/5 rounded-[48px] text-center opacity-10">
                    <FileText className="w-16 h-16 mx-auto mb-6" />
                    <p className="text-[11px] font-black uppercase tracking-widest">Awaiting Strategic Protocol Deposition</p>
                 </div>
               ) : (
                 intel.filter(i => i.category === 'Strategy').map(item => (
                   <div key={item.id} className="p-10 bg-white/[0.02] border border-white/5 rounded-[48px] space-y-6 group hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-[#2eaadc] shadow-[0_0_10px_#2eaadc] animate-pulse" />
                            <h4 className="text-xl font-black text-white/90 uppercase italic">{item.title}</h4>
                         </div>
                         <button onClick={() => onDeleteIntel(item.id)} className="opacity-0 group-hover:opacity-100 p-3 text-white/10 hover:text-rose-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                      <p className="text-[14px] text-white/40 leading-relaxed font-medium line-clamp-4 italic">
                        "{item.content}"
                      </p>
                      <div className="pt-4 flex items-center justify-between">
                         <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Last Modified: {new Date(item.updatedAt).toLocaleDateString()}</span>
                         <button className="text-[10px] font-black text-[#2eaadc] uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                            Full Briefing <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         <div className="p-16 bg-[#0D0D0D] border border-white/5 rounded-[64px] shadow-3xl space-y-12">
            <div className="flex items-center justify-between">
               <div className="space-y-2">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{t.highValueNetwork}</h3>
                 <p className="text-[10px] text-emerald-500/40 font-black uppercase tracking-[0.4em]">Proprietary Connection Matrix</p>
               </div>
               <button 
                onClick={() => {
                  const title = prompt("Contact Name/Entity:");
                  const content = prompt("Intelligence / Context:");
                  if (title && content) onAddIntel({ title, content, category: 'Network' });
                }}
                className="p-5 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-90 transition-all"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
               {intel.filter(i => i.category === 'Network').length === 0 ? (
                 <div className="p-20 border border-dashed border-white/5 rounded-[48px] text-center opacity-10">
                    <Users className="w-16 h-16 mx-auto mb-6" />
                    <p className="text-[11px] font-black uppercase tracking-widest">Network Database Offline</p>
                 </div>
               ) : (
                 intel.filter(i => i.category === 'Network').map(contact => (
                   <div key={contact.id} className="flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[40px] group hover:bg-[#2eaadc]/5 hover:border-[#2eaadc]/20 transition-all">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 rounded-[24px] bg-black/60 flex items-center justify-center border border-white/10 group-hover:border-[#2eaadc]/40 transition-all">
                            <Users className="w-8 h-8 text-white/20 group-hover:text-[#2eaadc]" />
                         </div>
                         <div>
                            <p className="text-lg font-black text-white/90 uppercase italic">{contact.title}</p>
                            <p className="text-[11px] font-medium text-white/30 italic max-w-xs truncate">{contact.content}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <button className="p-4 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 hover:text-white transition-all"><Zap className="w-5 h-5" /></button>
                         <button onClick={() => onDeleteIntel(contact.id)} className="p-4 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                   </div>
                 ))
               )}
            </div>
            
            <div className="mt-12 p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[48px] flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                     <ShieldCheck className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                     <p className="text-[14px] font-black text-white uppercase">Privacy Protocol Verified</p>
                     <p className="text-[10px] text-emerald-500/40 font-black uppercase tracking-widest">No External Metadata Bleed</p>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default SecureVault;