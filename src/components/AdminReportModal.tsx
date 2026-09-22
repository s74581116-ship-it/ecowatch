import { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Phone,
  User,
  AlertTriangle,
  Sparkles,
  Save,
  CheckCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { EnvironmentalReport, ReportSeverity, ReportStatus } from '../types';
import LeafletMap from './LeafletMap';
import { StatusBadge, SeverityBadge } from './StatusBadge';

interface AdminReportModalProps {
  report: EnvironmentalReport | null;
  onClose: () => void;
  onSave: (updatedReport: EnvironmentalReport) => Promise<void>;
}

export default function AdminReportModal({ report, onClose, onSave }: AdminReportModalProps) {
  if (!report) return null;

  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [severity, setSeverity] = useState<ReportSeverity>(report.severity);
  const [adminNotes, setAdminNotes] = useState<string>(report.adminNotes || '');
  const [rejectedReason, setRejectedReason] = useState<string>(report.rejectedReason || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated: EnvironmentalReport = {
        ...report,
        status,
        severity,
        adminNotes,
        rejectedReason: status === 'REJECTED' ? rejectedReason : undefined,
        updatedAt: new Date().toISOString(),
      };
      await onSave(updated);
      setFeedback({ type: 'success', message: 'Report updated and changes saved to database.' });
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="admin-report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#17201B]/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="admin-report-modal"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-[#DCE5DE] shadow-2xl overflow-hidden animate-in fade-in duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE5DE] bg-[#F7F9F5] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-extrabold px-3 py-1 bg-[#174A35] text-white rounded-xl shadow-2xs">
              {report.issueId}
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
              {report.isEmergency && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FDF2F2] text-[#9B1C1C] border border-[#F9C5C5]">
                  <ShieldAlert className="w-3.5 h-3.5" /> Emergency
                </span>
              )}
            </div>
          </div>
          <button
            id="btn-close-admin-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#65736A] hover:text-[#17201B] hover:bg-[#DCE5DE]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-[#EAF4EC] border-[#C8E2CE] text-[#174A35]'
                  : 'bg-[#FDF2F2] border-[#F9C5C5] text-[#9B1C1C]'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Duplicate Warning Alert if present */}
          {report.duplicateWarning && (
            <div className="p-3.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] flex items-start gap-2.5 text-xs text-[#92400E]">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Possible duplicate report detected:</strong>
                <p className="mt-0.5 text-[#B45309]">{report.duplicateWarning}</p>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
              <span className="text-[11px] font-semibold text-[#65736A] uppercase tracking-wider">CATEGORY</span>
              <p className="text-sm font-bold text-[#17201B] mt-1">{report.category}</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
              <span className="text-[11px] font-semibold text-[#65736A] uppercase tracking-wider">SEVERITY</span>
              <div className="mt-1">
                <SeverityBadge severity={report.severity} isEmergency={report.isEmergency} />
              </div>
            </div>
            <div className="p-3.5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
              <span className="text-[11px] font-semibold text-[#65736A] uppercase tracking-wider">EMERGENCY</span>
              <p className="text-sm font-bold text-[#17201B] mt-1">{report.isEmergency ? 'YES' : 'NO'}</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
              <span className="text-[11px] font-semibold text-[#65736A] uppercase tracking-wider">SUBMITTED ON</span>
              <p className="text-xs font-semibold text-[#17201B] mt-1">
                {new Date(report.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Reporter & Contact Details */}
          <div className="p-4 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EAF4EC] text-[#174A35] shrink-0 border border-[#DCE5DE]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#65736A] uppercase">REPORTER</span>
                <p className="text-sm font-bold text-[#17201B]">{report.reporterName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EAF4EC] text-[#174A35] shrink-0 border border-[#DCE5DE]">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#65736A] uppercase">PHONE CONTACT</span>
                <p className="text-sm font-mono font-semibold text-[#17201B]">{report.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EAF4EC] text-[#174A35] shrink-0 border border-[#DCE5DE]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#65736A] uppercase">LAST UPDATED</span>
                <p className="text-xs font-semibold text-[#65736A]">
                  {new Date(report.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-[#65736A] uppercase tracking-wider mb-2">DESCRIPTION</h4>
            <div className="p-4 rounded-2xl border border-[#DCE5DE] bg-white text-sm text-[#17201B] leading-relaxed font-normal">
              {report.description}
            </div>
          </div>

          {/* Evidence Image */}
          {report.imageUrl && (
            <div>
              <h4 className="text-xs font-bold text-[#65736A] uppercase tracking-wider mb-2">
                UPLOADED EVIDENCE PHOTOGRAPH
              </h4>
              <div className="rounded-2xl border border-[#DCE5DE] overflow-hidden bg-[#F7F9F5] flex items-center justify-center max-h-[440px]">
                <img
                  src={report.imageUrl}
                  alt={`Evidence for ${report.issueId}`}
                  className="w-full h-full object-contain max-h-[440px]"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* AI Analysis Section */}
          {report.aiAnalysis && (
            <div className="p-5 rounded-2xl border border-[#C8E2CE] bg-[#EAF4EC]/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#174A35]" />
                <h4 className="text-xs font-bold text-[#174A35] uppercase tracking-wider">
                  GEMINI AI ANALYSIS SUMMARY
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-white rounded-xl border border-[#DCE5DE]">
                  <span className="text-[10px] text-[#65736A] uppercase font-bold">POSSIBLE ISSUE</span>
                  <p className="text-xs font-bold text-[#17201B] mt-0.5">{report.aiAnalysis.possibleIssue}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#DCE5DE]">
                  <span className="text-[10px] text-[#65736A] uppercase font-bold">AI SUGGESTED SEVERITY</span>
                  <p className="text-xs font-bold text-[#17201B] mt-0.5">{report.aiAnalysis.severity}</p>
                </div>
              </div>

              {report.aiAnalysis.observations && report.aiAnalysis.observations.length > 0 && (
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-[#65736A] uppercase">OBSERVATIONS</span>
                  <ul className="mt-1 space-y-1 text-xs text-[#17201B] list-disc list-inside">
                    {report.aiAnalysis.observations.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.aiAnalysis.confidenceNotes && (
                <p className="text-[11px] text-[#65736A] italic mt-2 border-t border-[#DCE5DE] pt-2">
                  {report.aiAnalysis.confidenceNotes}
                </p>
              )}
            </div>
          )}

          {/* Location Details & Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#65736A] uppercase tracking-wider">LOCATION DETAILS</h4>
              {report.latitude && report.longitude && (
                <span className="text-xs font-mono text-[#65736A]">
                  Lat: {report.latitude.toFixed(5)}, Lng: {report.longitude.toFixed(5)}
                </span>
              )}
            </div>
            <div className="p-3 bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-xs text-[#17201B] mb-3 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#2F7D4A] shrink-0 mt-0.5" />
              <span>{report.locationText || 'No physical location notes entered.'}</span>
            </div>

            {report.latitude && report.longitude ? (
              <LeafletMap
                singleLocation={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                  title: `${report.issueId} - ${report.category}`,
                }}
                height="280px"
              />
            ) : (
              <div className="p-6 text-center rounded-xl border border-[#DCE5DE] bg-[#F7F9F5] text-xs text-[#65736A]">
                No GPS coordinates were registered for this report.
              </div>
            )}
          </div>

          {/* Administrative Action Controls */}
          <div className="p-5 rounded-2xl border border-[#2F7D4A] bg-[#EAF4EC]/20 space-y-4">
            <h4 className="text-xs font-bold text-[#174A35] uppercase tracking-wider">
              AUTHORITY REMEDIATION & WORKFLOW CONTROLS
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#17201B] uppercase mb-1">
                  UPDATE STATUS
                </label>
                <select
                  id="admin-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="ACTION TAKEN">ACTION TAKEN</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {/* Severity Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#17201B] uppercase mb-1">
                  ASSIGN SEVERITY LEVEL
                </label>
                <select
                  id="admin-severity-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            {/* Rejection Reason if Rejected */}
            {status === 'REJECTED' && (
              <div>
                <label className="block text-xs font-semibold text-[#B64242] uppercase mb-1">
                  REJECTION REASON (EXPLANATION FOR CITIZEN)
                </label>
                <input
                  id="admin-rejected-reason-input"
                  type="text"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                  placeholder="e.g. Could not be verified on-site / Outside municipal jurisdiction"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#F9C5C5] rounded-xl focus:border-[#B64242] focus:outline-none"
                />
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#17201B] uppercase mb-1">
                ADMIN REMEDIATION NOTES (DISPATCH DETAILS, TEAMS, ACTIONS)
              </label>
              <textarea
                id="admin-notes-textarea"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log internal authority actions, officer dispatch status, contractor details..."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DCE5DE] rounded-xl focus:border-[#174A35] focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="btn-admin-save-changes"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
