import { useState, useMemo } from 'react';
import { MapPin, Info } from 'lucide-react';
import { EnvironmentalReport, ReportCategory, ReportStatus } from '../types';
import LeafletMap from '../components/LeafletMap';

interface AdminMapViewProps {
  reports: EnvironmentalReport[];
  onSelectReport: (report: EnvironmentalReport) => void;
}

export default function AdminMapView({ reports, onSelectReport }: AdminMapViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

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

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.latitude === null || r.longitude === null) return false;
      if (isNaN(r.latitude) || isNaN(r.longitude)) return false;

      if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;

      return true;
    });
  }, [reports, selectedCategory, selectedStatus]);

  const totalWithCoords = reports.filter(
    (r) => r.latitude !== null && r.longitude !== null && !isNaN(r.latitude) && !isNaN(r.longitude)
  ).length;

  return (
    <div id="admin-map-view" className="w-full max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">
            GEOSPATIAL INTELLIGENCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1">
            Regional Environmental Map
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A] mt-1">
            Visualizing {filteredReports.length} geocoded incidents across monitored sectors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-[#DCE5DE] text-[#17201B] shadow-2xs">
          <MapPin className="w-4 h-4 text-[#2F7D4A]" />
          <span>
            {totalWithCoords} of {reports.length} reports with GPS tags
          </span>
        </div>
      </div>

      {/* Map Control / Filter Bar & Severity Legend */}
      <div className="p-4 rounded-2xl border border-[#DCE5DE] bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#65736A]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#65736A]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pin Severity Legend: Low (green), Medium (yellow), High (orange), Critical (red) */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#65736A]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D4A]" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C58A28]" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B64242]" />
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <LeafletMap
        reports={filteredReports}
        onSelectReport={onSelectReport}
        height="620px"
        className="border border-[#DCE5DE] shadow-sm"
      />

      {/* Info notice */}
      <div className="p-4 rounded-xl border border-[#DCE5DE] bg-white flex items-start gap-3 text-xs text-[#65736A]">
        <Info className="w-4 h-4 text-[#2F7D4A] shrink-0 mt-0.5" />
        <p>
          Click any pin on the map to inspect the incident image thumbnail, severity rating, and launch the authority action drawer.
        </p>
      </div>
    </div>
  );
}
