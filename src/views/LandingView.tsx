import { Shield, ArrowRight, Trees, Building2, CheckCircle2, Leaf, Sparkles, MapPin } from 'lucide-react';
import Logo from '../components/Logo';

interface LandingViewProps {
  onSelectFlow: (flow: 'public' | 'admin') => void;
  totalReportsCount?: number;
}

export default function LandingView({ onSelectFlow, totalReportsCount = 0 }: LandingViewProps) {
  return (
    <div id="landing-screen" className="relative w-full overflow-hidden py-10 sm:py-16 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Subtle organic background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden" aria-hidden="true">
        {/* Soft leaf contours */}
        <svg className="absolute -top-16 -left-20 w-96 h-96 text-[#EAF4EC]" viewBox="0 0 200 200" fill="currentColor">
          <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,87.7,-0.7C85.4,14.8,78.2,29.6,68.9,42.4C59.6,55.1,48.2,65.8,34.9,71.8C21.6,77.7,6.4,78.9,-8.5,77.3C-23.4,75.7,-38,71.3,-50.7,63.1C-63.4,54.9,-74.2,42.9,-80.4,28.8C-86.6,14.8,-88.2,-1.3,-84.6,-16.1C-81,-30.9,-72.1,-44.4,-60.5,-52.5C-48.8,-60.7,-34.4,-63.5,-20.9,-71.4C-7.4,-79.3,5.2,-92.3,19.3,-89.8C33.4,-87.3,49,-69.3,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] text-[#EAF4EC]" viewBox="0 0 200 200" fill="currentColor">
          <path d="M41.7,-68.8C54.1,-63.4,64.2,-52.3,71.2,-39.7C78.2,-27.1,82.1,-13.5,80.8,-0.7C79.6,12.1,73.1,24.1,65.3,35.3C57.4,46.5,48.2,56.8,36.9,64.6C25.6,72.4,12.8,77.7,-0.2,78C-13.1,78.4,-26.2,73.8,-37.8,66.2C-49.4,58.6,-59.5,48.1,-66.8,35.7C-74.1,23.3,-78.6,9.1,-77.8,-4.8C-76.9,-18.8,-70.7,-32.4,-61.6,-43.3C-52.5,-54.2,-40.5,-62.3,-27.9,-67.5C-15.3,-72.7,-2.1,-75,11.2,-74.6C24.4,-74.2,38.8,-71.1,41.7,-68.8Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="relative max-w-3xl w-full text-center space-y-6 z-10">
        {/* Environmental Logo at Center Top */}
        <div className="flex justify-center">
          <Logo size="xl" showText={false} />
        </div>

        {/* Main Heading & Subtitles */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#17201B] uppercase">
            ECOWATCH
          </h1>
          <p className="text-lg sm:text-xl font-bold tracking-widest text-[#2F7D4A] uppercase">
            Report. Track. Protect.
          </p>
          <p className="text-sm sm:text-base text-[#65736A] max-w-xl mx-auto leading-relaxed pt-1 font-normal">
            Help identify environmental problems in your community and connect them with people who can take action.
          </p>
        </div>

        {/* Public & Admin Action Cards */}
        <div className="pt-6 sm:pt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Option 1: PUBLIC CARD */}
          <div
            id="card-public-entry"
            onClick={() => onSelectFlow('public')}
            className="group relative flex flex-col items-center p-8 rounded-2xl border border-[#DCE5DE] hover:border-[#2F7D4A] bg-white hover:bg-[#F7F9F5] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-2xs">
              <Trees className="w-7 h-7 stroke-[2.25]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-[#2F7D4A] mb-1">
              CITIZEN COMMUNITY
            </span>
            <h2 className="text-xl font-bold text-[#17201B] mb-2">
              Public
            </h2>
            <p className="text-xs text-[#65736A] mb-6 leading-relaxed">
              Report an environmental issue with photo evidence, automatic GPS detection, and real-time status tracking.
            </p>

            <button
              id="btn-public-flow"
              className="mt-auto w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#174A35] text-white text-xs font-bold tracking-wide hover:bg-[#236448] shadow-xs group-hover:shadow transition-all cursor-pointer"
            >
              <span>Report Issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: ADMIN CARD */}
          <div
            id="card-admin-entry"
            onClick={() => onSelectFlow('admin')}
            className="group relative flex flex-col items-center p-8 rounded-2xl border border-[#DCE5DE] hover:border-[#174A35] bg-white hover:bg-[#F7F9F5] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-2xs">
              <Building2 className="w-7 h-7 stroke-[2.25]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-[#65736A] mb-1">
              INSTITUTES & AUTHORITIES
            </span>
            <h2 className="text-xl font-bold text-[#17201B] mb-2">
              Admin
            </h2>
            <p className="text-xs text-[#65736A] mb-6 leading-relaxed">
              Manage and respond to reports, triage severity, deploy field remediation, and query reports using AI.
            </p>

            <button
              id="btn-admin-flow"
              className="mt-auto w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border-2 border-[#174A35] bg-white text-[#174A35] text-xs font-bold tracking-wide hover:bg-[#EAF4EC] transition-all cursor-pointer"
            >
              <span>Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Highlights with EcoWatch Green Accents */}
        <div className="pt-8 sm:pt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-[#65736A] font-medium">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DCE5DE] bg-white shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A]" />
            <span>Real-time GPS Tracking</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DCE5DE] bg-white shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2F7D4A]" />
            <span>Gemini AI Photo Analysis</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DCE5DE] bg-white shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#2F7D4A]" />
            <span>OpenStreetMap Visualizer</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DCE5DE] bg-white shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-[#2F7D4A]" />
            <span>Zero Password Onboarding</span>
          </div>
        </div>
      </div>
    </div>
  );
}
