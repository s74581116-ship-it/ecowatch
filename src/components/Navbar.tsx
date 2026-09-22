import { useState } from 'react';
import { Menu, X, Shield, User, FileText, Search, LayoutDashboard, Map, Sparkles, BarChart3, LogOut, Home } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  publicUserName?: string;
}

export default function Navbar({
  currentView,
  onNavigate,
  isAdminLoggedIn,
  onAdminLogout,
  publicUserName,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminSection = currentView.startsWith('admin-');

  const publicNavItems = [
    { label: 'Home', view: 'landing', icon: Home },
    { label: 'Report Issue', view: 'public-categories', icon: FileText },
    { label: 'My Reports', view: 'my-reports', icon: User },
    { label: 'Track Report', view: 'track-report', icon: Search },
  ];

  const adminNavItems = [
    { label: 'Dashboard', view: 'admin-dashboard', icon: LayoutDashboard },
    { label: 'Reports', view: 'admin-reports', icon: FileText },
    { label: 'Issue Map', view: 'admin-map', icon: Map },
    { label: 'AI Assistant', view: 'admin-assistant', icon: Sparkles },
    { label: 'Statistics', view: 'admin-statistics', icon: BarChart3 },
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav id="ecowatch-navbar" className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#DCE5DE] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button
              id="nav-logo-btn"
              onClick={() => handleNavClick(isAdminSection && isAdminLoggedIn ? 'admin-dashboard' : 'landing')}
              className="text-left focus:outline-none cursor-pointer"
            >
              <Logo size="md" />
            </button>
            {isAdminSection && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF4EC] text-[#174A35] border border-[#DCE5DE] ml-2">
                <Shield className="w-3 h-3 text-[#2F7D4A]" /> AUTHORITY PORTAL
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {isAdminSection && isAdminLoggedIn ? (
              // Admin Links
              <>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={item.view}
                      id={`nav-link-${item.view}`}
                      onClick={() => handleNavClick(item.view)}
                      className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#EAF4EC] text-[#174A35] font-bold shadow-2xs'
                          : 'text-[#65736A] hover:text-[#17201B] hover:bg-[#F7F9F5]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#174A35]' : 'text-[#65736A]'}`} />
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#174A35] rounded-full" />
                      )}
                    </button>
                  );
                })}
                <div className="h-5 w-px bg-[#DCE5DE] mx-2" />
                <button
                  id="nav-btn-admin-logout"
                  onClick={() => {
                    onAdminLogout();
                    handleNavClick('landing');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#DCE5DE] text-[#65736A] hover:text-[#B64242] hover:border-[#B64242]/30 hover:bg-[#B64242]/5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              // Public Links
              <>
                {publicNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={item.view}
                      id={`nav-link-${item.view}`}
                      onClick={() => handleNavClick(item.view)}
                      className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#EAF4EC] text-[#174A35] font-bold shadow-2xs'
                          : 'text-[#65736A] hover:text-[#17201B] hover:bg-[#F7F9F5]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#174A35]' : 'text-[#65736A]'}`} />
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#174A35] rounded-full" />
                      )}
                    </button>
                  );
                })}

                <div className="h-5 w-px bg-[#DCE5DE] mx-2" />

                <button
                  id="nav-btn-goto-admin"
                  onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#174A35] text-[#174A35] hover:bg-[#174A35] hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Authority Portal
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-[#DCE5DE] text-[#17201B] hover:bg-[#EAF4EC] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="md:hidden border-b border-[#DCE5DE] bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-3 duration-200">
          {isAdminSection && isAdminLoggedIn ? (
            <>
              <div className="text-[10px] font-bold text-[#65736A] uppercase tracking-widest px-3 py-1">
                INSTITUTE ADMINISTRATION
              </div>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    id={`mobile-nav-${item.view}`}
                    onClick={() => handleNavClick(item.view)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-left transition-colors ${
                      isActive ? 'bg-[#EAF4EC] text-[#174A35] font-bold' : 'text-[#17201B] hover:bg-[#F7F9F5]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#174A35]' : 'text-[#65736A]'}`} />
                    {item.label}
                  </button>
                );
              })}
              <button
                id="mobile-admin-logout"
                onClick={() => {
                  onAdminLogout();
                  handleNavClick('landing');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#B64242] border border-[#B64242]/20 hover:bg-[#B64242]/5 mt-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="text-[10px] font-bold text-[#65736A] uppercase tracking-widest px-3 py-1">
                PUBLIC CITIZEN PORTAL
              </div>
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    id={`mobile-nav-${item.view}`}
                    onClick={() => handleNavClick(item.view)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-left transition-colors ${
                      isActive ? 'bg-[#EAF4EC] text-[#174A35] font-bold' : 'text-[#17201B] hover:bg-[#F7F9F5]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#174A35]' : 'text-[#65736A]'}`} />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-[#DCE5DE]">
                <button
                  id="mobile-goto-admin"
                  onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#174A35] text-white hover:bg-[#236448] transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#65B86E]" />
                  Authority Portal Login
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
