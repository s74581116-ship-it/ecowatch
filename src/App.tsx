import { useState, useEffect, useMemo } from 'react';
import { EnvironmentalReport, ReportCategory, ReportStats } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminReportModal from './components/AdminReportModal';
import PublicReportModal from './components/PublicReportModal';
import { fetchAllReports, subscribeToReports, updateReport } from './services/reportService';

// Views
import LandingView from './views/LandingView';
import PublicLoginView from './views/PublicLoginView';
import PublicDashboardView from './views/PublicDashboardView';
import ReportFormView from './views/ReportFormView';
import ReportSuccessView from './views/ReportSuccessView';
import MyReportsView from './views/MyReportsView';
import AdminLoginView from './views/AdminLoginView';
import AdminDashboardView from './views/AdminDashboardView';
import AdminReportsView from './views/AdminReportsView';
import AdminMapView from './views/AdminMapView';
import AdminAssistantView from './views/AdminAssistantView';
import AdminStatisticsView from './views/AdminStatisticsView';

// Helper to parse deep routes on page load/refresh
function getInitialViewFromPath(): string {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

  if (path === '/admin' || path === '/admin-dashboard') {
    return localStorage.getItem('ecowatch_admin_auth') === 'true' ? 'admin-dashboard' : 'admin-login';
  }
  if (path === '/reports' || path === '/my-reports' || path === '/track') {
    return 'my-reports';
  }
  if (path === '/admin-reports') {
    return localStorage.getItem('ecowatch_admin_auth') === 'true' ? 'admin-reports' : 'admin-login';
  }
  if (path === '/map' || path === '/admin-map') {
    return localStorage.getItem('ecowatch_admin_auth') === 'true' ? 'admin-map' : 'landing';
  }
  if (path === '/statistics' || path === '/admin-statistics') {
    return localStorage.getItem('ecowatch_admin_auth') === 'true' ? 'admin-statistics' : 'landing';
  }
  if (path === '/assistant' || path === '/admin-assistant') {
    return localStorage.getItem('ecowatch_admin_auth') === 'true' ? 'admin-assistant' : 'admin-login';
  }
  if (path === '/public' || path === '/report') {
    return 'public-categories';
  }
  return 'landing';
}

export default function App() {
  // Navigation State with Route Awareness
  const [currentView, setCurrentView] = useState<string>(() => getInitialViewFromPath());

  // Public Session State
  const [publicUserName, setPublicUserName] = useState<string>(() => {
    return localStorage.getItem('ecowatch_user_name') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('Water Pollution');
  const [lastSubmittedReport, setLastSubmittedReport] = useState<EnvironmentalReport | null>(null);
  const [sessionReports, setSessionReports] = useState<EnvironmentalReport[]>([]);

  // Admin Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ecowatch_admin_auth') === 'true';
  });

  // Modal inspection states
  const [activeAdminReport, setActiveAdminReport] = useState<EnvironmentalReport | null>(null);
  const [activePublicReport, setActivePublicReport] = useState<EnvironmentalReport | null>(null);

  // Global Reports Cache
  const [allReports, setAllReports] = useState<EnvironmentalReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load and subscribe to real-time reports (Firestore / Local fallback)
  useEffect(() => {
    let isMounted = true;
    fetchAllReports()
      .then((data) => {
        if (isMounted) {
          setAllReports(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching reports:', err);
        if (isMounted) setIsLoading(false);
      });

    // Real-time listener
    const unsubscribe = subscribeToReports((updatedReports) => {
      if (isMounted && updatedReports.length > 0) {
        setAllReports(updatedReports);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const view = getInitialViewFromPath();
      setCurrentView(view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminLoggedIn]);

  // Compute live statistics
  const stats: ReportStats = useMemo(() => {
    const total = allReports.length;
    const pending = allReports.filter((r) => r.status === 'PENDING').length;
    const underReview = allReports.filter((r) => r.status === 'UNDER REVIEW').length;
    const investigating = allReports.filter((r) => r.status === 'INVESTIGATING').length;
    const actionTaken = allReports.filter((r) => r.status === 'ACTION TAKEN').length;
    const resolved = allReports.filter((r) => r.status === 'RESOLVED').length;
    const rejected = allReports.filter((r) => r.status === 'REJECTED').length;
    const emergency = allReports.filter((r) => r.isEmergency).length;

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

    allReports.forEach((r) => {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      if (r.severity) {
        bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
      }
    });

    return {
      total,
      pending,
      underReview,
      investigating,
      actionTaken,
      resolved,
      rejected,
      emergency,
      byCategory,
      bySeverity,
    };
  }, [allReports]);

  // Navigation Guard & Router
  const handleNavigate = (view: string) => {
    let targetView = view;
    if (view.startsWith('admin-') && view !== 'admin-login' && !isAdminLoggedIn) {
      targetView = 'admin-login';
    }

    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync clean browser URL
    const pathToPush =
      targetView === 'landing'
        ? '/'
        : targetView === 'my-reports'
        ? '/reports'
        : targetView === 'admin-dashboard'
        ? '/admin'
        : targetView === 'admin-map'
        ? '/map'
        : targetView === 'admin-statistics'
        ? '/statistics'
        : targetView === 'admin-assistant'
        ? '/assistant'
        : `/${targetView}`;

    if (window.location.pathname !== pathToPush) {
      window.history.pushState({ view: targetView }, '', pathToPush);
    }
  };

  // Public Flow Handlers
  const handleStartPublicFlow = () => {
    if (publicUserName && publicUserName.trim().length >= 2) {
      handleNavigate('public-categories');
    } else {
      handleNavigate('public-login');
    }
  };

  const handlePublicLoginContinue = (name: string) => {
    setPublicUserName(name);
    localStorage.setItem('ecowatch_user_name', name);
    handleNavigate('public-categories');
  };

  const handleSelectCategory = (cat: ReportCategory) => {
    setSelectedCategory(cat);
    handleNavigate('report-form');
  };

  const handleReportSubmitted = (report: EnvironmentalReport) => {
    setLastSubmittedReport(report);
    setSessionReports((prev) => [report, ...prev]);
    setAllReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
    handleNavigate('report-success');
  };

  // Admin Flow Handlers
  const handleStartAdminFlow = () => {
    if (isAdminLoggedIn) {
      handleNavigate('admin-dashboard');
    } else {
      handleNavigate('admin-login');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('ecowatch_admin_auth', 'true');
    handleNavigate('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('ecowatch_admin_auth');
    handleNavigate('landing');
  };

  // Admin Save Report Changes Handler with Firestore
  const handleSaveAdminReport = async (updatedReport: EnvironmentalReport) => {
    const result = await updateReport(updatedReport.id, {
      status: updatedReport.status,
      severity: updatedReport.severity,
      adminNotes: updatedReport.adminNotes,
      rejectedReason: updatedReport.rejectedReason,
    });

    // Update local state
    setAllReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? result : r))
    );
    setActiveAdminReport(result);
  };

  return (
    <div id="ecowatch-app-root" className="min-h-screen flex flex-col bg-[#F7F9F5] text-[#17201B] font-sans selection:bg-[#174A35] selection:text-white">
      {/* Universal Top Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
        publicUserName={publicUserName}
      />

      {/* Main View Display */}
      <main className="flex-1 flex flex-col">
        {/* LANDING SCREEN */}
        {currentView === 'landing' && (
          <LandingView
            onSelectFlow={(flow) => {
              if (flow === 'public') handleStartPublicFlow();
              if (flow === 'admin') handleStartAdminFlow();
            }}
            totalReportsCount={allReports.length}
          />
        )}

        {/* PUBLIC USER NAME ENTRY */}
        {currentView === 'public-login' && (
          <PublicLoginView
            onContinue={handlePublicLoginContinue}
            onBack={() => setCurrentView('landing')}
            initialName={publicUserName}
          />
        )}

        {/* PUBLIC CATEGORY SELECTION */}
        {currentView === 'public-categories' && (
          <PublicDashboardView
            userName={publicUserName || 'Citizen'}
            onSelectCategory={handleSelectCategory}
            onTrackReports={() => setCurrentView('my-reports')}
            onChangeName={() => setCurrentView('public-login')}
          />
        )}

        {/* PUBLIC REPORT INCIDENT FORM */}
        {currentView === 'report-form' && (
          <ReportFormView
            category={selectedCategory}
            reporterName={publicUserName || 'Citizen'}
            onBack={() => setCurrentView('public-categories')}
            onSubmitSuccess={handleReportSubmitted}
          />
        )}

        {/* PUBLIC REPORT SUCCESS RECEIPT */}
        {currentView === 'report-success' && lastSubmittedReport && (
          <ReportSuccessView
            report={lastSubmittedReport}
            onViewReport={(rep) => setActivePublicReport(rep)}
            onReportAnother={() => setCurrentView('public-categories')}
          />
        )}

        {/* PUBLIC MY REPORTS / TRACKING */}
        {(currentView === 'my-reports' || currentView === 'track-report') && (
          <MyReportsView
            sessionReports={sessionReports}
            onSelectReport={(rep) => setActivePublicReport(rep)}
            onNewReport={() => setCurrentView('public-categories')}
            userName={publicUserName || 'Citizen'}
          />
        )}

        {/* ADMIN LOGIN */}
        {currentView === 'admin-login' && (
          <AdminLoginView
            onLoginSuccess={handleAdminLoginSuccess}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {/* ADMIN DASHBOARD */}
        {currentView === 'admin-dashboard' && (
          <AdminDashboardView
            reports={allReports}
            stats={stats}
            onSelectReport={(rep) => setActiveAdminReport(rep)}
            onNavigate={handleNavigate}
          />
        )}

        {/* ADMIN FULL REPORTS TABLE */}
        {currentView === 'admin-reports' && (
          <AdminReportsView
            reports={allReports}
            onSelectReport={(rep) => setActiveAdminReport(rep)}
          />
        )}

        {/* ADMIN GEOSPATIAL MAP */}
        {currentView === 'admin-map' && (
          <AdminMapView
            reports={allReports}
            onSelectReport={(rep) => setActiveAdminReport(rep)}
          />
        )}

        {/* ADMIN AI ASSISTANT */}
        {currentView === 'admin-assistant' && (
          <AdminAssistantView reports={allReports} />
        )}

        {/* ADMIN STATISTICS */}
        {currentView === 'admin-statistics' && (
          <AdminStatisticsView reports={allReports} stats={stats} />
        )}
      </main>

      {/* Admin Report Inspection & Edit Modal */}
      {activeAdminReport && (
        <AdminReportModal
          report={activeAdminReport}
          onClose={() => setActiveAdminReport(null)}
          onSave={handleSaveAdminReport}
        />
      )}

      {/* Public Report Inspection Modal */}
      {activePublicReport && (
        <PublicReportModal
          report={activePublicReport}
          onClose={() => setActivePublicReport(null)}
        />
      )}

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
