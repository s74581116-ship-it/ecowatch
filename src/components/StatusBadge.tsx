import React from 'react';
import { ReportStatus, ReportSeverity } from '../types';

interface StatusBadgeProps {
  status?: ReportStatus | string;
  severity?: ReportSeverity | string;
  isEmergency?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  if (!status) return null;

  const s = status.toUpperCase();
  let colorClasses = 'bg-[#EEF2F0] text-[#4A5550] border-[#DCE5DE]'; // fallback neutral

  if (s === 'PENDING') {
    // Warm muted yellow background, dark text
    colorClasses = 'bg-[#FEF7E6] text-[#8C5D0D] border-[#F7E5B5]';
  } else if (s === 'UNDER_REVIEW') {
    // Soft slate/cream background, dark text
    colorClasses = 'bg-[#F0F5F2] text-[#2C523C] border-[#D7E4DC]';
  } else if (s === 'INVESTIGATING') {
    // Soft blue/slate background, dark text
    colorClasses = 'bg-[#EBF3F8] text-[#1E4B6E] border-[#CFE1EE]';
  } else if (s === 'RESOLVED') {
    // Soft green background, dark forest green text
    colorClasses = 'bg-[#EAF4EC] text-[#174A35] border-[#C8E2CE]';
  } else if (s === 'REJECTED') {
    // Neutral gray background, dark text
    colorClasses = 'bg-[#F0F2F1] text-[#56635C] border-[#DCE3DF]';
  }

  const paddingClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${colorClasses} ${paddingClasses} tracking-wide uppercase`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function SeverityBadge({ severity, isEmergency, size = 'sm' }: StatusBadgeProps) {
  const sev = (severity || 'MEDIUM').toUpperCase();

  let colorClasses = 'bg-[#F0F4F2] text-[#344E41] border-[#D8E3DC]'; // LOW

  if (isEmergency || sev === 'CRITICAL') {
    // Soft rose/red background, dark red text
    colorClasses = 'bg-[#FDF2F2] text-[#9B1C1C] border-[#F9C5C5]';
  } else if (sev === 'HIGH') {
    // Soft muted orange/amber
    colorClasses = 'bg-[#FFF6ED] text-[#9A3412] border-[#FED7AA]';
  } else if (sev === 'MEDIUM') {
    // Soft muted yellow
    colorClasses = 'bg-[#FEF7E6] text-[#855B14] border-[#FBE8B5]';
  }

  const paddingClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${colorClasses} ${paddingClasses}`}>
      {sev}
      {isEmergency && (
        <span className="ml-0.5 text-[9px] font-bold px-1 py-0.2 rounded bg-[#9B1C1C] text-white">
          URGENT
        </span>
      )}
    </span>
  );
}

export default StatusBadge;
