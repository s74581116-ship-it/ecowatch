import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialization for Gemini AI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Persistent Storage File
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'reports.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Demo Reports as requested in Section 28
const initialDemoReports = [
  {
    id: 'ENV-2026-00001',
    issueId: 'ENV-2026-00001',
    reporterName: 'Ananya Sharma',
    phoneNumber: '+919876543210',
    category: 'Injured Animal',
    description: 'Found a stray deer with a leg injury near the peripheral village road edge. Unable to move properly.',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    latitude: 28.6139,
    longitude: 77.2090,
    locationText: 'Sector 4, Greenbelt Road, New Delhi',
    isEmergency: true,
    aiAnalysis: {
      possibleIssue: 'Injured Wildlife / Stray Deer',
      severity: 'HIGH',
      observations: [
        'Visible difficulty in mobility',
        'Located near high traffic roadway',
        'Immediate veterinary forest guard intervention advised'
      ],
      suggestedCategory: 'Injured Animal',
      confidenceNotes: 'Visual indication of acute limb trauma. Animal rescue team dispatch recommended.'
    },
    aiSuggestedSeverity: 'HIGH',
    severity: 'HIGH',
    status: 'PENDING',
    adminNotes: 'Forest wildlife rescue unit notified at 08:30 AM.',
    isDemo: true,
    createdAt: '2026-09-20T08:15:00.000Z',
    updatedAt: '2026-09-20T08:30:00.000Z'
  },
  {
    id: 'ENV-2026-00002',
    issueId: 'ENV-2026-00002',
    reporterName: 'Rajesh K.',
    phoneNumber: '+919812345678',
    category: 'Water Pollution',
    description: 'Industrial sludge and dark colored wastewater draining into the canal behind Industrial Phase 2.',
    imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
    latitude: 19.0760,
    longitude: 72.8777,
    locationText: 'East Canal Culvert, Mithi River basin, Mumbai',
    isEmergency: false,
    aiAnalysis: {
      possibleIssue: 'Industrial Wastewater Discharge',
      severity: 'HIGH',
      observations: [
        'Dark black and oily discoloration of surface water',
        'Odor and foam formation along shoreline',
        'Risk of downstream water body contamination'
      ],
      suggestedCategory: 'Water Pollution',
      confidenceNotes: 'Appears to show untreated effluent release. Laboratory water sample analysis needed.'
    },
    aiSuggestedSeverity: 'HIGH',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    adminNotes: 'Field officer dispatched for water sample collection.',
    isDemo: true,
    createdAt: '2026-09-21T10:45:00.000Z',
    updatedAt: '2026-09-21T14:20:00.000Z'
  },
  {
    id: 'ENV-2026-00003',
    issueId: 'ENV-2026-00003',
    reporterName: 'Pooja Iyer',
    phoneNumber: '+919900112233',
    category: 'Waste Dumping',
    description: 'Illegal dumping of plastic waste, old tyres and debris in the vacant municipal wetland plot.',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    latitude: 12.9716,
    longitude: 77.5946,
    locationText: 'Near Bellandur lake feeder road, Bengaluru',
    isEmergency: false,
    aiAnalysis: {
      possibleIssue: 'Illegal Solid Waste & Plastic Dumping',
      severity: 'MEDIUM',
      observations: [
        'Extensive non-biodegradable debris accumulation',
        'Risk of leachate entering surrounding soil',
        'Clogging of natural drainage path'
      ],
      suggestedCategory: 'Waste Dumping',
      confidenceNotes: 'Visual indication of municipal solid waste accumulation.'
    },
    aiSuggestedSeverity: 'MEDIUM',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    adminNotes: 'Municipal sanitation division cleared the site with 2 backhoes on Sept 21. Signage installed.',
    isDemo: true,
    createdAt: '2026-09-19T09:00:00.000Z',
    updatedAt: '2026-09-21T16:00:00.000Z'
  },
  {
    id: 'ENV-2026-00004',
    issueId: 'ENV-2026-00004',
    reporterName: 'Vikramaditya Roy',
    phoneNumber: '+919748012345',
    category: 'Forest Fire',
    description: 'Rapidly spreading brush fire on the ridge hill slope near forest checkpoint 3. Heavy smoke.',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    latitude: 30.3165,
    longitude: 78.0322,
    locationText: 'Rajaji Foothill Sector 7, Dehradun',
    isEmergency: true,
    aiAnalysis: {
      possibleIssue: 'Active Wildfire / Forest Brush Fire',
      severity: 'CRITICAL',
      observations: [
        'Dense billowing grey smoke visible across timber line',
        'Active burning flame front along the ridge',
        'Wind direction threatening nearby forest habitation'
      ],
      suggestedCategory: 'Forest Fire',
      confidenceNotes: 'Appears to show severe active vegetation fire. Immediate fire brigade response triggered.'
    },
    aiSuggestedSeverity: 'CRITICAL',
    severity: 'CRITICAL',
    status: 'ACTION TAKEN',
    adminNotes: 'State forest fire response team and 2 fire tenders engaged. Controlled firebreaks created.',
    isDemo: true,
    createdAt: '2026-09-22T04:30:00.000Z',
    updatedAt: '2026-09-22T06:15:00.000Z'
  }
];

// In-Memory & File Cache
let reports: any[] = [];

function loadReports() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      reports = JSON.parse(data);
    } else {
      reports = [...initialDemoReports];
      saveReports();
    }
  } catch (err) {
    console.error('Error loading reports file, using in-memory demo data:', err);
    reports = [...initialDemoReports];
  }
}

function saveReports() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reports to file:', err);
  }
}

loadReports();

// Helper: Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Generate Issue ID
function generateIssueId(): string {
  const currentYear = new Date().getFullYear();
  // Find highest current sequence number for current year
  const prefix = `ENV-${currentYear}-`;
  let maxSeq = 400;
  for (const r of reports) {
    if (r.issueId && r.issueId.startsWith(prefix)) {
      const numPart = parseInt(r.issueId.substring(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
}

/* ============================================================
   API ENDPOINTS
   ============================================================ */

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'EcoWatch API', timestamp: new Date().toISOString() });
});

// 2. Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === 'Admin' && password === 'Admin123') {
    res.json({
      success: true,
      token: 'ecowatch-auth-admin-token-' + Date.now(),
      user: {
        username: 'Admin',
        role: 'Environmental Institute Authority',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid username or password.',
    });
  }
});

// 3. Get all reports with optional filters
app.get('/api/reports', (req: Request, res: Response) => {
  const { status, category, severity, emergency, search, reporterName, phoneNumber, issueId } = req.query;

  let filtered = [...reports];

  if (issueId) {
    filtered = filtered.filter(
      (r) => r.issueId.toLowerCase() === String(issueId).trim().toLowerCase()
    );
  }

  if (phoneNumber) {
    const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
    filtered = filtered.filter((r) => {
      const rPhone = String(r.phoneNumber || '').replace(/[^0-9]/g, '');
      return rPhone.endsWith(cleanPhone) || cleanPhone.endsWith(rPhone);
    });
  }

  if (reporterName) {
    const nameQuery = String(reporterName).toLowerCase().trim();
    filtered = filtered.filter((r) =>
      r.reporterName.toLowerCase().includes(nameQuery)
    );
  }

  if (status && status !== 'All') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (category && category !== 'All') {
    filtered = filtered.filter((r) => r.category === category);
  }

  if (severity && severity !== 'All') {
    filtered = filtered.filter((r) => r.severity === severity);
  }

  if (emergency && emergency !== 'All') {
    const isEmerg = emergency === 'Emergency';
    filtered = filtered.filter((r) => r.isEmergency === isEmerg);
  }

  if (search) {
    const query = String(search).toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.issueId.toLowerCase().includes(query) ||
        r.reporterName.toLowerCase().includes(query) ||
        (r.locationText && r.locationText.toLowerCase().includes(query)) ||
        (r.description && r.description.toLowerCase().includes(query))
    );
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, count: filtered.length, reports: filtered });
});

// 4. Get single report by ID or issueId
app.get('/api/reports/:id', (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id || r.issueId === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }
  res.json({ success: true, report });
});

// 5. Submit new report
app.post('/api/reports', (req: Request, res: Response) => {
  const {
    reporterName,
    phoneNumber,
    category,
    description,
    imageUrl,
    latitude,
    longitude,
    locationText,
    isEmergency,
    aiAnalysis,
    aiSuggestedSeverity,
    severity,
  } = req.body;

  // Validation
  if (!reporterName || reporterName.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Valid reporter name is required (at least 2 characters).' });
  }

  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number is required.' });
  }

  // Indian phone validation
  const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
  const indianPhoneRegex = /^(\+91[6-9]\d{9}|0?[6-9]\d{9})$/;
  if (!indianPhoneRegex.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid 10-digit Indian phone number (or +91 format).',
    });
  }

  if (!description || description.trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Detailed description is required.' });
  }

  if (!imageUrl) {
    return res.status(400).json({ success: false, error: 'Issue photograph is required.' });
  }

  // Generate unique Issue ID (ENV-YYYY-XXXXX)
  const issueId = generateIssueId();

  // Duplicate report detection
  let duplicateWarning = '';
  if (latitude !== null && longitude !== null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
    const lat = Number(latitude);
    const lon = Number(longitude);
    for (const r of reports) {
      if (r.latitude && r.longitude) {
        const dist = calculateDistanceKm(lat, lon, r.latitude, r.longitude);
        if (dist <= 2.0 && (r.category === category || r.status !== 'RESOLVED')) {
          duplicateWarning = `This issue may be related to: ${r.issueId} (${r.category} reported ${dist.toFixed(1)} km away).`;
          break;
        }
      }
    }
  }

  const determinedSeverity = severity || aiSuggestedSeverity || (isEmergency ? 'CRITICAL' : 'MEDIUM');

  const newReport = {
    id: issueId,
    issueId,
    reporterName: reporterName.trim(),
    phoneNumber: cleanPhone,
    category: category || 'Other Environmental Issue',
    description: description.trim(),
    imageUrl,
    latitude: latitude !== null && latitude !== undefined ? Number(latitude) : null,
    longitude: longitude !== null && longitude !== undefined ? Number(longitude) : null,
    locationText: locationText || 'Location details provided',
    isEmergency: Boolean(isEmergency),
    aiAnalysis: aiAnalysis || null,
    aiSuggestedSeverity: aiSuggestedSeverity || (isEmergency ? 'CRITICAL' : 'MEDIUM'),
    severity: determinedSeverity,
    status: 'PENDING',
    adminNotes: '',
    duplicateWarning: duplicateWarning || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reports.unshift(newReport);
  saveReports();

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully.',
    report: newReport,
  });
});

// 6. Update report status / admin notes (Admin)
app.patch('/api/reports/:id', (req: Request, res: Response) => {
  const reportIndex = reports.findIndex((r) => r.id === req.params.id || r.issueId === req.params.id);
  if (reportIndex === -1) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }

  const existing = reports[reportIndex];
  const { status, adminNotes, severity, rejectedReason } = req.body;

  const validStatuses = ['PENDING', 'UNDER REVIEW', 'INVESTIGATING', 'ACTION TAKEN', 'RESOLVED', 'REJECTED'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid report status.' });
  }

  const updated = {
    ...existing,
    status: status !== undefined ? status : existing.status,
    adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
    severity: severity !== undefined ? severity : existing.severity,
    rejectedReason: rejectedReason !== undefined ? rejectedReason : existing.rejectedReason,
    updatedAt: new Date().toISOString(),
  };

  reports[reportIndex] = updated;
  saveReports();

  res.json({
    success: true,
    message: 'Report updated successfully.',
    report: updated,
  });
});

// 7. Gemini Image Analysis Endpoint
app.post('/api/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', description = '', category = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image data is required for analysis.' });
    }

    // Strip data prefix if present (e.g., data:image/jpeg;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const ai = getGeminiClient();

    if (!ai) {
      // Deterministic realistic fallback analysis if API key is not yet set
      const fallbackAnalysis = {
        possibleIssue: category || 'Observed Environmental Disturbance',
        severity: 'MEDIUM',
        observations: [
          'Visual indication of environmental impact in uploaded media',
          'Awaiting on-site field team verification',
          'Photo logged for administrative review'
        ],
        suggestedCategory: category || 'Other Environmental Issue',
        confidenceNotes: 'Appears to show visual indicators of local environmental disturbance. Note: This AI analysis serves as an assistance tool, not a definitive scientific proof.'
      };
      return res.json({
        success: true,
        analysis: fallbackAnalysis,
        provider: 'local-assistance-mode',
      });
    }

    const promptText = `
You are an environmental assessment assistant for the platform EcoWatch.
Analyze this user-uploaded photograph and reported description: "${description}".
Reported category context: "${category}".

IMPORTANT GUIDELINE:
- The AI must NOT claim that an image proves something scientifically if it cannot determine it.
- Use cautious wording such as "Possible", "Appears to show", "Visual indication".
- The AI result should be treated as an assistance tool, not a final decision.

Please evaluate:
1. possibleIssue: A brief descriptive title (e.g. "Possible Water Contamination", "Visual Indication of Plastic Dumping")
2. severity: One of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
3. observations: An array of 3 to 4 concise bullet observations describing what is visually discernible in the photo.
4. suggestedCategory: Must be one of:
   - "Injured Animal"
   - "Water Pollution"
   - "Forest Fire"
   - "Waste Dumping"
   - "Air Pollution"
   - "Damaged / Fallen Tree"
   - "Chemical / Oil Leak"
   - "Other Environmental Issue"
5. confidenceNotes: A 1-2 sentence assessment emphasizing this is an assistance tool.

Respond with ONLY valid JSON adhering to:
{
  "possibleIssue": string,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "observations": string[],
  "suggestedCategory": string,
  "confidenceNotes": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText.trim());
    } catch {
      analysisResult = {
        possibleIssue: category || 'Environmental Anomaly',
        severity: 'MEDIUM',
        observations: [
          'Visual confirmation of reported area',
          'Field assessment recommended to evaluate intensity'
        ],
        suggestedCategory: category || 'Other Environmental Issue',
        confidenceNotes: 'Appears to show environmental factors requiring authority review.'
      };
    }

    return res.json({
      success: true,
      analysis: analysisResult,
      provider: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Error during Gemini image analysis:', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to complete AI analysis at this time. Please review manually.',
    });
  }
});

// 8. Admin AI Environment Assistant Endpoint
app.post('/api/admin/assistant', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }

    // Prepare contextual report summary for the AI
    const totalCount = reports.length;
    const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
    const underReviewCount = reports.filter((r) => r.status === 'UNDER REVIEW').length;
    const investigatingCount = reports.filter((r) => r.status === 'INVESTIGATING').length;
    const actionTakenCount = reports.filter((r) => r.status === 'ACTION TAKEN').length;
    const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
    const emergencyCount = reports.filter((r) => r.isEmergency).length;

    const reportsSummary = reports.map((r) => ({
      id: r.issueId,
      category: r.category,
      severity: r.severity,
      status: r.status,
      emergency: r.isEmergency,
      reporter: r.reporterName,
      location: r.locationText,
      description: r.description,
      date: r.createdAt.substring(0, 10),
    }));

    const ai = getGeminiClient();

    if (!ai) {
      // Rule-based helpful response if Gemini API key is missing
      const qLower = question.toLowerCase();
      let answer = '';

      if (qLower.includes('emergency')) {
        const emergencies = reports.filter((r) => r.isEmergency);
        answer = `There are currently **${emergencies.length}** emergency environmental report(s) on file:\n` +
          emergencies.map((e) => `- **${e.issueId}** [${e.category} | ${e.severity}]: ${e.description} (Status: ${e.status}, Location: ${e.locationText})`).join('\n');
      } else if (qLower.includes('forest fire')) {
        const fires = reports.filter((r) => r.category === 'Forest Fire');
        answer = `There are **${fires.length}** Forest Fire report(s):\n` +
          fires.map((f) => `- **${f.issueId}**: ${f.description} (Status: ${f.status}, Severity: ${f.severity})`).join('\n');
      } else if (qLower.includes('water pollution')) {
        const water = reports.filter((r) => r.category === 'Water Pollution');
        answer = `There are **${water.length}** Water Pollution report(s):\n` +
          water.map((w) => `- **${w.issueId}**: ${w.description} (Status: ${w.status}, Severity: ${w.severity})`).join('\n');
      } else if (qLower.includes('pending') || qLower.includes('unresolved')) {
        const pending = reports.filter((r) => r.status === 'PENDING');
        answer = `There are **${pending.length}** report(s) currently marked as PENDING awaiting authority triage:\n` +
          pending.map((p) => `- **${p.issueId}** [${p.category}]: ${p.description}`).join('\n');
      } else {
        answer = `**EcoWatch Database Overview:**\n- Total Reports: ${totalCount}\n- Pending: ${pendingCount}\n- Under Review: ${underReviewCount}\n- Investigating: ${investigatingCount}\n- Action Taken: ${actionTakenCount}\n- Resolved: ${resolvedCount}\n- Emergencies: ${emergencyCount}\n\nPlease ask a specific query regarding categories, locations, or severity to review details.`;
      }

      return res.json({ success: true, answer, provider: 'local-assistant' });
    }

    const systemInstruction = `
You are the EcoWatch AI Environment Assistant for municipal authorities and environmental institutes.
Your purpose is to answer administrative questions accurately based strictly on the current live report database.
CRITICAL RULES:
- Only cite actual reports from the provided data.
- Do NOT make up reports.
- Do NOT claim authority to alter records or change statuses yourself (only human admins can).
- Be concise, professional, and use clean markdown with bullet points.
`;

    const prompt = `
Live Report Database Summary:
- Total Reports: ${totalCount}
- Status Breakdown: PENDING=${pendingCount}, UNDER REVIEW=${underReviewCount}, INVESTIGATING=${investigatingCount}, ACTION TAKEN=${actionTakenCount}, RESOLVED=${resolvedCount}
- Emergency Reports: ${emergencyCount}

Recent Reports List:
${JSON.stringify(reportsSummary, null, 2)}

User Question:
"${question}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({
      success: true,
      answer: response.text || 'No response generated.',
      provider: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Error in Admin AI Assistant:', err);
    res.status(500).json({
      success: false,
      error: 'Error processing your assistant query.',
    });
  }
});

/* ============================================================
   VITE MIDDLEWARE (Development) & STATIC SERVING (Production)
   ============================================================ */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoWatch Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
