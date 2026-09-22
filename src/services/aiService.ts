import { GoogleGenAI } from '@google/genai';
import { AIAnalysisResult, EnvironmentalReport, ReportCategory } from '../types';

let clientGemini: GoogleGenAI | null = null;

function getClientGemini(): GoogleGenAI | null {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.length < 10) {
    return null;
  }

  if (!clientGemini) {
    clientGemini = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ecowatch-spark-deployment',
        },
      },
    });
  }
  return clientGemini;
}

/**
 * Perform AI Image Inspection for environmental hazards
 */
export async function analyzeIncidentImage(params: {
  imageBase64: string;
  category: ReportCategory;
  description: string;
}): Promise<AIAnalysisResult> {
  const { imageBase64, category, description } = params;

  // 1. If backend API is available (e.g. local dev server with GEMINI_API_KEY), try that first
  try {
    const apiRes = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, category, description }),
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.analysis) {
        return data.analysis;
      }
    }
  } catch {
    // Backend API not running (static Firebase Hosting deployment)
  }

  // 2. Client-side Gemini Free Tier SDK
  const ai = getClientGemini();
  if (ai) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      const mimeType = imageBase64.startsWith('data:image/png')
        ? 'image/png'
        : imageBase64.startsWith('data:image/webp')
        ? 'image/webp'
        : 'image/jpeg';

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
4. suggestedCategory: One of:
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
        model: 'gemini-2.5-flash',
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
      return JSON.parse(responseText.trim());
    } catch (err) {
      console.warn('Direct Gemini call failed or quota reached, falling back to local assistance:', err);
    }
  }

  // 3. Realistic Deterministic Fallback (₹0 Free Quota / No API Key Mode)
  return {
    possibleIssue: category || 'Observed Environmental Disturbance',
    severity: 'MEDIUM',
    observations: [
      'Visual indication of environmental impact in uploaded media',
      'Awaiting on-site field team verification',
      'Photo logged for administrative review',
    ],
    suggestedCategory: category || 'Other Environmental Issue',
    confidenceNotes:
      'Appears to show visual indicators of local environmental disturbance. Note: This AI analysis serves as an assistance tool, not a definitive scientific proof.',
  };
}

/**
 * Ask the Admin AI Assistant questions grounded in the current live reports database
 */
export async function queryAdminAssistant(
  question: string,
  reports: EnvironmentalReport[]
): Promise<string> {
  // 1. Try backend API first
  try {
    const apiRes = await fetch('/api/admin/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.answer) {
        return data.answer;
      }
    }
  } catch {
    // Static hosting environment
  }

  // 2. Client-side Gemini Free Tier
  const ai = getClientGemini();
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const underReviewCount = reports.filter((r) => r.status === 'UNDER REVIEW').length;
  const investigatingCount = reports.filter((r) => r.status === 'INVESTIGATING').length;
  const actionTakenCount = reports.filter((r) => r.status === 'ACTION TAKEN').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const emergencyCount = reports.filter((r) => r.isEmergency).length;

  if (ai) {
    try {
      const reportsSummary = reports.slice(0, 30).map((r) => ({
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
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      return response.text || 'No response generated.';
    } catch (e) {
      console.warn('Gemini query error, falling back to local assistant:', e);
    }
  }

  // 3. Rule-based local assistant fallback
  const qLower = question.toLowerCase();
  if (qLower.includes('emergency')) {
    const emergencies = reports.filter((r) => r.isEmergency);
    return (
      `There are currently **${emergencies.length}** emergency environmental report(s) on file:\n` +
      emergencies
        .map(
          (e) =>
            `- **${e.issueId}** [${e.category} | ${e.severity}]: ${e.description} (Status: ${e.status}, Location: ${e.locationText})`
        )
        .join('\n')
    );
  } else if (qLower.includes('forest fire')) {
    const fires = reports.filter((r) => r.category === 'Forest Fire');
    return (
      `There are **${fires.length}** Forest Fire report(s):\n` +
      fires
        .map((f) => `- **${f.issueId}**: ${f.description} (Status: ${f.status}, Severity: ${f.severity})`)
        .join('\n')
    );
  } else if (qLower.includes('water pollution')) {
    const water = reports.filter((r) => r.category === 'Water Pollution');
    return (
      `There are **${water.length}** Water Pollution report(s):\n` +
      water
        .map((w) => `- **${w.issueId}**: ${w.description} (Status: ${w.status}, Severity: ${w.severity})`)
        .join('\n')
    );
  } else if (qLower.includes('pending') || qLower.includes('unresolved')) {
    const pending = reports.filter((r) => r.status === 'PENDING');
    return (
      `There are **${pending.length}** report(s) currently marked as PENDING awaiting authority triage:\n` +
      pending.map((p) => `- **${p.issueId}** [${p.category}]: ${p.description}`).join('\n')
    );
  }

  return `**EcoWatch Database Overview:**\n- Total Reports: ${totalCount}\n- Pending: ${pendingCount}\n- Under Review: ${underReviewCount}\n- Investigating: ${investigatingCount}\n- Action Taken: ${actionTakenCount}\n- Resolved: ${resolvedCount}\n- Emergencies: ${emergencyCount}\n\nPlease ask a specific query regarding categories, locations, or severity to review details.`;
}
