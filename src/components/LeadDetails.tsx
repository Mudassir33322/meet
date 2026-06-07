import React, { useState } from 'react';
import { 
  FileText, Search, Download, CheckCircle, Calendar, DollarSign, 
  Clock, Award, ChevronRight, Building, Mail, Phone, 
  ArrowLeft, ArrowRight, Printer, RefreshCw, BarChart 
} from 'lucide-react';
import { Report } from '../types';

interface LeadDetailsProps {
  reports: Report[];
  onRefresh: () => void;
}

export default function LeadDetails({ reports, onRefresh }: LeadDetailsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isQualifiedOnly, setIsQualifiedOnly] = useState(false);

  // Filter Reports
  const filteredReports = reports.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      r.clientName.toLowerCase().includes(query) ||
      (r.clientCompany && r.clientCompany.toLowerCase().includes(query)) ||
      r.clientEmail.toLowerCase().includes(query) ||
      r.recommendedService.toLowerCase().includes(query);
    
    const matchesQualified = !isQualifiedOnly || r.leadScore >= 75;

    return matchesSearch && matchesQualified;
  });

  // Handle tailored printing layout
  const handlePrintBrief = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {selectedReport ? (
        /* INDIVIDUAL BEAUTIFULLY STYLED CORPORATE BRIEF SHEET */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 animate-fadeIn">
          {/* Header Action Row */}
          <div className="flex items-center justify-between border-b border-slate-150 pb-6 mb-6 shrink-0 print:hidden">
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO LEADS PIPELINE
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintBrief}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-medium transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                PRINT / SAVE PDF BRIEF
              </button>
            </div>
          </div>

          {/* PRINTABLE CORPORATE DOSSIER / PDF RECEIPT LAYOUT */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-10 text-slate-800 space-y-8 print:bg-white print:text-black print:border-none print:shadow-none font-sans relative shadow-xs">
            
            {/* Elegant watermark decoration for corporate vibe */}
            <div className="absolute top-8 right-8 text-right opacity-10 print:opacity-45 select-none">
              <h1 className="text-3xl font-sans tracking-widest text-slate-600 font-bold">PIXGENIX</h1>
              <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">QUALIFIED DOSSIER REPORT</p>
            </div>

            {/* Document Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 print:border-slate-300">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-700 font-bold uppercase tracking-widest print:text-indigo-600">
                  QUALIFIED LEAD BRIEFING DOSSIER
                </span>
                <h1 className="text-2xl md:text-3xl font-sans font-medium text-slate-900 tracking-tight print:text-slate-950">
                  {selectedReport.clientName}
                </h1>
                <p className="text-xs font-mono text-slate-450">
                  REPORT REF ID: <span className="text-slate-600 print:text-slate-700 font-semibold">#PXG-2026-{selectedReport.id.toUpperCase()}</span>
                </p>
              </div>

              {/* Lead Merit Score Roundel Badge */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4 self-start print:bg-slate-100 print:border-slate-300">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center text-cyan-600 font-mono font-bold text-lg print:border-indigo-600 print:text-indigo-600">
                  {selectedReport.leadScore}%
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase font-semibold">LEAD QUALITY SCORE</span>
                  <span className="text-xs font-sans text-slate-700 font-medium print:text-slate-800">
                    {selectedReport.leadScore >= 75 ? '🔥 HIGHLY QUALIFIED DEAL' : '✓ DISCOVERED PROFILE'}
                  </span>
                </div>
              </div>
            </div>

            {/* PARTITION I: CLIENT CORPORATE DIRECTORY */}
            <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200/80 font-mono text-[11px] font-bold text-cyan-700 uppercase tracking-widest flex items-center justify-between print:bg-slate-100 print:text-indigo-600 print:border-slate-300">
                <span>PARTITION I: CLIENT CORPORATE DIRECTORY</span>
                <span className="text-[9px] text-slate-450">SECURE REGISTER</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-5 bg-white print:grid-cols-4 print:bg-white text-slate-700">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">COMPANY</span>
                  <span className="text-sm font-sans font-semibold text-slate-700 flex items-center gap-1.5 print:text-slate-800">
                    <Building className="w-4 h-4 text-cyan-600 print:text-slate-600" />
                    {selectedReport.clientCompany || 'Self-Employed'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">BUSINESS EMAIL</span>
                  <span className="text-sm font-sans font-semibold text-slate-700 flex items-center gap-1.5 break-all print:text-slate-800">
                    <Mail className="w-4 h-4 text-cyan-600 print:text-slate-600" />
                    {selectedReport.clientEmail}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">CONTACT TELEPHONE</span>
                  <span className="text-sm font-sans font-semibold text-slate-700 flex items-center gap-1.5 print:text-slate-800">
                    <Phone className="w-4 h-4 text-cyan-600 print:text-slate-600" />
                    {selectedReport.clientPhone || 'Not Specified'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">ONBOARDING RECORDED</span>
                  <span className="text-sm font-sans font-semibold text-slate-700 flex items-center gap-1.5 print:text-slate-800">
                    <Clock className="w-4 h-4 text-cyan-600 print:text-slate-600" />
                    {new Date(selectedReport.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* PARTITION II: EXTRACTED FINANCIAL ANALYSIS */}
            <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200/80 font-mono text-[11px] font-bold text-cyan-700 uppercase tracking-widest flex items-center justify-between print:bg-slate-100 print:text-indigo-600 print:border-slate-300">
                <span>PARTITION II: EXTRACTED FINANCIAL ANALYSIS</span>
                <span className="text-[9px] text-slate-450">QUALIFIER METRIC</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-white print:bg-white text-slate-700">
                <div className="space-y-1.5 border-r border-slate-150 pr-4 last:border-none print:border-slate-300">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    <DollarSign className="w-4 h-4 text-cyan-600 print:text-slate-600" />
                    Extracted Target Budget
                  </div>
                  <span className="text-base font-mono font-bold text-emerald-600 print:text-emerald-700 block">
                    {selectedReport.budget || 'Probing...'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Identified through dialogue parameters</p>
                </div>

                <div className="space-y-1.5 border-r border-slate-150 pr-4 last:border-none print:border-slate-300">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    <Clock className="w-4 h-4 text-cyan-600 print:text-slate-600" />
                    Estimated Delivery Timeline
                  </div>
                  <span className="text-base font-semibold text-indigo-650 print:text-indigo-700 block font-mono">
                    {selectedReport.timeline || 'Not Specified'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Optimal schedule for client deployment</p>
                </div>

                <div className="space-y-1.5 flex flex-col justify-start">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    <Award className="w-4 h-4 text-cyan-600 print:text-slate-600" />
                    Minimum Budget Status
                  </div>
                  <span className="text-base font-semibold text-cyan-700 print:text-indigo-650 block font-mono">
                    {Number(String(selectedReport.budget).replace(/[^0-9]/g, '')) >= 500 ? 'PASS (Optimal)' : 'REVIEW CAP'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Protects general margin requirements</p>
                </div>
              </div>
            </div>

            {/* PARTITION III: TECHNICAL ALIGNMENT BLUEPRINT */}
            <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200/80 font-mono text-[11px] font-bold text-cyan-700 uppercase tracking-widest flex items-center justify-between print:bg-slate-100 print:text-indigo-600 print:border-slate-300">
                <span>PARTITION III: TECHNICAL ALIGNMENT BLUEPRINT</span>
                <span className="text-[9px] text-slate-450">MAPPING SYSTEM</span>
              </div>
              <div className="p-5 bg-white print:bg-white text-slate-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl print:bg-slate-100 print:border-slate-300 shadow-xs">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 block tracking-wider font-bold">PROPOSED CORE SYSTEM SOLUTION</span>
                    <span className="text-base font-sans font-bold text-cyan-700 print:text-indigo-600 leading-normal block mt-1">{selectedReport.recommendedService}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-slate-500 block font-bold">ESTIMATED LAUNCH PLATFORM</span>
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded inline-block mt-0.5">
                      Production Stack v6.2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PARTITION IV: BUSINESS BOTTLENECK & AUDIT LOG */}
            <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200/80 font-mono text-[11px] font-bold text-cyan-700 uppercase tracking-widest flex items-center justify-between print:bg-slate-100 print:text-indigo-600 print:border-slate-300">
                <span>PARTITION IV: BUSINESS BOTTLENECK & AUDIT LOG</span>
                <span className="text-[9px] text-slate-450">EXECUTIVE SPECS</span>
              </div>
              <div className="p-5 bg-white print:bg-white text-slate-600 text-sm leading-relaxed italic border-slate-200 shadow-xs">
                &ldquo;{selectedReport.summary}&rdquo;
              </div>
            </div>

            {/* PARTITION V: VERIFIED ACTION RECOGNITION TOKEN */}
            <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200/80 font-mono text-[11px] font-bold text-cyan-700 uppercase tracking-widest flex items-center justify-between print:bg-slate-100 print:text-indigo-600 print:border-slate-300">
                <span>PARTITION V: VERIFIED ACTION RECOGNITION TOKEN</span>
                <span className="text-[9px] text-slate-450">CALLBACK BLUEPRINT</span>
              </div>
              <div className="p-5 bg-white print:bg-white text-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs text-sm">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">MEETING CONFIRMED STATUS</span>
                  <div className="font-mono text-sm text-emerald-600 font-bold flex items-center gap-1.5 mt-1 print:text-emerald-700">
                    <Calendar className="w-4 h-4" />
                    {selectedReport.meetingDate || 'Next Monday (Validated Call)'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold">SECURITY HASH CODE</span>
                  <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg inline-block mt-1 print:bg-slate-100 print:border-slate-300">
                    PXG_HASH_{selectedReport.id.toUpperCase()}_v2026
                  </span>
                </div>

                <div className="text-right print:text-left">
                  <span className="text-[10px] font-mono text-slate-450 block font-bold uppercase">PIXGENIX AGENT CORESIGN SIGNATURE</span>
                  <div className="text-xs font-mono border-t border-slate-150 mt-2 pt-1 font-bold italic tracking-wide text-cyan-700 print:text-indigo-600">
                    // PixgenixAgent.CoreOnboard.DigitalSig //
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic closing actions section */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse print:bg-emerald-600"></div>
                <div className="text-xs">
                  <span className="text-slate-450 block print:text-slate-600 font-semibold">MEETING CONFIRMED STATUS:</span>
                  <span className="font-mono font-bold text-emerald-600 print:text-emerald-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedReport.meetingDate || 'Scheduled (Check with consultant)'}
                  </span>
                </div>
              </div>

              <div className="text-right print:text-left text-[11px] font-mono text-slate-500 leading-normal">
                Pixgenix Systems Onboarding Division<br />
                Secured via Pixgenix AI Agent Discovery Ecosystem
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LEADS PIPELINE OVERVIEW TABLE & CONTROLS */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
            <div>
              <h3 className="text-lg font-sans font-medium text-slate-800 tracking-tight">
                Lead Intelligence Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Monitor qualifying metrics, budget discovery status, and download corporate PDF briefings.
              </p>
            </div>

            {/* Refresh / Filter Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQualifiedOnly(!isQualifiedOnly)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
                  isQualifiedOnly 
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-700 font-bold shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 shadow-xs'
                }`}
              >
                {isQualifiedOnly ? '★ Highly Qualified Stars (Score >= 75%)' : 'Show All Leads'}
              </button>

              <button
                onClick={onRefresh}
                title="Refresh Leads Table"
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by Client Name, Company, Email, or Recommended Services..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all shadow-xs"
            />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 bg-slate-50">
                  <th className="py-3 px-4">CLIENT DESK</th>
                  <th className="py-3 px-4">EST. BUDGET</th>
                  <th className="py-3 px-4">RECOMMENDED PIXGENIX SERVICE</th>
                  <th className="py-3 px-4">LEAD MERIT RATING</th>
                  <th className="py-3 px-4">CALLBACK METRIC</th>
                  <th className="py-3 px-4 text-right">DOSSIER ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 font-mono italic bg-white">
                      No matching qualifying lead dossiers discovered yet. Launch call simulations to onboard leads!
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr 
                      key={r.id}
                      className="hover:bg-slate-50/70 transition-colors group bg-white"
                    >
                      {/* Name / Desk info */}
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-medium text-slate-800">{r.clientName}</div>
                        <div className="text-[10px] text-slate-450 font-mono mt-0.5">{r.clientCompany || 'Independent'}</div>
                      </td>

                      {/* Est. Budget */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {r.budget || '$1,500'}
                      </td>

                      {/* Pixgenix Solution */}
                      <td className="py-3.5 px-4 font-sans font-bold text-cyan-600">
                        {r.recommendedService}
                      </td>

                      {/* Lead Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            r.leadScore >= 75 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {r.leadScore}% Match
                          </span>
                        </div>
                      </td>

                      {/* Callback */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded flex items-center gap-1 w-fit shadow-xs">
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                          {r.meetingDate || 'Locked'}
                        </span>
                      </td>

                      {/* Download Dossier Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="px-3 py-1 bg-slate-50 hover:bg-cyan-600 hover:text-white border border-slate-200 hover:border-cyan-600 rounded-lg text-[11px] font-mono font-medium text-slate-500 transition-all flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Full PDF Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
