import {
  PawPrint,
  Droplets,
  Flame,
  Trash2,
  Wind,
  Trees,
  Fuel,
  AlertTriangle,
  ArrowRight,
  History,
  Sparkles,
} from 'lucide-react';
import { ReportCategory } from '../types';

interface PublicDashboardViewProps {
  userName: string;
  onSelectCategory: (category: ReportCategory) => void;
  onTrackReports: () => void;
  onChangeName: () => void;
}

export default function PublicDashboardView({
  userName,
  onSelectCategory,
  onTrackReports,
  onChangeName,
}: PublicDashboardViewProps) {
  const categories: {
    title: ReportCategory;
    description: string;
    icon: typeof PawPrint;
  }[] = [
    {
      title: 'Injured Animal',
      description: 'Report an injured or endangered animal',
      icon: PawPrint,
    },
    {
      title: 'Water Pollution',
      description: 'Report polluted or contaminated water',
      icon: Droplets,
    },
    {
      title: 'Forest Fire',
      description: 'Report fire or smoke affecting natural areas',
      icon: Flame,
    },
    {
      title: 'Waste Dumping',
      description: 'Report illegal or harmful waste disposal',
      icon: Trash2,
    },
    {
      title: 'Air Pollution',
      description: 'Report smoke, dust or unusual air pollution',
      icon: Wind,
    },
    {
      title: 'Damaged / Fallen Tree',
      description: 'Report damaged, fallen or illegally removed trees',
      icon: Trees,
    },
    {
      title: 'Chemical / Oil Leak',
      description: 'Report chemical spills or oil leakage',
      icon: Fuel,
    },
    {
      title: 'Other Environmental Issue',
      description: 'Report another environmental problem',
      icon: AlertTriangle,
    },
  ];

  return (
    <div id="public-dashboard" className="w-full max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* User Greeting & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DE]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">CITIZEN PORTAL</span>
            <span className="text-xs text-[#65736A]">•</span>
            <span className="text-xs text-[#65736A]">Signed in as <strong className="text-[#17201B]">{userName}</strong></span>
            <span className="text-xs text-[#65736A]">•</span>
            <button
              onClick={onChangeName}
              className="text-xs font-semibold text-[#2F7D4A] hover:text-[#174A35] underline cursor-pointer"
            >
              Change
            </button>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17201B] tracking-tight">
            What would you like to report?
          </h1>
          <p className="text-sm text-[#65736A] mt-1.5 font-normal">
            Help us identify environmental problems in your community.
          </p>
        </div>

        <button
          id="btn-goto-my-reports"
          onClick={onTrackReports}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE5DE] bg-white hover:bg-[#EAF4EC] text-xs font-semibold text-[#17201B] transition-colors cursor-pointer shadow-2xs"
        >
          <History className="w-4 h-4 text-[#2F7D4A]" />
          <span>My Reports & Tracking</span>
        </button>
      </div>

      {/* Category Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#65736A]">
            Select an Issue Category to Begin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                id={`card-category-${cat.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectCategory(cat.title)}
                className="group relative flex flex-col p-6 rounded-2xl border border-[#DCE5DE] hover:border-[#2F7D4A] bg-white hover:bg-[#F7F9F5] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Modern Lucide Line Icon with Light Green Tint */}
                <div className="w-12 h-12 rounded-xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#174A35] group-hover:text-white transition-all shrink-0 shadow-2xs">
                  <Icon className="w-6 h-6 stroke-[2.25]" />
                </div>

                <h2 className="text-base font-bold text-[#17201B] mb-1.5 leading-snug">
                  {cat.title}
                </h2>

                <p className="text-xs text-[#65736A] mb-6 leading-relaxed flex-grow">
                  {cat.description}
                </p>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174A35] group-hover:translate-x-1 transition-transform">
                  <span>Report Issue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
