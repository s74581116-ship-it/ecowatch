import Logo from './Logo';

export default function Footer() {
  return (
    <footer id="ecowatch-footer" className="mt-auto border-t border-[#DCE5DE] bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Logo size="sm" />
          <div className="hidden sm:block h-6 w-px bg-[#DCE5DE]" />
          <p className="text-xs text-[#65736A] font-medium">
            Technology for a cleaner environment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-[#65736A]">
          <span className="font-medium">Direct Citizen Environmental Reporting</span>
          <span className="hidden sm:inline text-[#DCE5DE]">•</span>
          <span>© 2026 EcoWatch</span>
        </div>
      </div>
    </footer>
  );
}
