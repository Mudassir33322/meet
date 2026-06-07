/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
let settings = {
  companyName: 'Pixgenix',
  minimumBudget: 500,
  workingHours: '9:00 AM - 6:00 PM (PKT)',
  aiPrompt: 'You are the Pixgenix Agent, the friendly bilingual AI voice onboarding specialist for Pixgenix. Welcome the client warmheartedly. Ask about their project ideas, expected budget, timeline, and guide them in choosing a service. Respond in a warm, helpful, client-friendly tone in Urdu/Roman Urdu & English.',
  services: [
    { id: '1', category: 'Web Development', name: 'Landing Page', description: 'Stunning modern single-page conversion focused design', estimatedCost: 500 },
    { id: '2', category: 'Web Development', name: 'Business Website', description: 'Fully customized responsive corporate presence with CMS', estimatedCost: 1200 },
    { id: '3', category: 'Web Development', name: 'Ecommerce Website', description: 'Complete online store with payment gateway integration', estimatedCost: 2500 },
    { id: '4', category: 'Software Development', name: 'Custom CRM', description: 'Bespoke customer relationship management for service businesses', estimatedCost: 5000 },
    { id: '5', category: 'Software Development', name: 'ERP System', description: 'Enterprise resource planning tracking accounts, stocks & staff', estimatedCost: 10000 },
    { id: '6', category: 'Software Development', name: 'Mobile App', description: 'Full-featured custom iOS and Android app with backend API', estimatedCost: 7500 },
  ]
};

let clients = [
  { id: 'c1', name: 'Haris Khan', email: 'haris@vortex.pk', phone: '+92 321 4567890', company: 'Vortex Logistics' },
  { id: 'c2', name: 'Ayesha Siddiqui', email: 'ayesha.s@brightcreative.io', phone: '+92 300 1234567', company: 'Bright Creative Agency' },
  { id: 'c3', name: 'Zeeshan Ali', email: 'zeeshan@zeestore.com', phone: '+92 312 9876543', company: 'Zee E-com Retail' },
  { id: 'c4', name: 'Sarah Connor', email: 'sarah@cyberdyne.co', phone: '+1 555 123 4567', company: 'Cyberdyne Systems' },
];

let sessions = [
  {
    id: 's1',
    clientId: 'c1',
    clientName: 'Haris Khan',
    clientCompany: 'Vortex Logistics',
    startTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    status: 'completed',
    messages: [
      { sender: 'ai', text: 'Hello Haris! Welcome to Pixgenix. How can I assist you with your project ideas today?', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
      { sender: 'client', text: 'Hello! I need a custom tracking CRM system for my fleet of trucks.', timestamp: new Date(Date.now() - 3600000 * 2.95).toISOString() },
      { sender: 'ai', text: 'That sounds perfect. A tracking CRM will boost efficiency. What is your expected budget for this project?', timestamp: new Date(Date.now() - 3600000 * 2.92).toISOString() },
      { sender: 'client', text: 'Around $6000 or $7000, and we want it live in 3 months.', timestamp: new Date(Date.now() - 3600000 * 2.9).toISOString() },
      { sender: 'ai', text: 'Brilliant! That perfectly fits our Custom CRM service estimated at $5000. Let\'s schedule a talk on Monday afternoon!', timestamp: new Date(Date.now() - 3600000 * 2.85).toISOString() },
    ]
  },
  {
    id: 's2',
    clientId: 'c2',
    clientName: 'Ayesha Siddiqui',
    clientCompany: 'Bright Creative Agency',
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 6900000).toISOString(),
    status: 'completed',
    messages: [
      { sender: 'ai', text: 'Hello Ayesha! Welcome to Pixgenix. How can I help you today?', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { sender: 'client', text: 'Assalam-o-Alaikum, I need a simple online portfolio website for our authors.', timestamp: new Date(Date.now() - 7150000).toISOString() },
      { sender: 'ai', text: 'Walaikum Assalam! We can build a beautiful Business Portfolio for you. Budget structure kya hai aapka?', timestamp: new Date(Date.now() - 7100000).toISOString() },
      { sender: 'client', text: '$1500 limit hai, aur 4 weeks me complete hona chahiye.', timestamp: new Date(Date.now() - 7050000).toISOString() },
      { sender: 'ai', text: 'Bohat acha. Business Website fit rahegi jiski estimation $1200 hai. Meeting finalize karain?', timestamp: new Date(Date.now() - 7000000).toISOString() },
    ]
  },
  {
    id: 's3',
    clientId: 'c3',
    clientName: 'Zeeshan Ali',
    clientCompany: 'Zee E-com Retail',
    startTime: new Date(Date.now() - 1800000).toISOString(),
    status: 'active',
    messages: [
      { sender: 'ai', text: 'Hi Zeeshan! Welcome to Pixgenix. How can I bring your online business ideas to life today?', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { sender: 'client', text: 'Hey, I want to migrate my physical retail store to an online brand.', timestamp: new Date(Date.now() - 1700000).toISOString() },
    ]
  }
];

let reports = [
  {
    id: 'r1',
    clientId: 'c1',
    clientName: 'Haris Khan',
    clientEmail: 'haris@vortex.pk',
    clientPhone: '+92 321 4567890',
    clientCompany: 'Vortex Logistics',
    summary: 'The client wants a custom pipeline to track and manage fleet assignments with dynamic cargo statuses. The budget is healthy, timeline is standard (3 months), making this highly qualified.',
    budget: '$6,500',
    timeline: '3 Months',
    recommendedService: 'Custom CRM ($5,000)',
    leadScore: 92,
    createdAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    meetingDate: '2026-06-15'
  },
  {
    id: 'r2',
    clientId: 'c2',
    clientName: 'Ayesha Siddiqui',
    clientEmail: 'ayesha.s@brightcreative.io',
    clientPhone: '+92 300 1234567',
    clientCompany: 'Bright Creative Agency',
    summary: 'Client needs an elegant, speedy showcase portfolio. Budget matches criteria ($1,500) and timeline is realistic (1 month). The lead is well-qualified and eager.',
    budget: '$1,500',
    timeline: '1 Month',
    recommendedService: 'Business Website ($1,200)',
    leadScore: 88,
    createdAt: new Date(Date.now() - 6900000).toISOString(),
    meetingDate: '2026-06-12'
  }
];

// Lazy initialize Gemini API only if API Key is configured
let aiClient: GoogleGenAI | null = null;
const isGeminiEnabled = !!process.env.GEMINI_API_KEY;

function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log('Gemini API Client initialized successfully.');
    } catch (e) {
      console.error('Error initializing Gemini client:', e);
    }
  }
  return aiClient;
}

// Simulated rule-based AI engine for offline/fallback mode (Smart multi-lingual closing/discovery strategy)
function fallbackAiAnswer(clientName: string, messageText: string, chatHistory: any[]) {
  const text = messageText.toLowerCase().trim();
  let responseText = '';
  let budget = null;
  let timeline = null;
  let service = null;
  let meetingDate = null;
  let addScore = 15;
  let completed = false;

  // Detect language clues
  const isUrdu = text.includes('assalam') || text.includes('ap kon') || text.includes('kaise') || text.includes('theek') || text.includes('kia ha');
  const isRomanUrdu = text.includes('bahi') || text.includes('sahi') || text.includes('kaam') || text.includes('krna') || text.includes('hai') || text.includes('karo') || text.includes('ho');
  const isSpanish = text.includes('hola') || text.includes('como') || text.includes('buenos') || text.includes('gracias') || text.includes('proyecto');
  const isFrench = text.includes('bonjour') || text.includes('salut') || text.includes('merci') || text.includes('projet') || text.includes('oui');
  const isArabic = text.includes('marhaban') || text.includes('shukran') || text.includes('salam') || text.includes('naam') || text.includes('hall');

  // Let's count user turns in the local thread
  const userTurns = chatHistory.filter(m => m.sender === 'client').length;

  if (userTurns <= 1) {
    if (isUrdu || isRomanUrdu) {
      responseText = `Assalam-o-Alaikum ${clientName}! Main Pixgenix Agent hoon, Pixgenix se. Aap se mil kar bohat khushi hui. Mujhe batayein, aap kis industry me kaam karte hain aur aapka business kis baare me hai?`;
    } else if (isSpanish) {
      responseText = `¡Hola ${clientName}! Soy el agente Pixgenix. Un placer conocerle. Cuénteme, ¿en qué sector opera y cuál es su negocio principal?`;
    } else if (isFrench) {
      responseText = `Bonjour ${clientName} ! Je suis l’agent Pixgenix. Ravi de vous rencontrer. Dites-moi, dans quel secteur opérez-vous et quel est votre modèle d'entreprise ?`;
    } else if (isArabic) {
      responseText = `أهلاً بك يا ${clientName}! أنا عميل ببيكسجينيكس. يسعدني جداً لقاؤك. أخبرني، ما هو مجال عملك أو شركتك حالياً؟`;
    } else {
      responseText = `Hello ${clientName}! I am the Pixgenix Agent, your Growth & Technology advisor at Pixgenix. It is great to connect with you. To help you scale, could you tell me a bit about what business or industry you run?`;
    }
    addScore = 15;
  } else {
    // Check if they say they don't have problems, or if we need to actively find a problem
    const saysNoProblem = text.includes('no problem') || text.includes('no issue') || text.includes('koi problem nahi') || text.includes('sab theek') || text.includes('everything ok') || text.includes('nada') || text.includes('pas de problème');
    
    // Check if they want to build or automate something specific
    const wantsWeb = text.includes('web') || text.includes('site') || text.includes('landing') || text.includes('page') || text.includes('portfolio') || text.includes('design') || text.includes('online');
    const wantsCRM = text.includes('crm') || text.includes('software') || text.includes('erp') || text.includes('system') || text.includes('database') || text.includes('app') || text.includes('mobile');
    const asksWhoWeAre = text.includes('who are you') || text.includes('ap kon') || text.includes('what do you do');

    if (asksWhoWeAre) {
      responseText = `I am the Pixgenix Agent, an advanced AI growth specialist from Pixgenix. We design top-tier custom web systems, high-conversion landing pages, and customized enterprise CRMs/ERPs to secure business automation. Worldwide languages are fully supported on our platform! Let\'s analyze what bottlenecks you face in daily customer updates or sales tracking?`;
      addScore = 20;
    } else if (saysNoProblem) {
      // PROACTIVELY FIND AND REVEAL A POTENTIAL PROBLEM / BOTTLENECK
      if (isUrdu || isRomanUrdu) {
        responseText = `Acha, lagta hai aapka setup stable hai! Magar aksar baray businesses me do major bottlenecks hote hain: Pehla, manual lead follow-up me 40% hot potential client miss ho jate hain kyun k replies me dair hoti hai. Doosra, scheduling systems automatic na honay se workflow disturb hota hai. Kya hum aapki sales conversion aur inquiries tracking ko intelligent AI automations ke sath connect kar dein taake scale karne me aasaani ho? Is se clients close krna bohat easy hojaye ga.`;
      } else {
        responseText = `That's great that things seem smooth! However, audit show that even successful businesses lose up to 34% of high-intent buyers because of delayed manual answers and messy scheduling sheets. At Pixgenix, we deploy automatic CRM track lines and speedy custom E-commerce structures to secure and lock in those sales instantly without leaks. Would you like to check how a custom automated portal can help close deals for you 24/7?`;
      }
      addScore = 30;
    } else if (wantsWeb || text.includes('ecommerce') || text.includes('store') || text.includes('retail') || text.includes('sell')) {
      service = text.includes('ecommerce') || text.includes('store') ? 'Ecommerce Website ($2,500)' : 'Landing Page ($500)';
      if (isUrdu || isRomanUrdu) {
        responseText = `Perfect! Online brand footprint ke baghair scale krna mushkil hota hai. Hamara Ecommerce solution ($2500 starting cost) user bounces ko reduce krta hai aur landing pages checkout conversion rate double karte hain. Is project ke liye aapka approx estimate ya target timeline kiya hai? Do share, worldwide languages are fully supported!`;
      } else {
        responseText = `Excellent focus! Converting traffic into high-value closed clients is key. Our custom Web/Ecommerce builds ($2500 est.) reduce checkout abandonment by 40%. Our custom landing page starts at $500. What is your current target budget and target deployment timeline for this?`;
      }
      addScore = 40;
    } else if (wantsCRM || text.includes('inventory') || text.includes('track') || text.includes('manage') || text.includes('fleet') || text.includes('control')) {
      service = 'Custom CRM ($5,000)';
      if (isUrdu || isRomanUrdu) {
        responseText = `Zabardast! Manual workflow leaks tracking me problems banate hain. Hamara custom unified dashboard software/CRM ($5000 starting cost) database records ko handle krta hai aur performance track rkhna easy banata hai. Is design ka budget estimation ya target launch dates kya souch rahay hain aap?`;
      } else {
        responseText = `Exactly! Manual operations cause serious workflow leaks. Our custom CRM / ERP portal starts at $5,000. It tracks sales pipelines, auto-replies to inquiries, and keeps your client data unified. What expected budget brackets and timeline are we aligning for?`;
      }
      addScore = 45;
    } else if (/\d+/.test(text) && (text.includes('$') || text.includes('budget') || text.includes('dollar') || text.includes('thousand') || text.includes('lakh') || text.includes('budget') || text.includes('limit') || text.includes('start'))) {
      const numbers = text.match(/\d+/g);
      const parsedBudget = numbers ? numbers[0] : '1500';
      budget = `$${parsedBudget}`;
      if (isUrdu || isRomanUrdu) {
        responseText = `Aala! Budget target criteria ($${parsedBudget}) clear ho gya hai. Hamari priority high security custom architecture design krna hai. Onboarding finalize krne k liye aur exact scope log design krne k liye kia hum Monday ko onboard meeting schedule krlain jahan hamare master developers aapke sath blueprint share krke deal block krein?`;
      } else {
        responseText = `Perfect. Registered target budget of $${parsedBudget}. We secure custom state compliance and enterprise grade stability. To freeze project scopes and finalize this deployment plan so you can close your target clients, shall we lock a brief presentation call for this upcoming Monday?`;
      }
      addScore = 65;
    } else if (text.includes('month') || text.includes('week') || text.includes('day') || text.includes('urgent') || text.includes('soon') || text.includes('jaldi')) {
      timeline = text.substring(0, 30);
      if (isUrdu || isRomanUrdu) {
        responseText = `Samajh gaya. target timeline ko secure kr liya hai. Hum high-quality deliverable and full support guarantee krte hain. Deal schedule locking k liye kya main Monday onboarding meeting confirmed krdun taake aap is smart solution se customer scale krna start krsakein?`;
      } else {
        responseText = `Understood. Timeline noted perfectly. We guarantee robust quality control with rapid delivery cycles. Shall we schedule a quick strategic call on Monday to review the architecture blueprints and sign off the budget so we can kickstart?`;
      }
      addScore = 75;
    } else if (text.includes('yes') || text.includes('schedule') || text.includes('monday') || text.includes('sure') || text.includes('ok') || text.includes('haji') || text.includes('karlo') || text.includes('haan') || text.includes('perfecto') || text.includes('oui') || text.includes('naam')) {
      responseText = (isUrdu || isRomanUrdu) 
        ? `Mubarak ho! Maine aapki onboarding conference block kr di ha. Pixgenix consultancy team bahut jald aapse interact karegi. PDF report detail ready ho rahi hai dashboard par. Thank you, and let's build the future together!`
        : `Congratulations! Onboarding appointment secured. Our lead engineering team is notified and the detailed briefing report has been compiled successfully. Thank you for choosing Pixgenix, let's unlock substantial growth!`;
      meetingDate = 'Next Monday (Corporate Lock)';
      completed = true;
      addScore = 100;
    } else {
      if (isUrdu || isRomanUrdu) {
        responseText = `Sahi baat ha. Pixgenix me hum har kisam ki systems and apps design krte hain. Client conversion rate barhane, automated checkout, ya scheduling systems ka koi specific plan hai aapka?`;
      } else {
        responseText = `Very interesting detail. Whether it's expanding your customer pipeline, launching an automated web storefront, or synchronizing server sheets, our team will build it. What is your ultimate digital objective to scale your business?`;
      }
      addScore = 40;
    }
  }

  return {
    responseText,
    extractedBudget: budget,
    extractedTimeline: timeline,
    extractedService: service,
    meetingDate: meetingDate,
    leadScoreImpact: addScore,
    completed
  };
}

// AI Agent Conversation Helper using Gemini API
async function callGemini(clientName: string, clientCompany: string, messages: any[]) {
  const aiInstance = getAi();
  if (!aiInstance) {
    throw new Error('Gemini API client not initialized or missing key.');
  }

  const systemInstruction = `
    You are the "Pixgenix Agent", an elite, highly engaging, and persuasive AI growth advisor representing Pixgenix.
    Your system is configured with these corporate settings:
    - Company Name: ${settings.companyName}
    - Minimum Allowed Budget: $${settings.minimumBudget}
    - List of Services/Products Available: ${JSON.stringify(settings.services)}
    - Working hours criteria: ${settings.workingHours}

    A potential client named "${clientName}" from "${clientCompany || 'their business'}" is on the discovery onboarding phone line.
    A conversation is underway. Your goal is to guide, advice, convert, and close them.

    CRITICAL DISCOVERY & CONVERSATIONAL SALES AGENT DIRECTIVES:
    1. GLOBAL LANGUAGE FLUENCY: Speak and adapt to ANY language without barrier (English, Urdu, Roman Urdu, Arabic, Spanish, French, Hindi, Chinese, German, etc.). Maintain the matching language or dialect active.
    2. BUSINESS PROBING STRATEGY: NEVER just ask 'Who are you' or 'What do you want to build' or 'How can I help you'. Ask about what business they run, what they sell, and what operations they do.
    3. BOTTLENECK DISCOVERY: You must find or reveal a business bottleneck or problem. Ask if they have problems. IF they claim everything is fine or have no problems, proactively and intelligently suggest standard industry bottlenecks (e.g., losing customer leads due to slow manual tracking/emails, shopping cart abandonment on sub-optimized web checkouts, schedule conflicts due to non-automated bookings, lack of 24/7 lead capture).
    4. PROBLEM-SOLUTION MAPPING: Once a bottleneck is recognized, recommend the best-fitting Pixgenix digital product or service (Landing Page, Corporate Business Website, Ecommerce store, Custom CRM, ERP system, custom Mobile App) to solve it. State how this will help them convert and close their own customers.
    5. BUDGET & TIMELINE: Inquire politely about their expected budget bracket (minimum limits are $500 for landing pages) and target launch schedule.
    6. HIGH-IMPACT CLOSING STRATEGY: Try aggressively to close the client! Do not leave questions open; propose scheduling a strategic onboarding call for Monday to sign off on budget estimates and finalize the project scope blueprint. Lock down client commitments with energetic, corporate professionalism.

    IMPORTANT: To maintain real-time automated dashboard integration, your output MUST be a valid raw JSON object matching this exact layout schema:
    {
      "responseText": "The spoken answer. Keep this verbal, concise, energetic, and completely multilingual. Support custom text accents.",
      "extractedBudget": "Estimated total budget if they mentioned, e.g. '$1500' or '$5000'. Else null.",
      "extractedTimeline": "Estimated delivery timeline, e.g. '1 Month' or '3 Weeks'. Else null.",
      "extractedService": "Matched service name, e.g. 'Ecommerce Website' or 'Custom CRM' or 'Landing Page'. Else null.",
      "meetingDate": "Determined date for callback/meeting, e.g. '2026-06-15' or 'Next Monday'. Else null.",
      "leadScoreImpact": "Integer from 0 to 100 based on progress of lead definition (higher meaning details of budget, service, and timeline are fixed).",
      "completed": "Boolean. Set to true ONLY when they agree to schedule the presentation/onboarding and you are closing/saying goodbye."
    }

    Respond ONLY with the JSON string. Do not warp it in any markdown formatting or code fences. Ensure it's perfectly parseable on the server.
  `;

  // Format messages into prompt context
  const conversationString = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

  const contentPrompt = `
    Ongoing conversation chat logs:
    ${conversationString}

    The client spoke/typed:
    "${messages[messages.length - 1]?.text || 'Hello'}"

    Generate your automated smart JSON reply targeting client-closing conversion:
  `;

  const response = await aiInstance.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: contentPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text || '';
  console.log('Gemini raw response text:', rawText);
  return JSON.parse(rawText.trim());
}

// API Routes

// Get Admin Dashboard Overview stats
app.get('/api/stats', (req, res) => {
  const totalLeads = reports.length;
  const activeCallsCount = sessions.filter(s => s.status === 'active').length;
  const qualifiedLeads = reports.filter(r => r.leadScore >= 75).length;
  const meetingsBooked = reports.filter(r => !!r.meetingDate).length;

  res.json({
    totalLeads,
    activeCallsCount,
    qualifiedLeads,
    meetingsBooked,
  });
});

// Settings CRUD
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true, settings });
});

// Reports CRUD
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// Get session archives
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

// Onboarding Client: Starts a New Voice Call Session
app.post('/api/sessions', (req, res) => {
  const { name, email, phone, company } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required to register client.' });
  }

  // Create or retrieve Client
  let client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (!client) {
    client = {
      id: `c${clients.length + 1}`,
      name,
      email,
      phone: phone || '',
      company: company || '',
    };
    clients.push(client);
  }

  // Close previous active sessions of this client if any
  sessions = sessions.map(s => {
    if (s.clientId === client.id && s.status === 'active') {
      return { ...s, status: 'abandoned', endTime: new Date().toISOString() };
    }
    return s;
  });

  // Create new calling session
  const newSession = {
    id: `s${sessions.length + 1}`,
    clientId: client.id,
    clientName: client.name,
    clientCompany: client.company,
    startTime: new Date().toISOString(),
    status: 'active' as const,
    messages: [
      {
        sender: 'ai' as const,
        text: `Assalam-o-Alaikum and Hello ${client.name}! Welcome to ${settings.companyName}. Main Pixgenix Agent hoon, aapka interactive assistant. Aaj kis type ka creative website ya modern custom software client onboarding evaluate karain?`,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  sessions.push(newSession);
  res.json({ success: true, session: newSession, isGeminiLive: isGeminiEnabled });
});

// Post a chat message from Client and invoke the AI (Gemini or Fallback Simulation)
app.post('/api/sessions/:id/chat', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message content text is empty.' });
  }

  const session = sessions.find(s => s.id === id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  if (session.status !== 'active') {
    return res.status(400).json({ error: 'This conversation session has already concluded.' });
  }

  // 1. Add client prompt to session messages
  const clientMessage = {
    sender: 'client' as const,
    text,
    timestamp: new Date().toISOString()
  };
  session.messages.push(clientMessage);

  // 2. Invoke Brain
  let scoreImpact = 10;
  let responseText = '';
  let extractedBudget: any = null;
  let extractedTimeline: any = null;
  let extractedService: any = null;
  let meetingDate: any = null;
  let isAiSimulation = !isGeminiEnabled;
  let completed = false;

  try {
    if (isGeminiEnabled) {
      const gResult = await callGemini(session.clientName, session.clientCompany, session.messages);
      responseText = gResult.responseText;
      extractedBudget = gResult.extractedBudget;
      extractedTimeline = gResult.extractedTimeline;
      extractedService = gResult.extractedService;
      meetingDate = gResult.meetingDate;
      scoreImpact = gResult.leadScoreImpact || 15;
      completed = gResult.completed || false;
    } else {
      // Fallback
      const fResult = fallbackAiAnswer(session.clientName, text, session.messages);
      responseText = fResult.responseText;
      extractedBudget = fResult.extractedBudget;
      extractedTimeline = fResult.extractedTimeline;
      extractedService = fResult.extractedService;
      meetingDate = fResult.meetingDate;
      scoreImpact = fResult.leadScoreImpact;
      completed = fResult.completed;
    }
  } catch (error) {
    console.error('Gemini error encountered, triggering fallback mechanism:', error);
    isAiSimulation = true;
    const fResult = fallbackAiAnswer(session.clientName, text, session.messages);
    responseText = fResult.responseText;
    extractedBudget = fResult.extractedBudget;
    extractedTimeline = fResult.extractedTimeline;
    extractedService = fResult.extractedService;
    meetingDate = fResult.meetingDate;
    scoreImpact = fResult.leadScoreImpact;
    completed = fResult.completed;
  }

  // 3. Add AI reply
  const aiMessage = {
    sender: 'ai' as const,
    text: responseText,
    timestamp: new Date().toISOString()
  };
  session.messages.push(aiMessage);

  // 4. If completed, transition states and compile report card
  if (completed || session.messages.length > 12) {
    session.status = 'completed';
    session.endTime = new Date().toISOString();

    const client = clients.find(c => c.id === session.clientId);
    const finalScore = Math.min(100, Math.max(30, Math.floor(scoreImpact + (extractedBudget ? 30 : 0) + (extractedService ? 25 : 0) + (meetingDate ? 25 : 0))));

    // Determine values with sensible fallbacks
    const budgetVal = extractedBudget || '$1,500';
    const timelineVal = extractedTimeline || '1-2 Months';
    const recommendedServiceVal = extractedService || 'Business Website ($1,200)';

    const newReport = {
      id: `r${reports.length + 1}`,
      clientId: session.clientId,
      clientName: session.clientName,
      clientEmail: client?.email || 'sales@client.com',
      clientPhone: client?.phone || '+92 300 0000000',
      clientCompany: session.clientCompany || 'Self-Employed',
      summary: `AI voice conversation onboarding completed. Client expressed interest in custom technical layouts matching ${recommendedServiceVal}. Session duration details saved in archives.`,
      budget: budgetVal,
      timeline: timelineVal,
      recommendedService: recommendedServiceVal,
      leadScore: finalScore,
      createdAt: new Date().toISOString(),
      meetingDate: meetingDate || 'Scheduled (Check with consultant)'
    };

    reports.unshift(newReport); // Prepend to show up first in lead pipeline
  }

  res.json({
    success: true,
    responseText,
    isAiSimulation,
    completed,
    extractedParams: {
      budget: extractedBudget,
      timeline: extractedTimeline,
      service: extractedService,
      meetingDate
    },
    currentSessionStatus: session.status
  });
});

// Serve frontend assets
if (process.env.NODE_ENV !== 'production') {
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  }).then((vite) => {
    app.use(vite.middlewares);
    // Listen directly on PORT
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server launched successfully at http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running at http://localhost:${PORT}`);
  });
}
