import { X, MapPin } from 'lucide-react';
import { EnvironmentalReport } from '../types';
import StatusTracker from './StatusTracker';
import { SeverityBadge } from './StatusBadge';

interface PublicReportModalProps {
  report: EnvironmentalReport | null;
  onClose: () => void;
}

export default function PublicReportModal({ report, onClose }: PublicReportModalProps) {
  if (!report) return null;

  return (
    <div
      id="public-report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#17201B]/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="public-report-modal"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl border border-[#DCE5DE] shadow-2xl overflow-hidden animate-in fade-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE5DE] bg-[#F7F9F5] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-extrabold px-3 py-1 bg-[#174A35] text-white rounded-xl shadow-2xs">
              {report.issueId}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border border-[#DCE5DE] bg-white text-[#17201B]">
              {report.category}
            </span>
          </div>
          <button
            id="btn-close-public-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#65736A] hover:text-[#17201B] hover:bg-[#DCE5DE]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Tracker */}
          <div className="p-5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
            <span className="text-xs font-bold text-[#174A35] uppercase tracking-wider block mb-2">
              REAL-TIME RESOLUTION PROGRESS
            </span>
            <StatusTracker status={report.status} rejectedReason={report.rejectedReason} />
          </div>

          {/* Admin updates notes if available */}
          {report.adminNotes && (
            <div className="p-4 rounded-xl border border-[#C8E2CE] bg-[#EAF4EC]/40">
              <span className="text-[11px] font-bold text-[#174A35] uppercase tracking-wider block mb-1">
                LATEST AUTHORITY UPDATE NOTE
              </span>
              <p className="text-xs text-[#17201B] leading-relaxed font-medium">
                {report.adminNotes}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
              <span className="text-[10px] font-semibold text-[#65736A] uppercase">SUBMITTED BY</span>
              <p className="text-xs font-bold text-[#17201B] mt-0.5">{report.reporterName}</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
              <span className="text-[10px] font-semibold text-[#65736A] uppercase">SEVERITY LEVEL</span>
              <div className="mt-1">
                <SeverityBadge severity={report.severity} isEmergency={report.isEmergency} />
              </div>
            </div>
            <div className="p-3.5 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5]">
              <span className="text-[10px] font-semibold text-[#65736A] uppercase">SUBMITTED ON</span>
              <p className="text-xs font-semibold text-[#17201B] mt-0.5">
                {new Date(report.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-xs font-semibold text-[#65736A] uppercase tracking-wider block mb-1">
              REPORT DESCRIPTION
            </span>
            <p className="p-4 rounded-2xl border border-[#DCE5DE] bg-white text-xs sm:text-sm text-[#17201B] leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Uploaded Evidence Image */}
          {report.imageUrl && (
            <div>
              <span className="text-xs font-semibold text-[#65736A] uppercase tracking-wider block mb-1">
                ATTACHED EVIDENCE
              </span>
              <div className="rounded-2xl border border-[#DCE5DE] overflow-hidden bg-[#F7F9F5] max-h-72 flex items-center justify-center">
                <img
                  src={report.imageUrl}
                  alt="Report evidence"
                  className="w-full h-full object-contain max-h-72"
                />
              </div>
            </div>
          )}

          {/* Location details */}
          <div className="p-4 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5] text-xs flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#2F7D4A] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#17201B] uppercase text-[10px] block">REPORT LOCATION</span>
              <span className="text-[#65736A] font-medium">{report.locationText}</span>
              {report.latitude && report.longitude && (
                <div className="text-[11px] text-[#65736A] font-mono mt-0.5">
                  GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE5DE] bg-[#F7F9F5] flex justify-end shrink-0">
          <button
            id="btn-close-public-report"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
