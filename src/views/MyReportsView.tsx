import { useState } from 'react';
import { Search, FileText, ArrowRight, AlertCircle, Plus } from 'lucide-react';
import { EnvironmentalReport } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface MyReportsViewProps {
  sessionReports: EnvironmentalReport[];
  onSelectReport: (report: EnvironmentalReport) => void;
  onNewReport: () => void;
  userName: string;
}

export default function MyReportsView({
  sessionReports,
  onSelectReport,
  onNewReport,
  userName,
}: MyReportsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<EnvironmentalReport | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const localMatch = sessionReports.find(
        (r) =>
          r.issueId.toLowerCase() === query.toLowerCase() ||
          r.phoneNumber.includes(query)
      );

      if (localMatch) {
        setLookupResult(localMatch);
        setIsSearching(false);
        return;
      }

      const isIssueFormat = query.toUpperCase().startsWith('ENV-');
      const url = isIssueFormat
        ? `/api/reports?issueId=${encodeURIComponent(query.toUpperCase())}`
        : `/api/reports?search=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.reports && data.reports.length > 0) {
        setLookupResult(data.reports[0]);
      } else {
        setLookupError('No matching environmental report found for that Issue ID or phone number.');
      }
    } catch {
      setLookupError('Error looking up report. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div id="my-reports-view" className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">
            CITIZEN ARCHIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1">
            Track Environmental Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A] mt-1">
            Check the live resolution status of your reports or track any report by Issue ID.
          </p>
        </div>

        <button
          id="btn-new-report-from-archive"
          onClick={onNewReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold tracking-wide shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Tracking Lookup Tool */}
      <div className="bg-white rounded-2xl border border-[#DCE5DE] p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#17201B]">
            Track by Issue ID or Phone
          </h2>
          <p className="text-xs text-[#65736A] mt-0.5">
            Enter an Issue ID (e.g. ENV-2026-00421) or your 10-digit registered phone number.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id="input-track-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. ENV-2026-00001 or 9876543210"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/50 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all font-medium"
            />
            <Search className="w-4 h-4 text-[#65736A] absolute left-3.5 top-3" />
          </div>

          <button
            id="btn-track-lookup"
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            {isSearching ? 'Searching...' : 'Track Report'}
          </button>
        </form>

        {lookupError && (
          <div className="p-3 rounded-xl border border-[#B64242]/20 bg-[#B64242]/5 text-xs text-[#B64242] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#B64242] shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}

        {/* Found Report Preview Card */}
        {lookupResult && (
          <div className="p-4 rounded-xl border border-[#2F7D4A] bg-[#EAF4EC]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-extrabold bg-white text-[#174A35] px-2.5 py-1 rounded-lg border border-[#DCE5DE]">
                  {lookupResult.issueId}
                </span>
                <span className="text-xs font-bold text-[#17201B]">{lookupResult.category}</span>
                <StatusBadge status={lookupResult.status} />
              </div>
              <p className="text-xs text-[#65736A] mt-2 line-clamp-1">
                {lookupResult.description}
              </p>
            </div>

            <button
              onClick={() => onSelectReport(lookupResult)}
              className="px-4 py-2 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-colors"
            >
              View Full Details
            </button>
          </div>
        )}
      </div>

      {/* Session Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#17201B] uppercase tracking-wider">
            Reports Filed in This Session ({sessionReports.length})
          </h2>
        </div>

        {sessionReports.length === 0 ? (
          <div className="rounded-2xl border border-[#DCE5DE] bg-white p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF4EC] text-[#2F7D4A] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17201B]">No reports filed yet this session</h3>
              <p className="text-xs text-[#65736A] mt-1 max-w-sm mx-auto">
                Any environmental incidents you submit while using EcoWatch will appear here with live resolution status.
              </p>
            </div>
            <button
              onClick={onNewReport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-xs"
            >
              <span>Submit Your First Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionReports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl border border-[#DCE5DE] hover:border-[#2F7D4A] bg-white hover:bg-[#F7F9F5] transition-all flex flex-col justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-[#F7F9F5] text-[#174A35] border border-[#DCE5DE]">
                      {report.issueId}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>

                  <h3 className="text-sm font-bold text-[#17201B]">{report.category}</h3>

                  <p className="text-xs text-[#65736A] mt-2 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DCE5DE]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#65736A]">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => onSelectReport(report)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174A35] hover:underline cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
