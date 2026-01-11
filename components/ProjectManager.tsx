import React, { useState, useRef } from 'react';
import { DesignProject, Language, Task } from '../types';
import { 
  Plus, ExternalLink, Trash2, Clock, 
  Link as LinkIcon, Search, User, 
  Image as ImageIcon, Upload, X, 
  Eye, Monitor, Youtube, Instagram,
  FileText, CheckCircle2, ChevronRight, 
  MoreHorizontal, Zap, Briefcase, 
  Target, Shield, Layers
} from 'lucide-react';
import { audio } from '../services/audioService';
import { translations } from '../translations';

interface ProjectManagerProps {
  projects: DesignProject[];
  tasks: Task[];
  language: Language;
  onAddProject: (p: Omit<DesignProject, 'id'>) => void;
  onUpdateProject: (id: string, updates: Partial<DesignProject>) => void;
  onDeleteProject: (id: string) => void;
}

const MISSION_CATEGORIES = [
  'Social Media Protocol',
  'Visual Production',
  'Asset Optimization',
  'Strategic Campaign'
] as const;

const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  projects, tasks, language, 
  onAddProject, onUpdateProject, onDeleteProject 
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newProject, setNewProject] = useState<Omit<DesignProject, 'id'>>({
    clientName: '',
    projectName: '',
    projectType: 'Visual Production',
    status: 'In Progress',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    notes: '',
    links: [],
    progress: 0,
    imageUrl: ''
  });

  const t = translations[language];

  const filteredProjects = projects.filter(p => 
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject(prev => ({ ...prev, imageUrl: reader.result as string }));
        audio.playPop();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playSuccess();
    onAddProject(newProject);
    setIsAddModalOpen(false);
    setNewProject({
      clientName: '',
      projectName: '',
      projectType: 'Visual Production',
      status: 'In Progress',
      deadline: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      notes: '',
      links: [],
      progress: 0,
      imageUrl: ''
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
      case 'Under Review': return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-400';
      case 'Medium': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Social')) return <Instagram className="w-4 h-4" />;
    if (type.includes('Production')) return <Youtube className="w-4 h-4" />;
    if (type.includes('Optimization')) return <Layers className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32">
      {/* Header with improved typography */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-item">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-[#2eaadc]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#2eaadc]">Operational Workflow</span>
          </div>
          <h2 className="text-6xl font-black tracking-tight text-white uppercase italic leading-none">Command Center</h2>
          <p className="text-[12px] text-white/30 font-black tracking-[0.6em] uppercase">Active Deployments & Client Intelligence</p>
        </div>
        
        <div className="flex flex-wrap gap-5">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#2eaadc] transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH ASSETS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pro-input pl-14 w-80 placeholder:text-white/10"
            />
          </div>
          <button 
            onClick={() => { audio.playPop(); setIsAddModalOpen(true); }}
            className="px-10 py-5 bg-[#2eaadc] text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
          >
            <Plus className="w-4 h-4" /> Initialize Deployment
          </button>
        </div>
      </header>

      {/* Projects Grid with staggered reveal */}
      {filteredProjects.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-8 opacity-20 reveal-item delay-2">
          <div className="w-32 h-32 bg-white/[0.01] rounded-full flex items-center justify-center border border-white/5 ring-4 ring-white/[0.01]">
            <Briefcase className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <p className="text-[16px] font-black uppercase tracking-[0.8em]">Operational Void</p>
            <p className="text-[10px] uppercase tracking-widest text-white/40 italic">Awaiting new mission objectives</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProjects.map((project, idx) => {
            const projectTasks = tasks.filter(tk => tk.linkedProjectId === project.id);
            const completedCount = projectTasks.filter(tk => tk.isCompleted).length;
            const taskProgress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : project.progress;

            return (
              <div 
                key={project.id} 
                onClick={() => { audio.playClick(); setSelectedProject(project); }}
                className={`reveal-item delay-${(idx % 5) + 1} glass-panel overflow-hidden group relative cursor-pointer hover:border-[#2eaadc]/40 transition-all hover:translate-y-[-8px] shadow-2xl`}
              >
                {project.imageUrl && (
                  <div className="w-full h-64 overflow-hidden relative">
                    <img src={project.imageUrl} alt={project.projectName} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-8 left-8 flex items-center gap-4">
                        <div className="p-4 bg-black/60 backdrop-blur-2xl rounded-2xl text-white shadow-3xl ring-1 ring-white/10 group-hover:bg-[#2eaadc] group-hover:text-white transition-all">
                          {getTypeIcon(project.projectType)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Category</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{project.projectType}</p>
                        </div>
                    </div>
                  </div>
                )}
                
                <div className="p-10 space-y-10">
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all z-20 translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); audio.playPop(); onDeleteProject(project.id); }} 
                      className="p-4 bg-black/60 backdrop-blur-2xl rounded-2xl text-white/40 hover:text-rose-500 transition-all active:scale-90 border border-white/5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)}`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-[#2eaadc] transition-colors">{project.projectName}</h3>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-white/20 uppercase tracking-widest">
                        <Shield className="w-3.5 h-3.5" /> {project.clientName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Execution Velocity</span>
                      <span className="text-xs font-black text-[#2eaadc]">{taskProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.02] rounded-full overflow-hidden p-[2px] border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2eaadc] to-[#1e7aa0] transition-all duration-1000 shadow-[0_0_20px_rgba(46,170,220,0.4)] rounded-full" 
                        style={{ width: `${taskProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-4 px-5 py-3 bg-white/[0.02] rounded-2xl border border-white/5 group-hover:border-[#2eaadc]/20 transition-all">
                      <Clock className="w-4 h-4 text-[#2eaadc]/40" />
                      <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <button className="p-4 bg-white/[0.02] rounded-2xl text-white/20 group-hover:text-[#2eaadc] group-hover:bg-[#2eaadc]/10 border border-white/5 transition-all">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: INITIALIZE MISSION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
          <div className="bg-[#121212] border border-white/10 w-full max-w-2xl rounded-[56px] overflow-hidden my-auto shadow-2xl relative">
             <div className="p-12 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic">Initialize Mission</h3>
                  <p className="text-[10px] text-[#2eaadc] font-black uppercase tracking-[0.4em]">Operational Asset Registration</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all hover:rotate-90 active:scale-90"><X className="w-7 h-7 opacity-40" /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-12 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Client Entity</label>
                    <input required type="text" value={newProject.clientName} onChange={e => setNewProject({...newProject, clientName: e.target.value})} className="pro-input w-full" placeholder="LEAD ENTITY NAME" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Mission Objective</label>
                    <input required type="text" value={newProject.projectName} onChange={e => setNewProject({...newProject, projectName: e.target.value})} className="pro-input w-full" placeholder="PROTOCOL NAME" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Asset Category</label>
                    <select value={newProject.projectType} onChange={e => setNewProject({...newProject, projectType: e.target.value})} className="pro-input w-full appearance-none cursor-pointer">
                      {MISSION_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Target Completion</label>
                    <input type="date" value={newProject.deadline} onChange={e => setNewProject({...newProject, deadline: e.target.value})} className="pro-input w-full appearance-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Execution Status</label>
                    <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as any})} className="pro-input w-full appearance-none cursor-pointer">
                      <option value="In Progress">ACTIVE DEPLOYMENT</option>
                      <option value="Under Review">PROTOCOL EVALUATION</option>
                      <option value="Completed">MISSION ACCOMPLISHED</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Priority Protocol</label>
                    <div className="flex gap-4">
                      {['Low', 'Medium', 'High'].map(pr => (
                        <button 
                          key={pr} 
                          type="button"
                          onClick={() => { audio.playClick(); setNewProject({...newProject, priority: pr as any}); }}
                          className={`flex-1 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border ${newProject.priority === pr ? 'bg-[#2eaadc] border-[#2eaadc] text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'}`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Asset Visualization</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-52 bg-[#1A1A1A] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all group overflow-hidden relative shadow-inner"
                  >
                    {newProject.imageUrl ? (
                      <div className="w-full h-full relative">
                        <img src={newProject.imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                          <Upload className="w-10 h-10 text-white mb-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Replace Master Frame</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-6 bg-white/[0.02] rounded-full mb-4 group-hover:scale-110 group-hover:bg-[#2eaadc]/10 transition-all border border-white/5">
                          <Upload className="w-8 h-8 text-white/20 group-hover:text-[#2eaadc] transition-colors" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white/60 transition-colors text-center">Select Operational Preview</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-1">Strategic Briefing</label>
                  <textarea value={newProject.notes} onChange={e => setNewProject({...newProject, notes: e.target.value})} placeholder="INTEL SUMMARY..." className="pro-input w-full h-32 resize-none" />
                </div>

                <button type="submit" className="w-full py-8 bg-[#2eaadc] text-white rounded-[40px] font-black text-sm uppercase tracking-[0.5em] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all hover:shadow-blue-500/50 hover:scale-[1.01]">AUTHORIZE DEPLOYMENT</button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL: PROJECT INTEL VIEW */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in zoom-in-95 duration-500 overflow-y-auto custom-scrollbar">
          <div className="bg-[#0F0F0F] border border-white/10 w-full max-w-7xl rounded-[80px] overflow-hidden my-auto shadow-3xl relative ring-1 ring-white/5">
             <button 
               onClick={() => setSelectedProject(null)} 
               className="absolute top-14 right-14 z-50 p-6 bg-black/60 backdrop-blur-3xl rounded-[32px] text-white/40 hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-90 border border-white/10"
             >
               <X className="w-8 h-8" />
             </button>

             <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh]">
                {/* Visual Area */}
                <div className="lg:col-span-7 bg-[#080808] flex flex-col relative overflow-hidden group/visual">
                   {selectedProject.imageUrl ? (
                     <div className="w-full h-full flex items-center justify-center p-20 lg:p-32">
                        <div className="relative">
                          <img 
                            src={selectedProject.imageUrl} 
                            className="max-w-full max-h-[75vh] rounded-[64px] shadow-[0_80px_160px_rgba(0,0,0,1)] object-contain bg-[#111] ring-1 ring-white/10 transition-all duration-1000 group-hover/visual:scale-[1.02]" 
                            alt="Operational Frame" 
                          />
                          <div className="absolute -bottom-12 -right-12 p-8 bg-[#2eaadc] rounded-[48px] shadow-4xl animate-bounce">
                             <ImageIcon className="w-12 h-12 text-white" />
                          </div>
                        </div>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 opacity-10">
                        <div className="p-16 border-2 border-dashed border-white/20 rounded-full">
                           <Monitor className="w-48 h-48" />
                        </div>
                        <p className="text-[18px] font-black uppercase tracking-[1.5em]">System Void</p>
                     </div>
                   )}
                   <div className="absolute bottom-16 left-16 p-10 bg-black/40 backdrop-blur-3xl rounded-[48px] border border-white/10 max-w-md shadow-3xl">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-[#2eaadc]/20 rounded-3xl flex items-center justify-center border border-[#2eaadc]/30">
                            <Zap className="w-8 h-8 text-[#2eaadc]" />
                         </div>
                         <div>
                            <p className="text-[12px] font-black text-[#2eaadc] uppercase tracking-[0.4em]">Protocol Sync</p>
                            <p className="text-sm font-bold text-white/50">ID-{selectedProject.id.toUpperCase().slice(-12)}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Intelligence Area */}
                <div className="lg:col-span-5 p-20 lg:p-24 space-y-16 bg-[#0D0D0D] border-l border-white/10 overflow-y-auto custom-scrollbar h-full">
                   <div className="space-y-10">
                      <div className="flex flex-wrap items-center gap-6">
                         <span className={`px-7 py-3 rounded-[24px] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl ring-1 ring-white/10 ${getStatusStyle(selectedProject.status)}`}>
                            {selectedProject.status}
                         </span>
                         <span className="text-[11px] font-black text-[#2eaadc] uppercase tracking-widest flex items-center gap-4 px-7 py-3 bg-[#2eaadc]/10 rounded-[24px] ring-1 ring-[#2eaadc]/30">
                            {getTypeIcon(selectedProject.projectType)} {selectedProject.projectType}
                         </span>
                      </div>
                      <div className="space-y-6">
                        <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-[0.8] italic">{selectedProject.projectName}</h2>
                        <div className="flex items-center gap-6 text-white/30 border-b border-white/5 pb-12">
                           <div className="p-3 bg-white/5 rounded-2xl"><User className="w-6 h-6" /></div>
                           <span className="text-xl font-black uppercase tracking-[0.3em]">{selectedProject.clientName}</span>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-5">
                         <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] flex items-center gap-4"><Zap className="w-5 h-5 text-emerald-500" /> Priority Level</span>
                         <div className={`text-xl font-black uppercase tracking-widest ${getPriorityColor(selectedProject.priority)}`}>{selectedProject.priority} Mission</div>
                      </div>
                      <div className="space-y-5">
                         <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] flex items-center gap-4"><Clock className="w-5 h-5 text-[#2eaadc]" /> Timeline</span>
                         <div className="text-xl font-black text-white uppercase tracking-widest leading-none">{new Date(selectedProject.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                   </div>

                   {/* Linked Protocols */}
                   <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-black text-[#2eaadc] uppercase tracking-[0.6em]">Execution Protocols</h4>
                        <span className="px-5 py-1.5 bg-white/[0.03] rounded-full text-[10px] font-black text-white/20 uppercase tracking-widest">{tasks.filter(t => t.linkedProjectId === selectedProject.id).length} ACTIVE</span>
                      </div>
                      <div className="space-y-5">
                         {tasks.filter(t => t.linkedProjectId === selectedProject.id).length > 0 ? (
                           tasks.filter(t => t.linkedProjectId === selectedProject.id).map(task => (
                             <div key={task.id} className="flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[40px] group hover:bg-white/[0.05] transition-all hover:scale-[1.03] shadow-lg">
                                <div className="flex items-center gap-6">
                                   <div className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all ${task.isCompleted ? 'bg-emerald-500/20 text-emerald-500 shadow-2xl shadow-emerald-500/20' : 'bg-white/5 text-white/20 ring-1 ring-white/10'}`}>
                                      {task.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <MoreHorizontal className="w-6 h-6" />}
                                   </div>
                                   <span className={`text-[17px] font-bold ${task.isCompleted ? 'text-white/20 line-through' : 'text-white/90'}`}>{task.title}</span>
                                </div>
                                <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-[#2eaadc] group-hover:translate-x-2 transition-all" />
                             </div>
                           ))
                         ) : (
                           <div className="p-16 border border-dashed border-white/10 rounded-[56px] text-center opacity-10">
                              <p className="text-[13px] font-black uppercase tracking-widest">Awaiting Objectives</p>
                           </div>
                         )}
                      </div>
                   </div>

                   {/* Strategic Briefing */}
                   <div className="space-y-8">
                      <h4 className="text-[13px] font-black text-white/20 uppercase tracking-[0.6em]">Strategic Briefing</h4>
                      <div className="relative">
                         <p className="text-[18px] text-white/50 leading-relaxed font-medium italic bg-white/[0.02] p-10 rounded-[48px] border border-white/5 shadow-inner">
                           {selectedProject.notes || "No operational intelligence registered for this mission."}
                         </p>
                         <div className="absolute top-0 right-10 -translate-y-1/2 p-4 bg-[#141414] rounded-3xl border border-white/5 shadow-2xl">
                            <FileText className="w-6 h-6 text-white/20" />
                         </div>
                      </div>
                   </div>

                   {/* Asset Vault */}
                   <div className="space-y-10 pt-10">
                      <h4 className="text-[13px] font-black text-[#2eaadc] uppercase tracking-[0.6em] flex items-center gap-5">
                        <LinkIcon className="w-6 h-6" /> Secured Asset Vault ({selectedProject.links.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                         {selectedProject.links.length > 0 ? selectedProject.links.map((link, idx) => (
                           <a 
                             key={idx} 
                             href={link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center justify-between p-8 bg-white/[0.03] border border-white/5 rounded-[48px] hover:bg-white/[0.08] hover:border-[#2eaadc]/50 transition-all group shadow-3xl"
                           >
                             <div className="flex items-center gap-8 min-w-0">
                                <div className="p-6 bg-black/60 rounded-[32px] text-white/20 group-hover:text-[#2eaadc] group-hover:scale-110 transition-all ring-1 ring-white/10 shadow-inner">
                                   <Target className="w-8 h-8" />
                                </div>
                                <div className="truncate pr-6">
                                   <p className="text-[17px] font-black text-white/80 group-hover:text-white truncate uppercase tracking-tight">{link.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</p>
                                   <span className="text-[11px] font-black text-white/10 uppercase tracking-[0.4em] group-hover:text-[#2eaadc]/50 transition-colors">ACCESS SECURE ENDPOINT</span>
                                </div>
                             </div>
                             <div className="p-5 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0 border border-white/5">
                                <ExternalLink className="w-6 h-6 text-[#2eaadc]" />
                             </div>
                           </a>
                         )) : (
                           <div className="p-20 border border-dashed border-white/10 rounded-[64px] text-center space-y-8 opacity-10">
                              <LinkIcon className="w-16 h-16 mx-auto" />
                              <p className="text-[13px] font-black uppercase tracking-widest">Awaiting Synchronization</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;