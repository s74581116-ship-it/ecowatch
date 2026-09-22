import { useState, useMemo } from 'react';
import { Search, Filter, Eye, ShieldAlert, FileText, Download, RotateCcw } from 'lucide-react';
import { EnvironmentalReport, ReportCategory, ReportSeverity, ReportStatus } from '../types';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';

interface AdminReportsViewProps {
  reports: EnvironmentalReport[];
  onSelectReport: (report: EnvironmentalReport) => void;
}

export default function AdminReportsView({ reports, onSelectReport }: AdminReportsViewProps) {
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [emergencyFilter, setEmergencyFilter] = useState<string>('All');

  const categories: ReportCategory[] = [
    'Injured Animal',
    'Water Pollution',
    'Forest Fire',
    'Waste Dumping',
    'Air Pollution',
    'Damaged / Fallen Tree',
    'Chemical / Oil Leak',
    'Other Environmental Issue',
  ];

  const statuses: ReportStatus[] = [
    'PENDING',
    'UNDER REVIEW',
    'INVESTIGATING',
    'ACTION TAKEN',
    'RESOLVED',
    'REJECTED',
  ];

  const severities: ReportSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  // Filter computation
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesId = r.issueId.toLowerCase().includes(q);
        const matchesReporter = r.reporterName.toLowerCase().includes(q);
        const matchesLoc = r.locationText.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesId && !matchesReporter && !matchesLoc && !matchesDesc) return false;
      }

      // Status
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;

      // Category
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;

      // Severity
      if (severityFilter !== 'All' && r.severity !== severityFilter) return false;

      // Emergency
      if (emergencyFilter !== 'All') {
        const isEmerg = emergencyFilter === 'Emergency';
        if (r.isEmergency !== isEmerg) return false;
      }

      return true;
    });
  }, [reports, search, statusFilter, categoryFilter, severityFilter, emergencyFilter]);

  // Export CSV functionality
  const handleExportCSV = () => {
    const headers = ['Issue ID', 'Category', 'Reporter Name', 'Phone', 'Location', 'Severity', 'Emergency', 'Status', 'Date'];
    const rows = filteredReports.map((r) => [
      r.issueId,
      `"${r.category}"`,
      `"${r.reporterName}"`,
      r.phoneNumber,
      `"${r.locationText.replace(/"/g, '""')}"`,
      r.severity,
      r.isEmergency ? 'YES' : 'NO',
      r.status,
      r.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecowatch_reports_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-reports-view" className="w-full max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">
            INCIDENT ARCHIVE & REGISTRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1">
            Reports Management
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A] mt-1">
            Review citizen submissions, triage severities, update statuses, and log administrative remediation.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE5DE] bg-white hover:bg-[#EAF4EC] text-xs font-bold text-[#174A35] transition-colors cursor-pointer shadow-2xs"
        >
          <Download className="w-4 h-4 text-[#2F7D4A]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE5DE] p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            id="admin-reports-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Issue ID (e.g. ENV-2026-00001), reporter name, or location..."
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/50 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all font-medium"
          />
          <Search className="w-4 h-4 text-[#65736A] absolute left-3.5 top-3.5" />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#65736A] mb-1">
              STATUS
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#65736A] mb-1">
              CATEGORY
            </label>
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none truncate"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#65736A] mb-1">
              SEVERITY
            </label>
            <select
              id="filter-severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none"
            >
              <option value="All">All Severities</option>
              {severities.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#65736A] mb-1">
              EMERGENCY
            </label>
            <select
              id="filter-emergency"
              value={emergencyFilter}
              onChange={(e) => setEmergencyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none"
            >
              <option value="All">All Incidents</option>
              <option value="Emergency">Emergency Only</option>
              <option value="Normal">Normal Urgency</option>
            </select>
          </div>
        </div>

        {/* Clear Filters helper */}
        {(statusFilter !== 'All' || categoryFilter !== 'All' || severityFilter !== 'All' || emergencyFilter !== 'All' || search) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#DCE5DE] text-xs">
            <span className="text-[#65736A] font-medium">
              Showing {filteredReports.length} of {reports.length} reports
            </span>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setCategoryFilter('All');
                setSeverityFilter('All');
                setEmergencyFilter('All');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#174A35] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-[#DCE5DE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE5DE] bg-[#F7F9F5] text-[#65736A] font-semibold">
                <th className="py-3.5 px-4">Issue ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Emergency</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DE]/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#65736A]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#65736A]/50" />
                    <p className="font-bold text-[#17201B]">No incident reports match your filters</p>
                    <p className="text-xs text-[#65736A] mt-1">Try resetting the status, category, or search keywords</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#F7F9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#17201B]">
                      <span className="px-2 py-0.5 rounded bg-[#F7F9F5] border border-[#DCE5DE]">
                        {report.issueId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#17201B]">{report.category}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#17201B]">{report.reporterName}</div>
                      <div className="text-[11px] font-mono text-[#65736A]">{report.phoneNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px] truncate text-[#65736A]">
                      {report.locationText}
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={report.severity} isEmergency={report.isEmergency} />
                    </td>
                    <td className="py-3.5 px-4">
                      {report.isEmergency ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF2F2] text-[#9B1C1C] border border-[#F9C5C5]">
                          <ShieldAlert className="w-3 h-3" /> YES
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#65736A]">No</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#65736A] whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectReport(report)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAF4EC] hover:bg-[#174A35] text-[#174A35] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Update</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
