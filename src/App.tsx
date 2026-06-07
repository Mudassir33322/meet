import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, Users, FileLock2, Award, PieChart, Sparkles, Building, 
  HelpCircle, ShieldAlert, BadgeInfo, Settings as SettingsIcon, Globe, 
  Coins, CalendarCheck, UserCheck, Languages, Cpu, Layers, Radio, Play, ChevronRight, CheckCircle2, FileText
} from 'lucide-react';
import { Session, Report, Settings } from './types';
import VoiceSandbox from './components/VoiceSandbox';
import LeadDetails from './components/LeadDetails';
import ServiceSettings from './components/ServiceSettings';

export default function App() {
  const [activeRole, setActiveRole] = useState<'client' | 'agent' | 'admin'>('client');
  const [activeTab, setActiveTab] = useState<'sandbox' | 'leads' | 'settings'>('sandbox');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  
  // Custom states for custom user attributes inside client layout
  const [clientTuningLanguage, setClientTuningLanguage] = useState('en-US');
  const [clientTuningVoice, setClientTuningVoice] = useState<'female' | 'male'>('female');

  // Back-end data states
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeCallsCount: 0,
    qualifiedLeads: 0,
    meetingsBooked: 0,
    totalBudgetEst: 0
  });

  // Fetch initial analytical data
  const fetchData = async () => {
    try {
      // 1. Fetch Reports
      const reportsRes = await fetch('/api/reports');
      const reportsData = await reportsRes.json();
      setReports(reportsData);

      // 2. Fetch Settings
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData);

      // 3. Fetch Overview Stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      
      // Calculate total budget estimates from reports
      const totalBudgetSum = reportsData.reduce((acc: number, r: Report) => {
        const budgetStr = String(r.budget || '$0').replace(/[^0-9]/g, '');
        const num = Number(budgetStr);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);

      setStats({
        totalLeads: reportsData.length,
        activeCallsCount: statsData.activeCallsCount || 0,
        qualifiedLeads: reportsData.filter((r: Report) => r.leadScore >= 75).length,
        meetingsBooked: reportsData.filter((r: Report) => !!r.meetingDate).length,
        totalBudgetEst: totalBudgetSum
      });
    } catch (err) {
      console.error('Error fetching dashboard states:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle settings update
  const handleUpdateSettings = async (newSettings: Settings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update Settings metrics:', err);
    }
  };

  // Callback once voice call session is finalized and reports compiled
  const handleSessionComplete = () => {
    fetchData();
    // Auto transition to Leads pipeline tab and change active role to admin so they check their report
    setActiveRole('admin');
    setActiveTab('leads');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
      
      {/* 1. LEFT SIDE STATS & SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-white sticky top-0 md:h-screen overflow-y-auto z-40 shrink-0 flex flex-col justify-between p-5 md:p-6 print:hidden shadow-xs">
        
        <div className="space-y-6">
          {/* Glowing Brand Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-150">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-widest text-cyan-600 font-bold block leading-none uppercase">PIXGENIX ECOSYSTEM</span>
              <h1 className="text-sm font-medium text-slate-900 tracking-tight mt-0.5">
                Pixgenix Agent
              </h1>
            </div>
          </div>

          {/* THREE-ROLE SWITCH PANEL */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              SYSTEM ROLES CONTROLLER
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setActiveRole('client');
                  setActiveTab('sandbox');
                }}
                className={`py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer text-center ${
                  activeRole === 'client'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                CLIENT
              </button>
              <button
                onClick={() => {
                  setActiveRole('agent');
                  setActiveTab('sandbox');
                }}
                className={`py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer text-center ${
                  activeRole === 'agent'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AGENT
              </button>
              <button
                onClick={() => {
                  setActiveRole('admin');
                  setActiveTab('leads');
                }}
                className={`py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer text-center ${
                  activeRole === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ADMIN
              </button>
            </div>
          </div>

          {/* ACTIVE ROLE DESCRIPTIVE PANEL */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            {activeRole === 'client' && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-600 font-medium">
                  <UserCheck className="w-4 h-4" />
                  <span>Client Onboarding Desk</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Fill in your company details and start a conversation with our smart AI Closer, Pixgenix Agent. Choose voice profiles below!
                </p>
                {/* Micro tuning features */}
                <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2.5 border-t border-slate-150">
                  <div>
                    <span className="text-[9px] font-mono text-slate-450 block uppercase">Voice dialect</span>
                    <select 
                      value={clientTuningLanguage} 
                      onChange={(e) => setClientTuningLanguage(e.target.value)}
                      className="bg-white border border-slate-250 text-[10px] rounded px-1.5 py-0.5 mt-0.5 text-slate-700 w-full focus:outline-none"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="ur-PK">Urdu/Hindi (Auto)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="ar-AE">Arabic</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-450 block uppercase">Persona</span>
                    <select 
                      value={clientTuningVoice} 
                      onChange={(e) => setClientTuningVoice(e.target.value)}
                      className="bg-white border border-slate-250 text-[10px] rounded px-1.5 py-0.5 mt-0.5 text-slate-700 w-full focus:outline-none"
                    >
                      <option value="female">Sania (Female)</option>
                      <option value="male">Zubair (Male)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'agent' && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                  <Cpu className="w-4 h-4" />
                  <span>Pixgenix Agent Core Settings</span>
                </div>
                <p className="text-slate-550 text-[11px] leading-relaxed">
                  Agent automated cognitive systems. Fully hands-free operation toggles active micro-microphone polling when Pixgenix Agent stops speaking.
                </p>
                <div className="mt-2.5 pt-2 block text-[10px] font-mono space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Speech Engines:</span>
                    <span className="text-indigo-650 bg-indigo-50 px-1 py-0.2 rounded font-bold">Standard STT/TTS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urdu Parser:</span>
                    <span className="text-emerald-600 font-bold">Bilingual Auto</span>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'admin' && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Layers className="w-4 h-4" />
                  <span>C-Suite Lead Monitor</span>
                </div>
                <p className="text-slate-550 text-[11px] leading-relaxed">
                  Full administrative review. Unlock compiled corporate briefs, estimated budgets, and configure baseline metrics.
                </p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-2 justify-center">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>REAL-TIME PIPELINE STREAM</span>
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC NAVIGATION LINKS FILTERED BY ROLE */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-2">
              NAVIGATION CHANNELS
            </span>

            {activeRole === 'client' && (
              <>
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    activeTab === 'sandbox' 
                      ? 'bg-cyan-50 border border-cyan-150 text-cyan-700' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4" />
                    Interactive Client Call
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
                <button
                  onClick={() => {
                    setActiveRole('admin');
                    setActiveTab('leads');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    My Solution PDF Dossier
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </>
            )}

            {activeRole === 'agent' && (
              <>
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    activeTab === 'sandbox' 
                      ? 'bg-indigo-50 border border-indigo-150 text-indigo-700' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Monitor Conversation Dialogue
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    activeTab === 'settings' 
                      ? 'bg-indigo-50 border border-indigo-150 text-indigo-700' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Configure Prompt Directives
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </>
            )}

            {activeRole === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    activeTab === 'leads' 
                      ? 'bg-emerald-50 border border-emerald-150 text-emerald-700' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Lead Qualification Dossiers
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    activeTab === 'settings' 
                      ? 'bg-emerald-50 border border-emerald-150 text-emerald-700' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Ecosystem Matrix Setup
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Real-time System Metrics Indicator inside Sidebar */}
        <div className="pt-4 mt-6 border-t border-slate-150 text-[10px] font-mono text-slate-500 space-y-1 w-full shrink-0">
          <div className="flex items-center justify-between">
            <span>Server status:</span>
            <span className="text-emerald-600 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Socket Live
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active VoIP channels:</span>
            <span className="text-slate-600 font-bold">{stats.activeCallsCount || 1} Channels</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Node Ingress Tunnel:</span>
            <span className="text-cyan-600 font-bold">Port 3000</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN SYSTEM DECK CONTROLS (RIGHT HAND CONTENT) */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header Information Hub */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md p-4 md:px-8 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-600 font-bold uppercase">
                {activeRole === 'admin' ? 'CORPORATE PLATFORM DECKS' : activeRole === 'agent' ? 'AI COGNITIVE MONITOR' : 'ONBOARDING CALL PORTAL'}
              </span>
            </div>
            <h2 className="text-base font-sans font-medium text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              {activeRole === 'client' && 'Pixgenix Client Discovery Sandbox'}
              {activeRole === 'agent' && 'Pixgenix Agent Dialogue Processing'}
              {activeRole === 'admin' && 'Enterprise Qualification Console'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">Live Workspace Status:</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-cyan-600 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></span>
              Synchronized Stack v6.2
            </span>
          </div>
        </header>

        {/* Outer Container Wrapper */}
        <main className="flex-grow p-4 md:p-8 space-y-8 overflow-y-auto">
          
          {/* Active Admin statistics panels */}
          {activeRole === 'admin' && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden animate-fadeIn">
              
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
                <div className="w-11 h-11 rounded-full bg-cyan-50/70 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">TOTAL DISCOVERED LEADS</span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight mt-0.5">{stats.totalLeads}</h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
                <div className="w-11 h-11 rounded-full bg-rose-50/70 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">QUALIFIED TARGET DEALS</span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight mt-0.5">{stats.qualifiedLeads}</h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
                <div className="w-11 h-11 rounded-full bg-emerald-50/70 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                  <Coins className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">EXTRACTED PIPELINE VALUE</span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight mt-0.5">
                    ${stats.totalBudgetEst.toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
                <div className="w-11 h-11 rounded-full bg-indigo-50/70 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  <CalendarCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">MEETINGS BOOKED SECURED</span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight mt-0.5">{stats.meetingsBooked}</h3>
                </div>
              </div>

            </section>
          )}

          {/* Tab content Router Switch layout */}
          <section className="min-h-[500px]">
            {activeTab === 'sandbox' && (
              <VoiceSandbox
                onSessionComplete={handleSessionComplete}
                activeSession={activeSession}
                setActiveSession={setActiveSession}
                selectedLanguage={clientTuningLanguage}
                setSelectedLanguage={setClientTuningLanguage}
                selectedVoice={clientTuningVoice}
                setSelectedVoice={setClientTuningVoice}
              />
            )}

            {activeTab === 'leads' && (
              <LeadDetails
                reports={reports}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'settings' && settings && (
              <ServiceSettings
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </section>

        </main>

        {/* Minimal professional Footer Credits */}
        <footer className="border-t border-slate-200 bg-white/50 py-4 shrink-0 print:hidden text-center text-[10px] font-mono text-slate-500">
          Pixgenix Core Systems Onboarding Pipeline © 2026. Custom client qualification pipeline with auto closes.
        </footer>
      </div>
    </div>
  );
}
