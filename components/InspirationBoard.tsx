import React, { useState, useRef, useEffect } from 'react';
import { InspirationItem, InspirationType, Language } from '../types';
import { 
  Plus, X, Upload, Palette, Type, Link as LinkIcon, 
  Trash2, Search, Hash, ExternalLink,
  ImageIcon, Sparkles, Copy, LayoutGrid, Check,
  Zap, MoreVertical, Bookmark, ZapOff, 
  CornerUpRight, Command, Maximize2
} from 'lucide-react';
import { audio } from '../services/audioService';
import { translations } from '../translations';

interface InspirationBoardProps {
  items: InspirationItem[];
  language: Language;
  onAddItem: (item: Omit<InspirationItem, 'id' | 'createdAt'>) => void;
  onDeleteItem: (id: string) => void;
}

const ASSET_DEPARTMENTS = [
  'Logo Architecture',
  'Editorial Design',
  'UI/UX Framework',
  'Brand DNA',
  'Typographic Intel',
  'Strategic General'
];

const InspirationBoard: React.FC<InspirationBoardProps> = ({ items, language, onAddItem, onDeleteItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<InspirationType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState<Omit<InspirationItem, 'id' | 'createdAt'>>({
    type: 'image',
    title: '',
    category: 'Strategic General',
    content: '',
    notes: '',
    tags: []
  });

  const t = translations[language];

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, content: reader.result as string }));
        audio.playPop();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.content) return;
    
    audio.playSuccess();
    onAddItem(newItem);
    setIsModalOpen(false);
    setNewItem({
      type: 'image',
      title: '',
      category: 'Strategic General',
      content: '',
      notes: '',
      tags: []
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    audio.playSuccess();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeColor = (type: InspirationType) => {
    switch (type) {
      case 'image': return '#2eaadc';
      case 'color': return '#10B981';
      case 'font': return '#8B5CF6';
      case 'link': return '#F59E0B';
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-item">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-emerald-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">{t.creativeVault}</span>
          </div>
          <h2 className="text-6xl font-black tracking-tight uppercase text-white italic leading-none">{t.inspiration}</h2>
          <p className="text-[12px] text-white/20 font-black tracking-[0.6em] uppercase">{t.visualIntel}</p>
        </div>
        
        <div className="flex flex-wrap gap-5">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH VAULT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pro-input pl-14 w-80 placeholder:text-white/10"
            />
          </div>
          <button 
            onClick={() => { audio.playPop(); setIsModalOpen(true); }}
            className="px-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
          >
            <Plus className="w-4 h-4" /> Deposit Creative Asset
          </button>
        </div>
      </header>

      {/* Asset Type Filter with animated buttons */}
      <div className="flex flex-wrap items-center justify-between gap-8 p-8 glass-panel shadow-3xl reveal-item delay-1">
        <div className="flex flex-wrap gap-3 p-2 bg-black/20 rounded-[32px] border border-white/5">
          {['all', 'image', 'color', 'font', 'link'].map((t) => (
            <button 
              key={t}
              onClick={() => { audio.playClick(); setFilterType(t as any); }}
              className={`px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/20 hover:text-white/60 hover:bg-white/5'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase text-white/10 tracking-[0.5em]">DEPT</span>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/40 border border-white/5 rounded-2xl px-8 py-4 text-[11px] font-black text-white/60 uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 cursor-pointer min-w-[220px] appearance-none"
          >
            <option value="all">ALL DEPARTMENTS</option>
            {ASSET_DEPARTMENTS.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Grid with specialized cards */}
      {filteredItems.length === 0 ? (
        <div className="py-48 flex flex-col items-center justify-center text-center space-y-10 opacity-20 reveal-item delay-2">
          <div className="p-16 border-2 border-dashed border-white/10 rounded-full animate-pulse">
            <Sparkles className="w-24 h-24 stroke-1" />
          </div>
          <div className="space-y-3">
            <p className="text-[18px] font-black uppercase tracking-[1em]">Vault Locked</p>
            <p className="text-[11px] uppercase tracking-widest text-white/40 italic">Awaiting asset deposition for creative leverage</p>
          </div>
        </div>
      ) : (
        <div className="masonry-grid">
          {filteredItems.map((item, idx) => (
            <div 
              key={item.id}
              className={`masonry-item reveal-item delay-${(idx % 5) + 1} glass-panel overflow-hidden group hover:bg-[#121212] transition-all relative shadow-2xl hover:border-emerald-500/30 hover:shadow-emerald-500/5`}
            >
              {/* Asset Display Logic */}
              {item.type === 'image' && (
                <div className="relative overflow-hidden cursor-zoom-in">
                   <img src={item.content} alt={item.title} className="w-full h-auto object-cover transition-transform duration-[2s] group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-80" />
                   <div className="absolute top-6 right-6 p-4 bg-black/60 backdrop-blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <Maximize2 className="w-5 h-5 text-white/40" />
                   </div>
                </div>
              )}

              {item.type === 'color' && (
                <div 
                  className="w-full h-64 relative group/color cursor-pointer active:scale-95 transition-all" 
                  style={{ backgroundColor: item.content }}
                  onClick={() => handleCopy(item.id, item.content)}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/color:opacity-100 bg-black/40 backdrop-blur-3xl transition-all">
                    <div className="p-5 bg-white/10 rounded-full mb-4 shadow-3xl">
                       {copiedId === item.id ? <Check className="w-8 h-8 text-emerald-400" /> : <Copy className="w-8 h-8 text-white" />}
                    </div>
                    <span className="text-xl font-black text-white tracking-[0.4em] uppercase">{item.content}</span>
                  </div>
                  {/* Pantone Label */}
                  <div className="absolute bottom-6 left-6 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl">
                     <p className="text-[10px] font-black text-black tracking-widest">{item.content.toUpperCase()}</p>
                  </div>
                </div>
              )}

              {item.type === 'font' && (
                <div className="p-16 bg-[#080808] flex flex-col items-center justify-center text-center space-y-8 min-h-[280px] shadow-inner">
                   <span className="text-8xl text-white leading-none tracking-tighter" style={{ fontFamily: item.content }}>Aa</span>
                   <div className="space-y-2">
                      <p className="text-[14px] font-black text-white/80 uppercase tracking-widest">{item.content}</p>
                      <div className="h-px w-12 bg-emerald-500/30 mx-auto"></div>
                      <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.6em]">MASTER TYPOGRAPHIC UNIT</p>
                   </div>
                </div>
              )}

              {item.type === 'link' && (
                <div className="p-16 bg-gradient-to-br from-[#121212] to-[#080808] flex flex-col items-center justify-center space-y-10 min-h-[280px]">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-[40px] flex items-center justify-center text-emerald-500 ring-1 ring-emerald-500/20 shadow-4xl group-hover:scale-110 transition-all">
                    <LinkIcon className="w-12 h-12" />
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02] rounded-full border border-white/5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">SECURE ENDPOINT LIVE</span>
                  </div>
                </div>
              )}

              {/* Meta Intelligence Interface */}
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-white/[0.05] rounded-xl text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: getTypeColor(item.type), border: `1px solid ${getTypeColor(item.type)}30` }}>
                          {item.type}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] font-black text-white/10 uppercase tracking-widest">
                           <Command className="w-3.5 h-3.5" /> {item.category}
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none pt-2 group-hover:text-emerald-400 transition-colors italic">{item.title}</h3>
                   </div>
                   <button 
                     onClick={() => { audio.playPop(); onDeleteItem(item.id); }}
                     className="p-4 bg-white/5 rounded-[24px] opacity-0 group-hover:opacity-100 transition-all text-white/20 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>

                {item.notes && (
                  <div className="relative">
                    <p className="text-[14px] text-white/30 font-medium italic leading-relaxed pl-8 border-l-2 border-emerald-500/20">
                      "{item.notes}"
                    </p>
                  </div>
                )}

                <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                   <div className="flex flex-wrap gap-3">
                     {item.tags.map((tag, i) => (
                       <span key={i} className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/5 px-4 py-1.5 rounded-2xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors cursor-default">#{tag}</span>
                     ))}
                   </div>
                   {item.type === 'link' && (
                     <a href={item.content} target="_blank" rel="noopener noreferrer" className="p-5 bg-emerald-500/10 text-emerald-400 rounded-3xl hover:scale-110 active:scale-90 transition-all shadow-4xl shadow-emerald-500/20 ring-1 ring-emerald-500/40">
                       <CornerUpRight className="w-6 h-6" />
                     </a>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: DEPOSIT ASSET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
          <div className="bg-[#121212] border border-white/10 w-full max-w-xl rounded-[64px] overflow-hidden my-auto shadow-4xl ring-1 ring-white/5">
             <div className="p-12 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white">Deposit Asset</h3>
                  <p className="text-[11px] text-emerald-400/50 font-black uppercase tracking-[0.5em]">Vault Synchronization Required</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all hover:rotate-90 active:scale-90"><X className="w-7 h-7 opacity-40 text-white" /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-12 space-y-12">
                {/* Type Selection */}
                <div className="grid grid-cols-4 gap-4">
                  {(['image', 'color', 'font', 'link'] as InspirationType[]).map((t) => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => { audio.playClick(); setNewItem(prev => ({ ...prev, type: t, content: '' })); }}
                      className={`flex flex-col items-center justify-center py-8 rounded-[32px] border transition-all ${newItem.type === t ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-4xl shadow-emerald-500/10' : 'bg-[#1A1A1A] border-white/5 text-white/20 hover:text-white/40'}`}
                    >
                      {t === 'image' && <ImageIcon className="w-7 h-7 mb-4" />}
                      {t === 'color' && <Palette className="w-7 h-7 mb-4" />}
                      {t === 'font' && <Type className="w-7 h-7 mb-4" />}
                      {t === 'link' && <LinkIcon className="w-7 h-7 mb-4" />}
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                   <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Asset Designation</label>
                   <input 
                     required type="text" 
                     value={newItem.title} 
                     onChange={e => setNewItem({...newItem, title: e.target.value})} 
                     className="pro-input w-full" 
                     placeholder="E.G., CYBERPUNK CORE AESTHETIC..."
                   />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Department</label>
                    <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="pro-input w-full appearance-none cursor-pointer">
                      {ASSET_DEPARTMENTS.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Tags (Enter)</label>
                    <input 
                      type="text" 
                      placeholder="ADD TAGS..." 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setNewItem({...newItem, tags: [...newItem.tags, val]});
                            (e.target as HTMLInputElement).value = '';
                            audio.playPop();
                          }
                        }
                      }} 
                      className="pro-input w-full" 
                    />
                  </div>
                </div>

                {/* Data Input Based on Type */}
                <div className="space-y-4">
                   <label className="text-[11px] font-black uppercase text-emerald-500/40 tracking-widest ml-1">Operational Data</label>
                   
                   {newItem.type === 'image' && (
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full h-48 bg-[#1A1A1A] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all group overflow-hidden relative"
                     >
                       {newItem.content ? (
                         <div className="w-full h-full relative">
                            <img src={newItem.content} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                              <Upload className="w-10 h-10 text-white mb-4" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-white">Replace Asset Frame</span>
                            </div>
                         </div>
                       ) : (
                         <>
                           <Upload className="w-10 h-10 text-white/10 mb-5 group-hover:text-emerald-500 transition-all" />
                           <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white/20 group-hover:text-white/60 transition-colors text-center">Select Master Asset</span>
                         </>
                       )}
                       <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                     </div>
                   )}

                   {newItem.type === 'color' && (
                     <div className="flex gap-8">
                        <div className="w-24 h-24 rounded-[32px] border border-white/10 overflow-hidden relative shadow-4xl ring-1 ring-white/10">
                           <input 
                             type="color" 
                             value={newItem.content || '#10B981'} 
                             onChange={e => setNewItem({...newItem, content: e.target.value})}
                             className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-[3]"
                           />
                        </div>
                        <input 
                          type="text" 
                          value={newItem.content} 
                          onChange={e => setNewItem({...newItem, content: e.target.value})}
                          placeholder="#HEXCODE"
                          className="pro-input flex-1 font-black text-white placeholder:text-white/5 uppercase tracking-[0.2em]"
                        />
                     </div>
                   )}

                   {newItem.type === 'font' && (
                     <input 
                       required type="text" 
                       value={newItem.content} 
                       onChange={e => setNewItem({...newItem, content: e.target.value})}
                       placeholder="FONT FAMILY (E.G., HELVETICA)..."
                       className="pro-input w-full font-black text-white placeholder:text-white/5 uppercase tracking-widest"
                     />
                   )}

                   {newItem.type === 'link' && (
                     <input 
                       required type="url" 
                       value={newItem.content} 
                       onChange={e => setNewItem({...newItem, content: e.target.value})}
                       placeholder="TARGET ENDPOINT (HTTPS://...)"
                       className="pro-input w-full font-bold text-white placeholder:text-white/5 tracking-widest"
                     />
                   )}
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Asset Rationalization</label>
                  <textarea 
                    value={newItem.notes} 
                    onChange={e => setNewItem({...newItem, notes: e.target.value})} 
                    placeholder="WHY DEPOSIT THIS ASSET? HOW WILL IT INFLUENCE FUTURE PROTOCOLS?" 
                    className="pro-input w-full h-32 resize-none" 
                  />
                </div>

                <button type="submit" className="w-full py-9 bg-emerald-600 text-white rounded-[40px] font-black text-sm uppercase tracking-[0.6em] shadow-4xl shadow-emerald-500/30 active:scale-95 transition-all hover:scale-[1.01] hover:shadow-emerald-500/50">AUTHORIZE DEPOSIT</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationBoard;