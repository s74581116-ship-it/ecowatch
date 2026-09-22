import {
  FileText,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Map,
  BarChart3,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { EnvironmentalReport, ReportStats } from '../types';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';

interface AdminDashboardViewProps {
  reports: EnvironmentalReport[];
  stats: ReportStats;
  onSelectReport: (report: EnvironmentalReport) => void;
  onNavigate: (view: string) => void;
}

export default function AdminDashboardView({
  reports,
  stats,
  onSelectReport,
  onNavigate,
}: AdminDashboardViewProps) {
  const statCards = [
    { label: 'Total Reports', value: stats.total, icon: FileText, desc: 'Logged incidents' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, desc: 'Awaiting triage' },
    { label: 'Under Investigation', value: stats.investigating, icon: AlertTriangle, desc: 'Field teams active' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, desc: 'Remediation done' },
    { label: 'Critical / Emergency', value: stats.emergency, icon: ShieldAlert, desc: 'Urgent priority', isUrgent: true },
  ];

  // Latest 6 reports
  const recentReports = reports.slice(0, 6);

  return (
    <div id="admin-dashboard-view" className="w-full max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">
            COMMAND & TRIAGE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A] mt-1 font-normal">
            Real-time environmental hazard monitoring, AI analysis review, and field remediation dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold tracking-wide shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>All Reports</span>
          </button>
          <button
            onClick={() => onNavigate('admin-map')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCE5DE] bg-white hover:bg-[#EAF4EC] text-xs font-bold text-[#174A35] transition-colors cursor-pointer"
          >
            <Map className="w-4 h-4 text-[#2F7D4A]" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                card.isUrgent
                  ? 'border-[#F9C5C5] bg-[#FDF2F2]/40 shadow-xs'
                  : 'border-[#DCE5DE] bg-white shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#65736A]">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  card.isUrgent ? 'bg-[#FDF2F2] text-[#9B1C1C]' : 'bg-[#EAF4EC] text-[#174A35]'
                }`}>
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#17201B] block tracking-tight">
                  {card.value}
                </span>
                <span className="text-[11px] text-[#65736A] font-medium block mt-0.5">
                  {card.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: AI Assistant */}
        <div
          onClick={() => onNavigate('admin-assistant')}
          className="p-6 rounded-2xl border border-[#DCE5DE] hover:border-[#2F7D4A] bg-white hover:bg-[#F7F9F5] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17201B]">AI Assistant</h2>
              <p className="text-[11px] text-[#65736A]">Natural language queries & summaries</p>
            </div>
          </div>
          <p className="text-xs text-[#65736A] mb-4 leading-relaxed">
            Ask Gemini AI to filter unresolved forest fires, summarize daily trends, or pinpoint high severity zones.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174A35] group-hover:translate-x-1 transition-transform">
            <span>Open AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Module 2: OpenStreetMap Incident Map */}
        <div
          onClick={() => onNavigate('admin-map')}
          className="p-6 rounded-2xl border border-[#DCE5DE] hover:border-[#2F7D4A] bg-white hover:bg-[#F7F9F5] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17201B]">Incident Geospatial Map</h2>
              <p className="text-[11px] text-[#65736A]">OpenStreetMap visualizer</p>
            </div>
          </div>
          <p className="text-xs text-[#65736A] mb-4 leading-relaxed">
            Explore active environmental hazard clusters across regions with interactive custom markers and filters.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174A35] group-hover:translate-x-1 transition-transform">
            <span>View Regional Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Module 3: Statistical Analytics */}
        <div
          onClick={() => onNavigate('admin-statistics')}
          className="p-6 rounded-2xl border border-[#DCE5DE] hover:border-[#2F7D4A] bg-white hover:bg-[#F7F9F5] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17201B]">Analytics & Statistics</h2>
              <p className="text-[11px] text-[#65736A]">Resolution rates & trends</p>
            </div>
          </div>
          <p className="text-xs text-[#65736A] mb-4 leading-relaxed">
            Inspect category frequency charts, severity distributions, and municipal resolution velocity.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174A35] group-hover:translate-x-1 transition-transform">
            <span>View Statistics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-2xl border border-[#DCE5DE] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DE]">
          <div>
            <h2 className="text-base font-bold text-[#17201B]">
              Recent Incident Reports
            </h2>
            <p className="text-xs text-[#65736A]">
              Latest citizen reports queued for authority validation and response.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-reports')}
            className="text-xs font-bold text-[#2F7D4A] hover:text-[#174A35] hover:underline cursor-pointer"
          >
            View All ({reports.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE5DE] text-[#65736A] font-semibold">
                <th className="py-3 px-3">Issue ID</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DE]/60">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-[#F7F9F5] transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-[#17201B]">
                    <span className="px-2 py-0.5 rounded bg-[#F7F9F5] border border-[#DCE5DE]">
                      {report.issueId}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#17201B]">{report.category}</td>
                  <td className="py-3.5 px-3 text-[#65736A] max-w-[180px] truncate">
                    {report.locationText}
                  </td>
                  <td className="py-3.5 px-3">
                    <SeverityBadge severity={report.severity} isEmergency={report.isEmergency} />
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="py-3.5 px-3 text-[#65736A]">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onSelectReport(report)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAF4EC] hover:bg-[#174A35] text-[#174A35] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View / Update</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
