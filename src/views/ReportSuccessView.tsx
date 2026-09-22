import { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EnvironmentalReport } from '../types';

interface ReportSuccessViewProps {
  report: EnvironmentalReport;
  onViewReport: (report: EnvironmentalReport) => void;
  onReportAnother: () => void;
}

export default function ReportSuccessView({
  report,
  onViewReport,
  onReportAnother,
}: ReportSuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.issueId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="report-success-screen" className="w-full max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-[#DCE5DE] p-8 sm:p-10 shadow-sm text-center space-y-6">
        {/* Large Check Icon */}
        <div className="w-18 h-18 rounded-full bg-[#EAF4EC] text-[#2F7D4A] flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="w-10 h-10 stroke-[2.25]" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight">
            Report Submitted Successfully
          </h1>
          <p className="text-sm text-[#65736A] max-w-md mx-auto">
            Thank you for helping protect the environment.
          </p>
        </div>

        {/* Highlighted Issue ID Card */}
        <div className="p-6 rounded-2xl border border-[#DCE5DE] bg-[#F7F9F5] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#65736A]">
            ASSIGNED ISSUE TRACKING ID
          </span>

          <div className="flex items-center justify-center gap-3">
            <span
              id="display-issue-id"
              className="text-2xl sm:text-3xl font-mono font-extrabold text-[#174A35] tracking-wider bg-white px-5 py-2.5 rounded-xl border border-[#DCE5DE] shadow-2xs"
            >
              {report.issueId}
            </span>

            <button
              id="btn-copy-issue-id"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Copy Issue ID to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xs text-[#65736A] font-medium">Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF4EC] text-[#174A35] text-xs font-bold uppercase border border-[#DCE5DE]">
              {report.status || 'PENDING'}
            </span>
          </div>

          <p className="text-[11px] text-[#65736A] pt-1">
            Keep this tracking number to follow authority response and updates.
          </p>
        </div>

        {/* Duplicate Notice if found */}
        {report.duplicateWarning && (
          <div className="p-4 rounded-xl border border-[#C58A28]/30 bg-[#C58A28]/5 flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-[#C58A28] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold text-[#17201B] uppercase block">Nearby Incident Noticed:</strong>
              <p className="text-[#65736A] mt-0.5">{report.duplicateWarning}</p>
            </div>
          </div>
        )}

        {/* Report Overview Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3 rounded-xl border border-[#DCE5DE] bg-white">
            <span className="text-[10px] font-bold text-[#65736A] uppercase">CATEGORY</span>
            <p className="text-xs font-bold text-[#17201B] mt-0.5">{report.category}</p>
          </div>
          <div className="p-3 rounded-xl border border-[#DCE5DE] bg-white">
            <span className="text-[10px] font-bold text-[#65736A] uppercase">REPORTER</span>
            <p className="text-xs font-bold text-[#17201B] mt-0.5 truncate">{report.reporterName}</p>
          </div>
          <div className="p-3 rounded-xl border border-[#DCE5DE] bg-white col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-[#65736A] uppercase">TIMESTAMP</span>
            <p className="text-xs font-medium text-[#17201B] mt-0.5">
              {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-success-view-report"
            onClick={() => onViewReport(report)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold tracking-wide shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Track My Report</span>
          </button>

          <button
            id="btn-success-report-another"
            onClick={onReportAnother}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[#174A35] bg-white text-[#174A35] hover:bg-[#EAF4EC] text-xs font-bold tracking-wide transition-all cursor-pointer"
          >
            <span>Report Another Issue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
