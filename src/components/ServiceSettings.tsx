import React, { useState, useEffect } from 'react';
import { 
  Building, DollarSign, Clock, FileLock2, RefreshCw, Save, CheckCircle, 
  Plus, Trash2, Award, Laptop, Briefcase, Sparkles 
} from 'lucide-react';
import { Settings, ServiceItem } from '../types';

interface ServiceSettingsProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => Promise<void>;
}

export default function ServiceSettings({ settings: initialSettings, onUpdateSettings }: ServiceSettingsProps) {
  const [companyName, setCompanyName] = useState(initialSettings.companyName || 'Pixgenix');
  const [minimumBudget, setMinimumBudget] = useState(initialSettings.minimumBudget || 500);
  const [workingHours, setWorkingHours] = useState(initialSettings.workingHours || '9:00 AM - 6:00 PM (PKT)');
  const [aiPrompt, setAiPrompt] = useState(initialSettings.aiPrompt || '');
  const [services, setServices] = useState<ServiceItem[]>(initialSettings.services || []);
  
  // Save notification
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setCompanyName(initialSettings.companyName);
      setMinimumBudget(initialSettings.minimumBudget);
      setWorkingHours(initialSettings.workingHours);
      setAiPrompt(initialSettings.aiPrompt);
      setServices(initialSettings.services);
    }
  }, [initialSettings]);

  // Handle service cost edit
  const handleCostChange = (id: string, cost: number) => {
    setServices(services.map(s => s.id === id ? { ...s, estimatedCost: cost } : s));
  };

  // Submit Settings Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdateSettings({
        companyName,
        minimumBudget: Number(minimumBudget),
        workingHours,
        aiPrompt,
        services
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Settings Edit Area */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-sans font-medium text-slate-800 tracking-tight">
              Corporate Onboarding Configurations
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure baseline criteria that Pixgenix Agent will use to evaluate client lead budgets and schedule bookings.
            </p>
          </div>

          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold uppercase">COMPANY NAME</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Minimum Budgets */}
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold uppercase">MINIMUM ACCEPTABLE BUDGET ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="number"
                    value={minimumBudget}
                    onChange={(e) => setMinimumBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-mono shadow-xs"
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold uppercase">BUSINESS OPERATIONAL HOURS</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Pixgenix Agent System Instructions */}
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1.5 flex items-center justify-between font-bold uppercase">
                <span>PIXGENIX AGENT KNOWLEDGE PATTERNS (AI PROMPT PROFILE)</span>
                <span className="text-[10px] text-cyan-600 font-sans font-bold uppercase">Automatic Framework</span>
              </label>
              <textarea
                value={aiPrompt}
                rows={5}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Write specific directives for Pixgenix Agent..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans placeholder-slate-400 shadow-xs"
              />
              <p className="text-[10px] text-slate-500 mt-2 leading-normal">
                Directives written here dynamically augment standard chatbot reasoning, guiding client-closing metrics, language style, and targeted schedule locks.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="border-t border-slate-150 pt-5 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-sans text-emerald-600 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle className="w-4.5 h-4.5" />
                Baseline metrics updated successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium font-mono">
                Sync takes immediate effect on next calling session.
              </span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  Syncing...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-white" />
                  Save Corporate Parameters
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Services Price Table Grid */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-sans font-medium text-slate-800 tracking-tight">
                Services Price Sheets
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Edit baseline prices map used for recommendations.</p>
            </div>
            
            <Laptop className="w-4.5 h-4.5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {services.map((svc) => (
              <div 
                key={svc.id}
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="text-[9px] font-mono uppercase bg-cyan-50 text-cyan-700 border border-cyan-155 px-1.5 py-0.5 rounded font-bold">
                    {svc.category}
                  </span>
                  <div className="text-xs font-bold text-slate-800 pt-1 leading-none">{svc.name}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 italic pt-0.5">{svc.description}</div>
                </div>

                {/* Estimate Cost Input wrapper */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-mono text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={svc.estimatedCost}
                    onChange={(e) => handleCostChange(svc.id, Number(e.target.value))}
                    className="w-16 px-1.5 py-1 bg-white border border-slate-250 rounded-lg text-xs font-mono text-emerald-600 font-bold text-center focus:outline-none"
                    title={`Edit baseline starting cost for ${svc.name}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cyan-50 border border-cyan-150 rounded-xl p-3.5 mt-5 flex gap-2.5 shadow-xs">
            <Sparkles className="w-4.5 h-4.5 text-cyan-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
              When clients mention their target budget limits, Pixgenix Agent intelligently searches these price grids to recommend the design or enterprise software that completely fits their scaling strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
