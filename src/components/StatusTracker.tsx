import { Check, AlertCircle, Clock, Search, Wrench, CheckCircle2 } from 'lucide-react';
import { ReportStatus } from '../types';

interface StatusTrackerProps {
  status: ReportStatus;
  rejectedReason?: string;
  className?: string;
}

export default function StatusTracker({ status, rejectedReason, className = '' }: StatusTrackerProps) {
  const steps: { label: string; key: ReportStatus; icon: typeof Clock }[] = [
    { label: 'REPORT SUBMITTED', key: 'PENDING', icon: Clock },
    { label: 'UNDER REVIEW', key: 'UNDER REVIEW', icon: Search },
    { label: 'INVESTIGATING', key: 'INVESTIGATING', icon: AlertCircle },
    { label: 'ACTION TAKEN', key: 'ACTION TAKEN', icon: Wrench },
    { label: 'RESOLVED', key: 'RESOLVED', icon: CheckCircle2 },
  ];

  if (status === 'REJECTED') {
    return (
      <div id="status-tracker-rejected" className={`rounded-xl border border-[#F9C5C5] bg-[#FDF2F2] p-5 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#B64242] text-white shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 bg-white text-[#B64242] rounded border border-[#F9C5C5]">
                Report Status
              </span>
              <h4 className="text-sm font-bold text-[#9B1C1C] tracking-wide">REJECTED</h4>
            </div>
            <p className="text-xs text-[#65736A] mt-2 leading-relaxed">
              {rejectedReason ||
                'This report could not be verified or fell outside administrative jurisdiction after authority inspection.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const orderMap: Record<ReportStatus, number> = {
    'PENDING': 0,
    'UNDER REVIEW': 1,
    'INVESTIGATING': 2,
    'ACTION TAKEN': 3,
    'RESOLVED': 4,
    'REJECTED': -1,
  };

  const currentIndex = orderMap[status] ?? 0;

  return (
    <div id="status-tracker-container" className={`w-full py-4 ${className}`}>
      {/* Progress Steps for Desktop / Tablet */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-[#DCE5DE] -z-0" />
        {/* Filled Connecting Line */}
        <div
          className="absolute top-5 left-6 h-0.5 bg-[#174A35] transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIndex / (steps.length - 1)) * 100))}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center text-center z-10 w-24">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                  isCurrent
                    ? 'bg-[#174A35] text-white border-[#174A35] ring-4 ring-[#65B86E]/20 scale-110 shadow-xs'
                    : isCompleted
                    ? 'bg-[#2F7D4A] text-white border-[#2F7D4A]'
                    : 'bg-white text-[#65736A] border-[#DCE5DE]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2.5 tracking-tight uppercase leading-tight ${
                  isCurrent
                    ? 'text-[#174A35] font-bold'
                    : isCompleted
                    ? 'text-[#17201B]'
                    : 'text-[#65736A]'
                }`}
              >
                {step.label}
              </span>
              {isCurrent && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#EAF4EC] text-[#174A35] font-bold mt-1 tracking-wider border border-[#C8E2CE]">
                  ACTIVE
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical Stepper for Mobile Screens */}
      <div className="flex sm:hidden flex-col gap-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-[#174A35] bg-[#EAF4EC]/50 shadow-2xs'
                  : isCompleted
                  ? 'border-[#DCE5DE] bg-white'
                  : 'border-[#DCE5DE]/60 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrent
                    ? 'bg-[#174A35] text-white'
                    : isCompleted
                    ? 'bg-[#2F7D4A] text-white'
                    : 'bg-[#F7F9F5] text-[#65736A] border border-[#DCE5DE]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold uppercase ${isCurrent ? 'text-[#174A35] font-bold' : 'text-[#17201B]'}`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-[#2F7D4A] font-medium">Currently in this stage</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
