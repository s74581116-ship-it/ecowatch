import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from './firebase';
import { EnvironmentalReport, ReportSeverity, ReportStatus } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial baseline demo reports
export const INITIAL_DEMO_REPORTS: EnvironmentalReport[] = [
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
        'Immediate veterinary forest guard intervention advised',
      ],
      suggestedCategory: 'Injured Animal',
      confidenceNotes: 'Visual indication of acute limb trauma. Animal rescue team dispatch recommended.',
    },
    aiSuggestedSeverity: 'HIGH',
    severity: 'HIGH',
    status: 'PENDING',
    adminNotes: 'Forest wildlife rescue unit notified at 08:30 AM.',
    isDemo: true,
    createdAt: '2026-09-20T08:15:00.000Z',
    updatedAt: '2026-09-20T08:30:00.000Z',
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
        'Risk of downstream water body contamination',
      ],
      suggestedCategory: 'Water Pollution',
      confidenceNotes: 'Appears to show untreated effluent release. Laboratory water sample analysis needed.',
    },
    aiSuggestedSeverity: 'HIGH',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    adminNotes: 'Field officer dispatched for water sample collection.',
    isDemo: true,
    createdAt: '2026-09-21T10:45:00.000Z',
    updatedAt: '2026-09-21T14:20:00.000Z',
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
        'Clogging of natural drainage path',
      ],
      suggestedCategory: 'Waste Dumping',
      confidenceNotes: 'Visual indication of municipal solid waste accumulation.',
    },
    aiSuggestedSeverity: 'MEDIUM',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    adminNotes: 'Municipal sanitation division cleared the site with 2 backhoes on Sept 21. Signage installed.',
    isDemo: true,
    createdAt: '2026-09-19T09:00:00.000Z',
    updatedAt: '2026-09-21T16:00:00.000Z',
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
        'Wind direction threatening nearby forest habitation',
      ],
      suggestedCategory: 'Forest Fire',
      confidenceNotes: 'Appears to show severe active vegetation fire. Immediate fire brigade response triggered.',
    },
    aiSuggestedSeverity: 'CRITICAL',
    severity: 'CRITICAL',
    status: 'ACTION TAKEN',
    adminNotes: 'State forest fire response team and 2 fire tenders engaged. Controlled firebreaks created.',
    isDemo: true,
    createdAt: '2026-09-22T04:30:00.000Z',
    updatedAt: '2026-09-22T06:15:00.000Z',
  },
];

// Local Storage Fallback Cache Helper
const LOCAL_STORAGE_KEY = 'ecowatch_reports_cache';

function getLocalReports(): EnvironmentalReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return [...INITIAL_DEMO_REPORTS];
}

function saveLocalReports(reports: EnvironmentalReport[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

// Distance helper
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

// Generate Issue ID: ENV-YYYY-XXXXX
export function generateIssueId(existingReports: EnvironmentalReport[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `ENV-${currentYear}-`;
  let maxSeq = 400;

  for (const r of existingReports) {
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

/**
 * Fetch all reports from Firestore (or Local Fallback)
 */
export async function fetchAllReports(): Promise<EnvironmentalReport[]> {
  // If Firebase is configured and Firestore is available:
  if (isFirebaseConfigured && db) {
    const colPath = 'reports';
    try {
      const q = query(collection(db, colPath), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Auto-seed baseline demo reports into Firestore
        for (const rep of INITIAL_DEMO_REPORTS) {
          await setDoc(doc(db, colPath, rep.id), rep);
        }
        return [...INITIAL_DEMO_REPORTS];
      }

      const results: EnvironmentalReport[] = [];
      snapshot.forEach((docSnap) => {
        results.push(docSnap.data() as EnvironmentalReport);
      });
      saveLocalReports(results);
      return results;
    } catch (err) {
      console.warn('Firestore fetch failed, checking server API or local cache:', err);
    }
  }

  // Check if local Express API server is active
  try {
    const apiRes = await fetch('/api/reports');
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && Array.isArray(data.reports)) {
        saveLocalReports(data.reports);
        return data.reports;
      }
    }
  } catch {
    // API server not present (e.g. running purely as static SPA on Firebase Hosting)
  }

  // Fallback to LocalStorage
  return getLocalReports();
}

/**
 * Real-time subscription to reports
 */
export function subscribeToReports(
  callback: (reports: EnvironmentalReport[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const colPath = 'reports';
    try {
      const q = query(collection(db, colPath), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const reports: EnvironmentalReport[] = [];
            snapshot.forEach((d) => reports.push(d.data() as EnvironmentalReport));
            saveLocalReports(reports);
            callback(reports);
          } else {
            callback(getLocalReports());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, colPath);
        }
      );
    } catch (e) {
      console.warn('Real-time listener setup error:', e);
    }
  }

  // No Firestore listener available; return no-op cleanup
  return () => {};
}

/**
 * Create and submit a new environmental report
 */
export async function createReport(
  reportInput: {
    reporterName: string;
    phoneNumber: string;
    category: any;
    description: string;
    imageUrl: string;
    latitude: number | null;
    longitude: number | null;
    locationText: string;
    isEmergency: boolean;
    aiAnalysis: any;
    aiSuggestedSeverity?: ReportSeverity;
    severity?: ReportSeverity;
  }
): Promise<EnvironmentalReport> {
  const currentList = getLocalReports();
  const issueId = generateIssueId(currentList);

  // Check for duplicates within 2km
  let duplicateWarning = '';
  if (reportInput.latitude !== null && reportInput.longitude !== null) {
    const lat = reportInput.latitude;
    const lng = reportInput.longitude;
    for (const r of currentList) {
      if (r.latitude && r.longitude) {
        const dist = calculateDistanceKm(lat, lng, r.latitude, r.longitude);
        if (dist <= 2.0 && (r.category === reportInput.category || r.status !== 'RESOLVED')) {
          duplicateWarning = `This issue may be related to: ${r.issueId} (${r.category} reported ${dist.toFixed(1)} km away).`;
          break;
        }
      }
    }
  }

  const determinedSeverity: ReportSeverity =
    reportInput.severity ||
    reportInput.aiSuggestedSeverity ||
    (reportInput.isEmergency ? 'CRITICAL' : 'MEDIUM');

  const nowIso = new Date().toISOString();

  const newReport: EnvironmentalReport = {
    id: issueId,
    issueId,
    reporterName: reportInput.reporterName.trim(),
    phoneNumber: reportInput.phoneNumber.trim(),
    category: reportInput.category,
    description: reportInput.description.trim(),
    imageUrl: reportInput.imageUrl,
    latitude: reportInput.latitude,
    longitude: reportInput.longitude,
    locationText: reportInput.locationText,
    isEmergency: reportInput.isEmergency,
    aiAnalysis: reportInput.aiAnalysis || null,
    aiSuggestedSeverity: reportInput.aiSuggestedSeverity || determinedSeverity,
    severity: determinedSeverity,
    status: 'PENDING',
    adminNotes: '',
    duplicateWarning: duplicateWarning || undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 1. Try Firestore if configured
  if (isFirebaseConfigured && db) {
    const docPath = `reports/${issueId}`;
    try {
      await setDoc(doc(db, 'reports', issueId), newReport);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  } else {
    // 2. Try backend API server
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          return data.report;
        }
      }
    } catch {
      // Offline / purely static mode
    }
  }

  // 3. Update local cache
  const updatedList = [newReport, ...currentList];
  saveLocalReports(updatedList);
  return newReport;
}

/**
 * Update report status / severity / notes (Admin)
 */
export async function updateReport(
  id: string,
  updates: Partial<EnvironmentalReport>
): Promise<EnvironmentalReport> {
  const currentList = getLocalReports();
  const existing = currentList.find((r) => r.id === id || r.issueId === id);

  const updated: EnvironmentalReport = {
    ...(existing || ({} as EnvironmentalReport)),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    const docPath = `reports/${id}`;
    try {
      await updateDoc(doc(db, 'reports', id), {
        ...updates,
        updatedAt: updated.updatedAt,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  } else {
    // Try backend API
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {
      // Offline mode
    }
  }

  // Save to local cache
  const newList = currentList.map((r) => (r.id === id || r.issueId === id ? updated : r));
  saveLocalReports(newList);
  return updated;
}
