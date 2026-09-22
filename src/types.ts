export type ReportCategory =
  | 'Injured Animal'
  | 'Water Pollution'
  | 'Forest Fire'
  | 'Waste Dumping'
  | 'Air Pollution'
  | 'Damaged / Fallen Tree'
  | 'Chemical / Oil Leak'
  | 'Other Environmental Issue';

export type ReportStatus =
  | 'PENDING'
  | 'UNDER REVIEW'
  | 'INVESTIGATING'
  | 'ACTION TAKEN'
  | 'RESOLVED'
  | 'REJECTED';

export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIAnalysisResult {
  possibleIssue: string;
  severity: ReportSeverity;
  observations: string[];
  suggestedCategory: ReportCategory | string;
  confidenceNotes?: string;
}

export interface EnvironmentalReport {
  id: string;
  issueId: string;
  reporterName: string;
  phoneNumber: string;
  category: ReportCategory;
  description: string;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
  locationText: string;
  isEmergency: boolean;
  aiAnalysis: AIAnalysisResult | null;
  aiSuggestedSeverity: ReportSeverity;
  severity: ReportSeverity;
  status: ReportStatus;
  adminNotes: string;
  rejectedReason?: string;
  duplicateWarning?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  underReview: number;
  investigating: number;
  actionTaken: number;
  resolved: number;
  rejected: number;
  emergency: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
}
