import { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';
import { EnvironmentalReport, ReportStats } from '../types';

interface AdminStatisticsViewProps {
  reports: EnvironmentalReport[];
  stats: ReportStats;
}

export default function AdminStatisticsView({ reports, stats }: AdminStatisticsViewProps) {
  // Category counts sorted descending
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [reports]);

  // Max count for scaling bar chart
  const maxCategoryCount = Math.max(...categoryData.map((d) => d[1]), 1);

  // Status breakdown with natural colors matching the EcoWatch theme
  const statusData = useMemo(() => {
    const list = [
      { status: 'PENDING', count: stats.pending, fill: '#C58A28' }, // Warm amber
      { status: 'UNDER REVIEW', count: stats.underReview, fill: '#65B86E' }, // Fresh green
      { status: 'INVESTIGATING', count: stats.investigating, fill: '#2A6F97' }, // Slate ocean
      { status: 'ACTION TAKEN', count: stats.actionTaken, fill: '#2F7D4A' }, // Leaf green
      { status: 'RESOLVED', count: stats.resolved, fill: '#174A35' }, // Deep forest
      { status: 'REJECTED', count: stats.rejected, fill: '#65736A' }, // Slate neutral
    ];
    return list;
  }, [stats]);

  // Resolution Rate %
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  // Donut chart path calculations
  const donutSegments = useMemo(() => {
    const total = stats.total || 1;
    let accumulated = 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    return statusData.map((item) => {
      const percentage = item.count / total;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -accumulated * circumference;
      accumulated += percentage;

      return {
        ...item,
        percentage: Math.round(percentage * 100),
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [statusData, stats.total]);

  return (
    <div id="admin-statistics-view" className="w-full max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">
            METRICS & OPERATIONAL EFFICIENCY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#2F7D4A]" />
            Environmental Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A] mt-1">
            Visualizing report volumes, category density, authority resolution velocity, and severity distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DCE5DE] bg-white text-xs font-semibold text-[#17201B] shadow-2xs">
          <span>{reports.length} Total Incidents Logged</span>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs">
          <span className="text-xs font-semibold text-[#65736A]">
            Total Reports
          </span>
          <div className="text-3xl font-extrabold text-[#17201B] mt-2">{stats.total}</div>
          <span className="text-[11px] text-[#65736A] mt-1 block">Live environmental incidents</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs">
          <span className="text-xs font-semibold text-[#65736A]">
            Resolution Rate
          </span>
          <div className="text-3xl font-extrabold text-[#2F7D4A] mt-2">{resolutionRate}%</div>
          <span className="text-[11px] text-[#65736A] mt-1 block">
            {stats.resolved} of {stats.total} issues resolved
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs">
          <span className="text-xs font-semibold text-[#65736A]">
            Emergency Queue
          </span>
          <div className="text-3xl font-extrabold text-[#B64242] mt-2">{stats.emergency}</div>
          <span className="text-[11px] text-[#65736A] mt-1 block">Immediate hazard priority</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs">
          <span className="text-xs font-semibold text-[#65736A]">
            Pending Triage
          </span>
          <div className="text-3xl font-extrabold text-[#C58A28] mt-2">{stats.pending}</div>
          <span className="text-[11px] text-[#65736A] mt-1 block">Awaiting authority review</span>
        </div>
      </div>

      {/* Dual Charts Grid: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Reports by Category */}
        <div className="p-6 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DE]">
            <h2 className="text-sm font-bold text-[#17201B]">
              Reports by Category
            </h2>
            <span className="text-xs text-[#65736A]">Frequency</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryData.map(([category, count]) => {
              const widthPct = Math.max(8, (count / maxCategoryCount) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#17201B]">{category}</span>
                    <span className="font-mono font-bold text-[#174A35]">{count}</span>
                  </div>
                  <div className="h-4 w-full bg-[#F7F9F5] rounded-full overflow-hidden border border-[#DCE5DE] p-0.5">
                    <div
                      className="h-full bg-[#174A35] rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Reports by Status (Donut Chart & Legend) */}
        <div className="p-6 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DE]">
            <h2 className="text-sm font-bold text-[#17201B]">
              Reports by Operational Status
            </h2>
            <span className="text-xs text-[#65736A]">Pipeline</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#F0F4F2" strokeWidth="26" />
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke={seg.fill}
                    strokeWidth="26"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-500"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-[#17201B] leading-none">{stats.total}</span>
                <span className="text-[10px] font-bold uppercase text-[#65736A] tracking-wider mt-1">
                  Reports
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 text-xs w-full sm:w-auto">
              {donutSegments.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-sm shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-semibold text-[#17201B]">{item.status}</span>
                  </div>
                  <div className="font-mono font-bold text-[#17201B]">
                    {item.count} <span className="text-[#65736A] font-normal">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#DCE5DE] bg-[#F7F9F5] text-[11px] text-[#65736A]">
            Pipeline tracks lifecycle from citizen alert to verified municipal field closure.
          </div>
        </div>
      </div>

      {/* Severity Breakdown Bar */}
      <div className="p-6 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#17201B]">
          Reports by Severity Classification
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => {
            const count = stats.bySeverity[sev] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={sev} className="p-4 rounded-xl border border-[#DCE5DE] bg-[#F7F9F5] text-center">
                <span className="text-xs font-semibold text-[#65736A] uppercase">{sev}</span>
                <div className="text-2xl font-extrabold text-[#17201B] mt-1">{count}</div>
                <span className="text-[11px] text-[#65736A] mt-0.5 block">{pct}% of total</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
