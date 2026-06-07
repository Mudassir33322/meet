import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PhoneCall, PhoneOff, Mic, MicOff, Send, Volume2, VolumeX, 
  HelpCircle, User, Building, Mail, Phone, ArrowRight, Sparkles, 
  Globe, Clock, DollarSign, Calendar, RefreshCw, BarChart2, ShieldCheck, Play,
  Languages, Cpu, Wifi, Zap
} from 'lucide-react';
import { Session, SessionMessage } from '../types';

interface VoiceSandboxProps {
  onSessionComplete: () => void;
  activeSession: Session | null;
  setActiveSession: (session: Session | null) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  selectedVoice: 'female' | 'male';
  setSelectedVoice: (voice: 'female' | 'male') => void;
}

const SAMPLE_CLIENTS = [
  { name: 'Khassan Ahmed', email: 'khassan@vertexlabs.co', phone: '+92 333 4455667', company: 'Vertex Real Estate', details: 'Wants to automate client property updates because staff takes 3 days to email clients.' },
  { name: 'Diana de Silva', email: 'diana@desilva.com', phone: '+1 415 889 2231', company: 'Silva Eco Boutique', details: 'E-commerce owner noticing a huge 45% drop-off in shopping checkout stages.' },
  { name: 'Ahmad Al-Mansoor', email: 'ahmad@mansoor-group.ae', phone: '+971 50 1234567', company: 'Al-Mansoor Logistics', details: 'Struggling with dispatch coordinates and fleet transparency across 4 different regions.' },
  { name: 'Maria Gomez', email: 'maria@gomezdesign.es', phone: '+34 600 123 456', company: 'Gomez Interiors', details: 'Sells high-end design services but struggles to qualify clients on their budget before doing free consultations.' }
];

export default function VoiceSandbox({ 
  onSessionComplete, 
  activeSession, 
  setActiveSession,
  selectedLanguage,
  setSelectedLanguage,
  selectedVoice,
  setSelectedVoice
}: VoiceSandboxProps) {
  // Input form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  
  // Interactive UI states
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Advanced features state controls
  const [isHandsFree, setIsHandsFree] = useState(true); // Auto mic enabled by default
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [dialedDigits, setDialedDigits] = useState('');
  const [simulatedNetworkQuality, setSimulatedNetworkQuality] = useState(99);

  const [aiAnalysis, setAiAnalysis] = useState<{
    budget: string | null;
    timeline: string | null;
    service: string | null;
    meetingDate: string | null;
    score: number;
    simulation: boolean;
  }>({
    budget: null,
    timeline: null,
    service: null,
    meetingDate: null,
    score: 10,
    simulation: true
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync state variables to refs to safeguard speech callbacks against stale closures
  const activeSessionRef = useRef<Session | null>(null);
  const isHandsFreeRef = useRef(isHandsFree);
  const isAssistantSpeakingRef = useRef(isAssistantSpeaking);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    isAssistantSpeakingRef.current = isAssistantSpeaking;
  }, [isAssistantSpeaking]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  // Call Active Session Timer Effect
  useEffect(() => {
    let timerInterval: any;
    if (activeSession) {
      setCallTimer(0);
      timerInterval = setInterval(() => {
        setCallTimer(prev => prev + 1);
        // Slightly fluctuate network signal strength for high realism
        setSimulatedNetworkQuality(prev => {
          const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          return Math.max(92, Math.min(100, prev + change));
        });
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(timerInterval);
  }, [activeSession]);

  const formatTimerValue = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Pre-load voices cache on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Handle Speech Recognition setup (Web Speech API) - Reload on language dial changes
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let rec: any = null;

    if (SpeechRecognition) {
      rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = selectedLanguage;

      rec.onstart = () => {
        setIsListening(true);
        setTranscript('Listening for your voice...');
      };

      rec.onresult = (e: any) => {
        const textResult = e.results[0][0].transcript;
        if (textResult) {
          setTranscript(textResult);
          try { rec.stop(); } catch(err) {}
          submitChatMessage(textResult);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        setTranscript('Microphone silent or finished.');
      };

      rec.onend = () => {
        setIsListening(false);
        if (isHandsFreeRef.current && !isAssistantSpeakingRef.current && activeSessionRef.current && activeSessionRef.current.status === 'active') {
          setTimeout(() => {
            try {
              if (recognitionRef.current && !isAssistantSpeakingRef.current && !isListeningRef.current) {
                recognitionRef.current.start();
              }
            } catch(err) {}
          }, 600);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (rec) {
        try {
          rec.abort();
        } catch(e) {}
      }
    };
  }, [selectedLanguage]);

  // Set preset inputs
  const applyPreset = (preset: typeof SAMPLE_CLIENTS[0]) => {
    setName(preset.name);
    setEmail(preset.email);
    setPhone(preset.phone);
    setCompany(preset.company);
  };

  // Sound effect simulation for keypad buttons
  const playKeyTone = (digit: string) => {
    setDialedDigits(prev => {
      const updated = prev + digit;
      return updated.length > 12 ? updated.substring(updated.length - 12) : updated;
    });

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      // Standard DTMF dual tones simulated simply with pitch shifts
      const freqs: Record<string, number> = {
        '1': 697, '2': 770, '3': 852,
        '4': 941, '5': 1209, '6': 1336,
        '7': 1477, '8': 1633, '9': 1800,
        '*': 500, '0': 1100, '#': 2200
      };
      
      osc.frequency.setValueAtTime(freqs[digit] || 440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context block safeguard
    }
  };

  // Perform TTS (Voice narration of Pixgenix Agent response with dynamic Male/Female & Worldwide Language selector support)
  const speakVoice = (text: string) => {
    if (!ttsEnabled || isMuted) return;
    setIsAssistantSpeaking(true); // Flag immediately to prevent starting the mic
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(err) {}
    }
    
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const lower = text.toLowerCase();
      
      const isUrduHindi = lower.includes('assalam') || lower.includes('bhai') || lower.includes('theek') || lower.includes('kijiye') || lower.includes('shukriya') || lower.includes('shuru') || lower.includes('aap') || lower.includes('hain') || lower.includes('kia') || lower.includes('karo') || lower.includes('na');
      const isSpanishText = lower.includes('hola') || lower.includes('como') || lower.includes('buenos') || lower.includes('gracias') || lower.includes('proyecto');
      const isArabicText = lower.includes('marhaban') || lower.includes('shukran') || lower.includes('salam') || lower.includes('na’am');
      const isFrenchText = lower.includes('bonjour') || lower.includes('merci') || lower.includes('oui');

      let matchedVoice = null;

      if (isUrduHindi) {
        matchedVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const l = v.lang.toLowerCase();
          const isGenderMatch = selectedVoice === 'female' ? (!name.includes('male') && !name.includes('david')) : (name.includes('male') || name.includes('zubair') || name.includes('google'));
          return (l.includes('ur') || l.includes('hi') || l.includes('in') || l.includes('pa')) && isGenderMatch;
        });
        if (!matchedVoice) {
          matchedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('ur'));
        }
        utterance.rate = 1.05;
      } else if (isSpanishText) {
        matchedVoice = voices.find(v => v.lang.includes('es') || v.lang.includes('ES'));
      } else if (isArabicText) {
        matchedVoice = voices.find(v => v.lang.includes('ar') || v.lang.includes('AE'));
      } else if (isFrenchText) {
        matchedVoice = voices.find(v => v.lang.includes('fr') || v.lang.includes('FR'));
      } else {
        matchedVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const isGenderMatch = selectedVoice === 'female' ? (name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('hazel')) : (name.includes('male') || name.includes('david') || name.includes('mark'));
          return (v.lang.includes('en-GB') || v.lang.includes('en-US')) && isGenderMatch;
        });
        if (!matchedVoice) {
          matchedVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US') || v.lang.toLowerCase().includes('google'));
        }
        utterance.rate = 1.0;
      }
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        console.log('Intelligently selected TTS Voice profile:', matchedVoice.name, 'Language:', matchedVoice.lang);
      }
      
      utterance.pitch = selectedVoice === 'female' ? 1.05 : 0.88;

      utterance.onstart = () => {
        setIsAssistantSpeaking(true);
      };

      utterance.onend = () => {
        setIsAssistantSpeaking(false);
        if (isHandsFreeRef.current && recognitionRef.current && !activeSessionRef.current?.messages[activeSessionRef.current.messages.length - 1]?.text.includes('Mubarak') && activeSessionRef.current?.status !== 'completed') {
          setTimeout(() => {
            try {
              if (recognitionRef.current && !isAssistantSpeakingRef.current && !isListeningRef.current) {
                recognitionRef.current.start();
              }
            } catch(err) {
              console.log('Voice auto-mic reactivation bypassed:', err);
            }
          }, 450);
        }
      };

      utterance.onerror = () => {
        setIsAssistantSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed to execute safely:', e);
    }
  };

  // Start Session (Simulate Phone Dialing)
  const startCall = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    setTranscript('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSession(data.session);
        setDialedDigits('');
        // Reset analysis states
        setAiAnalysis({
          budget: null,
          timeline: null,
          service: null,
          meetingDate: null,
          score: 15,
          simulation: !data.isGeminiLive
        });
        
        // Auto Speak greeting
        const greeting = data.session.messages[0]?.text;
        if (greeting) {
          setTimeout(() => speakVoice(greeting), 800);
        }
      }
    } catch (err) {
      console.error('Error starting call setup:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mic Record Toggle (Manual user button click)
  const toggleSpeechInput = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is only fully supported on Google Chrome / modern browsers. Please type your responses in the prompt box.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel(); // Mute assistant while user is actively recording speech manually
      recognitionRef.current.start();
    }
  };

  // Submit Chat Message (The user replies to Pixgenix Agent)
  const submitChatMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !activeSession) return;

    setIsLoading(true);
    setChatInput('');
    setTranscript('');

    // Shut down microphone to prevent noise accumulation during processing (band ho)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    
    // Add temporary message locally to prevent lag
    const updatedMessages = [
      ...activeSession.messages,
      { sender: 'client' as const, text: textToSend, timestamp: new Date().toISOString() }
    ];
    setActiveSession({
      ...activeSession,
      messages: updatedMessages
    });

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend })
      });
      
      const data = await res.json();
      if (data.success) {
        // Fetch up to date messages
        setActiveSession({
          ...activeSession,
          status: data.currentSessionStatus,
          messages: [
            ...updatedMessages,
            { sender: 'ai' as const, text: data.responseText, timestamp: new Date().toISOString() }
          ]
        });

        // Update real time intelligence parameters
        setAiAnalysis({
          budget: data.extractedParams.budget || aiAnalysis.budget,
          timeline: data.extractedParams.timeline || aiAnalysis.timeline,
          service: data.extractedParams.service || aiAnalysis.service,
          meetingDate: data.extractedParams.meetingDate || aiAnalysis.meetingDate,
          score: Math.max(aiAnalysis.score, data.completed ? 100 : (
            (data.extractedParams.service ? 25 : 0) +
            (data.extractedParams.budget ? 25 : 0) +
            (data.extractedParams.timeline ? 20 : 0) +
            (data.extractedParams.meetingDate ? 15 : 0) + 15
          )),
          simulation: data.isAiSimulation
        });

        // Say response out loud
        speakVoice(data.responseText);

        // If transaction completed, trigger parent refresh for reports and stats
        if (data.completed || data.currentSessionStatus === 'completed') {
          setTimeout(() => {
            onSessionComplete();
            setActiveSession(null);
          }, 4500); // Allow speech to finish before closing screen
        }
      }
    } catch (err) {
      console.error('Error in chat exchange:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual trigger to end call early
  const endCallEarly = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(err){}
    }
    setActiveSession(null);
    onSessionComplete();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Outer form / active conversation box */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {!activeSession ? (
            /* PHONE ONBOARDING DIALER PRE-STAGE */
            <motion.div
              key="dialer-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-cyan-50 text-cyan-700 border border-cyan-150">
                      Phase 1: Discovery Simulator
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded-full bg-emerald-50 text-emerald-700 border border-emerald-150">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Pixgenix Agent Online
                    </span>
                  </div>
                  <h2 className="text-2xl font-sans font-medium text-slate-950 tracking-tight">
                    Onboard New Lead
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-xl">
                    Fill the incoming client profile or click a corporate preset below to simulate high-qualification conversations with Pixgenix Agent.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 self-start">
                  <Globe className="w-4 h-4 text-slate-450" />
                  <span className="text-xs font-mono text-slate-700">Worldwide Language Enabled</span>
                </div>
              </div>

              {/* Compact Presets Row */}
              <div className="mb-6">
                <span className="text-xs font-mono text-slate-450 block mb-2.5 uppercase font-semibold">
                  CHOOSE A CLIENT PROFILE PRESET
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SAMPLE_CLIENTS.map((pc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPreset(pc)}
                      className="text-left p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/50 border border-slate-150 hover:border-cyan-500/40 transition-all flex flex-col justify-between group cursor-pointer h-full shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-1.5 w-full">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors truncate">
                          {pc.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase px-1 py-0.2 shrink-0 rounded bg-white border border-slate-200">
                          {pc.company.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 italic leading-relaxed">
                        &ldquo;{pc.details}&rdquo;
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Registration Form */}
              <form onSubmit={startCall} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold uppercase">CLIENT FULL NAME *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Imran Hashmi"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-400 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold uppercase">BUSINESS EMAIL *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. imran@vortexagency.com"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-400 transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold uppercase">PHONE NUMBER</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +92 300 4567890"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-400 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold uppercase">COMPANY NAME</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Vortex Logistics"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-400 transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !name || !email}
                  className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-sans font-medium text-slate-100 hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px] shadow-lg shadow-cyan-500/10 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-100" />
                      Dialing Secure Line...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-slate-100" />
                      Initiate Call Assessment with Pixgenix Agent
                    </span>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* ACTIVE PHONE CALL SCREEN */
            <motion.div
              key="call-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 overflow-hidden flex flex-col h-[670px]"
            >
              {/* Call Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-50 to-indigo-50 flex items-center justify-center border border-cyan-150 text-cyan-600 relative shrink-0">
                    <Phone className="w-5 h-5 text-cyan-600 animate-pulse" />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                      {activeSession.clientName}
                      <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {activeSession.clientCompany || 'Corporate'}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                      <span className="text-xs font-mono text-cyan-700 flex items-center gap-1 bg-cyan-50/70 px-2 py-0.5 rounded border border-cyan-150">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        {formatTimerValue(callTimer)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                        {simulatedNetworkQuality}% Signal (HD Voice)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {/* Persona Selector Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVoice(selectedVoice === 'female' ? 'male' : 'female');
                      playKeyTone('6');
                    }}
                    title="Change Pixgenix Agent Speech Voice Persona"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-medium hover:text-cyan-600 bg-white text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{selectedVoice === 'female' ? '👩 Sania (Female)' : '👨 Zubair (Male)'}</span>
                  </button>

                  {/* Hands-Free Autopilot Auto Mic Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHandsFree(!isHandsFree);
                      playKeyTone('#');
                    }}
                    title="Hands-free Automatic Microphone: auto opens microphone when assistant finishes speaking"
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isHandsFree 
                        ? 'bg-cyan-50 border-cyan-200 text-cyan-700 shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isHandsFree ? 'text-cyan-600 fill-cyan-500' : 'text-slate-450'}`} />
                    {isHandsFree ? 'AUTO MIC: ON' : 'AUTO MIC: OFF'}
                  </button>

                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    title={ttsEnabled ? "Disable Phone Narrator Sound" : "Enable Phone Narrator Sound"}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      ttsEnabled 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                  </button>
                  
                  <button
                    onClick={endCallEarly}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-50 rounded-xl text-xs font-mono font-medium transition-all shadow-sm cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Hangup
                  </button>
                </div>
              </div>

              {/* Advanced Real-time Audio Spectrum & Feedback Layer */}
              <div className={`rounded-xl border p-4 mb-4 flex flex-col items-center justify-center relative overflow-hidden shrink-0 transition-colors ${
                isAssistantSpeaking 
                  ? 'bg-violet-50/50 border-violet-200'
                  : isListening
                    ? 'bg-cyan-50/50 border-cyan-200 animate-pulse'
                    : isLoading
                      ? 'bg-fuchsia-50/50 border-fuchsia-200'
                      : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="absolute top-2.5 right-3.5 flex items-center gap-1.5 font-mono text-[9px]">
                  <span className={`w-2 h-2 rounded-full ${
                    isListening ? 'bg-cyan-550 animate-ping' : isAssistantSpeaking ? 'bg-violet-500' : 'bg-slate-450'
                  }`}></span>
                  <span className="text-slate-400 uppercase">SPECTRUM STREAM</span>
                </div>
                
                {/* Advanced Multi-state Speaking / Listening label with smart urdu hint */}
                <span className={`text-xs font-mono mb-2 uppercase tracking-wider text-[11px] font-bold flex items-center gap-1.5 ${
                  isAssistantSpeaking 
                    ? 'text-violet-600' 
                    : isListening 
                      ? 'text-cyan-600' 
                      : isLoading 
                        ? 'text-fuchsia-600' 
                        : 'text-slate-500'
                }`}>
                  {isAssistantSpeaking ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-violet-500 animate-bounce" />
                      🔊 Pixgenix Agent is Speaking (Mic Auto-Silenced)
                    </>
                  ) : isListening ? (
                    <>
                      <Mic className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                      🎙️ Speak Now (Microphone Active)
                    </>
                  ) : isLoading ? (
                    <>
                      <Cpu className="w-3.5 h-3.5 text-fuchsia-500 animate-spin" />
                      🧠 AI Brain evaluating solutions...
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      🟢 Standby (Mic Auto-triggers on turn)
                    </>
                  )}
                </span>

                {/* Animated Bars */}
                <div className="h-12 flex items-center gap-1 justify-center my-1 w-full max-w-sm">
                  {[...Array(28)].map((_, i) => {
                    const animationDur = 0.4 + Math.random() * 1.0;
                    const baseHeight = 10 + Math.random() * 35;
                    return (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: isAssistantSpeaking 
                            ? [baseHeight - 8, baseHeight + 12, baseHeight - 8]
                            : isListening 
                              ? [baseHeight - 12, baseHeight + 16, baseHeight - 12]
                              : isLoading 
                                ? [6, 26, 6] 
                                : [4, 8, 4],
                          backgroundColor: isAssistantSpeaking 
                            ? ["#a78bfa", "#8b5cf6", "#a78bfa"] 
                            : isListening 
                              ? ["#06b6d4", "#0891b2", "#06b6d4"] 
                              : isLoading 
                                ? ["#e879f9", "#d946ef", "#e879f9"] 
                                : ["#cbd5e1", "#cbd5e1", "#cbd5e1"]
                        }}
                        transition={{ 
                          duration: animationDur, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="w-1.5 rounded-full"
                        style={{ height: '6px' }}
                      />
                    );
                  })}
                </div>

                {transcript && (
                  <p className="text-xs font-mono text-cyan-700 mt-2.5 italic text-center px-4 max-w-md line-clamp-1 bg-cyan-50 border border-cyan-155 py-1.5 rounded-lg w-full">
                    Live Recognition: &ldquo;{transcript}&rdquo;
                  </p>
                )}
              </div>

              {/* WORLDWIDE DIALECT VOICE INTERACTION TRANSLATIONS HUB */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-1.5 self-start">
                  <Languages className="w-4 h-4 text-cyan-600" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                    VOICE DIALECT INSTRUCTIONS TARGETS:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { code: 'en-US', flag: '🇺🇸', label: 'English' },
                    { code: 'ur-PK', flag: '🇵🇰', label: 'Urdu / Roman Urdu' },
                    { code: 'es-ES', flag: '🇪🇸', label: 'Español' },
                    { code: 'fr-FR', flag: '🇫🇷', label: 'Français' },
                    { code: 'ar-AE', flag: '🇦🇪', label: 'العربية' }
                  ].map((langItem) => (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setSelectedLanguage(langItem.code);
                        playKeyTone('3');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all flex items-center gap-1 cursor-pointer ${
                        selectedLanguage === langItem.code
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <span>{langItem.flag}</span>
                      <span>{langItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Audio Chat Feed Scroll */}
              <div 
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto space-y-3.5 pr-1.5 mb-4 scrollbar-thin"
              >
                {activeSession.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-xs ${
                      m.sender === 'ai'
                        ? 'bg-slate-50 border border-slate-200 rounded-tl-none text-slate-800'
                        : 'bg-cyan-50 border border-cyan-150 text-slate-800 rounded-tr-none'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
                          m.sender === 'ai' ? 'text-violet-600' : 'text-cyan-600'
                        }`}>
                          {m.sender === 'ai' ? 'Pixgenix Agent' : activeSession.clientName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-sans whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-250 rounded-2xl rounded-tl-none p-3 max-w-[80%] flex items-center gap-2 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-450 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-450 animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-450 animate-bounce delay-300"></span>
                      <span className="text-xs font-mono text-violet-600 ml-1">Pixgenix Agent is evaluating solutions...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input controls */}
              <div className="mt-auto border-t border-slate-150 pt-4 bg-white shrink-0">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeechInput}
                    title={isListening ? "Mute Microphone" : "Tap to Speak (Speech Recognition)"}
                    className={`px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isListening 
                        ? 'bg-rose-50 border-rose-250 text-rose-600 animate-pulse' 
                        : 'bg-slate-50 border-slate-200 text-slate-550 hover:border-cyan-200 hover:text-cyan-600'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isListening ? "Type here, or keep speaking..." : "Type text response to client profile or Pixgenix Agent..."}
                    onKeyDown={(e) => e.key === 'Enter' && submitChatMessage(chatInput)}
                    className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-cyan-500 placeholder-slate-400 shadow-xs"
                  />
                  
                  <button
                    type="button"
                    onClick={() => submitChatMessage(chatInput)}
                    disabled={!chatInput.trim() || isLoading}
                    className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] font-mono text-slate-450 mt-2 text-center">
                  Press the microphone button next to typing pad to speak via high fidelity browser microphone transcription.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side visual analytics and dialpad metrics */}
      <div className="lg:col-span-4 space-y-6">
        {/* Client Portal Funnel Progression Stages Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-sm font-sans font-medium text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Client Funnel Call Progression
            </h4>
            <span className="text-[9px] font-mono bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-150 uppercase font-bold">
              Live Tracker
            </span>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Phase 1: Hello & Welcome Greeting', checked: true },
              { label: 'Phase 2: Probing Business Problems & Gaps', checked: !!activeSession },
              { label: 'Phase 3: Finding Bottleneck / Industry Leaks', checked: !!activeSession && activeSession.messages.length >= 3 },
              { label: 'Phase 4: Match Customized Strategy Solutions', checked: !!activeSession && (!!aiAnalysis.service || activeSession.messages.length >= 5) },
              { label: 'Phase 5: Budget Alignment & Quote Finalization', checked: !!activeSession && (!!aiAnalysis.budget || !!aiAnalysis.timeline) },
              { label: 'Phase 6: Lock Monday Callback & Generate Report', checked: !!activeSession && (!!aiAnalysis.meetingDate || activeSession.status === 'completed') }
            ].map((step, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all ${
                  step.checked 
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono mt-0.5 shrink-0 ${
                  step.checked 
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-300 font-bold' 
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}>
                  {step.checked ? '✓' : idx + 1}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-[11.5px] leading-tight font-medium ${step.checked ? 'text-slate-800 font-semibold' : 'text-slate-450'}`}>
                    {step.label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {step.checked ? 'Fulfillment unlocked' : 'Pending interaction'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time AI Lead Qualification Inspector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-sans font-medium text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
              Live Lead Intelligence
            </h4>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-150 font-bold">
              Score Analysis
            </span>
          </div>

          <div className="space-y-4">
            {/* Lead Score Indicator */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-slate-500 mb-1.5">
                <span>QUALIFIED RATING SCORE:</span>
                <span className="text-cyan-600 font-extrabold">{activeSession ? aiAnalysis.score : 0}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500 ease-out" 
                  style={{ width: `${activeSession ? aiAnalysis.score : 0}%` }}
                />
              </div>
            </div>

            {/* Extracted Fields Metadata checklist */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Extracted Budget:
                </span>
                <span className={`font-mono text-right ${activeSession && aiAnalysis.budget ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {activeSession && aiAnalysis.budget ? aiAnalysis.budget : 'Probing...'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Target Timeline:
                </span>
                <span className={`font-mono text-right ${activeSession && aiAnalysis.timeline ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                  {activeSession && aiAnalysis.timeline ? aiAnalysis.timeline : 'Probing...'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <BarChart2 className="w-3.5 h-3.5 text-slate-400" /> Matched Solution:
                </span>
                <span className={`font-sans text-right truncate max-w-[150px] ${activeSession && aiAnalysis.service ? 'text-cyan-600 font-semibold' : 'text-slate-400'}`}>
                  {activeSession && aiAnalysis.service ? aiAnalysis.service : 'Finding Bottleneck...'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Onboard Meeting:
                </span>
                <span className={`font-mono text-right ${activeSession && aiAnalysis.meetingDate ? 'text-emerald-600 font-semibold animate-pulse' : 'text-slate-400'}`}>
                  {activeSession && aiAnalysis.meetingDate ? aiAnalysis.meetingDate : 'Locking Closing...'}
                </span>
              </div>
            </div>

            {/* Strategy Guidelines to agent */}
            <div className="pt-3 border-t border-slate-200 mt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-700 font-sans font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  Pixgenix Agent Sales Playbook
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pixgenix Agent avoids generic "Who are you" text. If the client states they have no problems, Pixgenix Agent creates industry benchmark awareness (lost client notifications, slow web checkout abandonment rates) to establish a bottleneck, maps it to solutions, and locks in a Monday callback!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
