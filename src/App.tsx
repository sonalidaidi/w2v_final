import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ProductFeatures } from './components/ProductFeatures';
import { HowItWorks } from './components/HowItWorks';
import { AboutSection } from './components/AboutSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { WhoAreYouView, UserCategory } from './components/WhoAreYouView';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { RegistrationPage } from './components/RegistrationPage';
import { UserLoginView } from './components/UserLoginView';
import { RoleDashboardRedirectView } from './components/RoleDashboardRedirectView';
import { InstitutionalKitchenDashboardView } from './components/InstitutionalKitchenDashboardView';
import { FPUDashboardView } from './components/FPUDashboardView';
import { MapAnalyticsView } from './components/MapAnalyticsView';
import { StoredRegistration } from './services/registrationStorage';
import { HelpModal } from './components/HelpModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ContactModal } from './components/ContactModal';

export type AppView =
  | 'home'
  | 'who-are-you'
  | 'admin-login'
  | 'admin-dashboard'
  | 'user-login'
  | 'registration'
  | 'dashboard-redirect'
  | 'institutional-kitchen-dashboard'
  | 'fpu-dashboard'
  | 'map-analytics';

export const DEFAULT_DEMO_KITCHEN_USER: StoredRegistration = {
  id: 'reg-demo-kitchen-vnit',
  orgType: 'INSTITUTIONAL KITCHEN',
  roleCategory: 'Provider',
  orgName: 'VNIT Central Dining & Mega Mess',
  ownerName: 'Prof. Rajesh K. Sharma',
  contactNumber: '+91 98221 44550',
  email: 'kitchen.vnit@w2v-ecosystem.org',
  address: 'South Ambazari Road, VNIT Campus',
  city: 'Nagpur',
  state: 'Maharashtra',
  pinCode: '440010',
  location: 'South Ambazari Road, VNIT Campus, Nagpur',
  govRegNumber: 'MH-NGP-IK-2024-8841',
  status: 'VERIFIED',
  submittedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export const DEFAULT_DEMO_FPU_USER: StoredRegistration = {
  id: 'reg-demo-fpu-sahyadri',
  orgType: 'FOOD PROCESSING UNIT',
  roleCategory: 'Provider',
  orgName: 'Sahyadri Agro-Processing Cluster Ltd',
  ownerName: 'Er. Amit Deshmukh',
  contactNumber: '+91 94228 11200',
  email: 'fpu.agro@w2v-ecosystem.org',
  address: 'Plot B-14, Food Tech Zone, MIDC Butibori',
  city: 'Nagpur',
  state: 'Maharashtra',
  pinCode: '441122',
  location: 'Plot B-14, Food Tech Zone, MIDC Butibori, Nagpur',
  govRegNumber: 'MH-NGP-FPU-2023-4192',
  fpuType: 'Dairy & Fruit Processing',
  productCategory: 'Dairy, Fruit Pulp & Concentrates',
  status: 'VERIFIED',
  submittedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedOrgType, setSelectedOrgType] = useState<string>('INSTITUTIONAL KITCHEN');
  const [whoAreYouInitialStep, setWhoAreYouInitialStep] = useState<UserCategory>('none');
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>('admin@w2v-ecosystem.org');
  const [authenticatedUser, setAuthenticatedUser] = useState<StoredRegistration | null>(null);
  const [redirectDashboardTitle, setRedirectDashboardTitle] = useState<string>('');
  const [kitchenInitialTab, setKitchenInitialTab] = useState<'PLAN' | 'BUY' | 'IMPACT DASHBOARD' | 'RECOVERY_HUB' | 'MAP_ANALYTICS'>('PLAN');

  const [helpOpen, setHelpOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Sync hash routing so browser back/forward buttons work
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'who-are-you') {
        setCurrentView('who-are-you');
        setWhoAreYouInitialStep('none');
        window.scrollTo(0, 0);
      } else if (hash === 'create-account' || hash === 'select-account-type') {
        setCurrentView('who-are-you');
        setWhoAreYouInitialStep('user-select');
        window.scrollTo(0, 0);
      } else if (hash === 'admin-login') {
        setCurrentView('admin-login');
        window.scrollTo(0, 0);
      } else if (hash === 'admin-dashboard') {
        setCurrentView('admin-dashboard');
        window.scrollTo(0, 0);
      } else if (hash === 'user-login') {
        setCurrentView('user-login');
        window.scrollTo(0, 0);
      } else if (hash === 'kitchen-dashboard') {
        setKitchenInitialTab('PLAN');
        setCurrentView('institutional-kitchen-dashboard');
        window.scrollTo(0, 0);
      } else if (hash === 'fpu-dashboard') {
        setCurrentView('fpu-dashboard');
        window.scrollTo(0, 0);
      } else if (hash === 'impact-dashboard') {
        setKitchenInitialTab('IMPACT DASHBOARD');
        setCurrentView('institutional-kitchen-dashboard');
        window.scrollTo(0, 0);
      } else if (hash === 'map-analytics') {
        setCurrentView('map-analytics');
        window.scrollTo(0, 0);
      } else if (hash.startsWith('registration')) {
        const parts = hash.split('?type=');
        if (parts[1]) {
          try {
            setSelectedOrgType(decodeURIComponent(parts[1]));
          } catch {
            // ignore malformed URI
          }
        }
        setCurrentView('registration');
        window.scrollTo(0, 0);
      } else if (
        hash === '' ||
        hash === 'home' ||
        hash.startsWith('about') ||
        hash.startsWith('how-it-works') ||
        hash.startsWith('contact') ||
        hash.startsWith('features')
      ) {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: AppView, orgTypeParam?: string) => {
    if (orgTypeParam) {
      setSelectedOrgType(orgTypeParam);
    }
    setCurrentView(view);
    if (view === 'home') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'registration') {
      const type = orgTypeParam || selectedOrgType;
      window.location.hash = `registration?type=${encodeURIComponent(type)}`;
      window.scrollTo(0, 0);
    } else if (view === 'who-are-you') {
      setWhoAreYouInitialStep('none');
      window.location.hash = 'who-are-you';
      window.scrollTo(0, 0);
    } else {
      window.location.hash = view;
      window.scrollTo(0, 0);
    }
  };

  const handleStartCreateAccount = () => {
    // Both entries (Landing Page -> USER -> CREATE NEW ACCOUNT & USER LOGIN -> CREATE NEW ACCOUNT)
    // lead to SELECT ACCOUNT TYPE: [ PROVIDER ] / [ RECEIVER ]
    setWhoAreYouInitialStep('user-select');
    setCurrentView('who-are-you');
    window.location.hash = 'select-account-type';
    window.scrollTo(0, 0);
  };

  const handleSelectOrgType = (type: string) => {
    setSelectedOrgType(type);
    navigateTo('registration', type);
  };

  const handleAdminLoginSuccess = (adminEmail: string) => {
    setCurrentAdminEmail(adminEmail);
    navigateTo('admin-dashboard');
  };

  const handleAdminLogout = () => {
    navigateTo('admin-login');
  };

  // Role-based Dashboard Redirection mapping based on spec:
  // Institutional Kitchen -> Institutional Kitchen Dashboard (Real structure)
  // Food Processing Unit -> FPU Dashboard
  // NGO -> NGO Dashboard
  // Food Bank -> Food Bank Dashboard
  // Shelter -> Shelter Dashboard
  // Community Kitchen -> Community Kitchen Dashboard
  // Secondary Buyer / Industry -> Secondary Buyer / Industry Dashboard
  const handleUserOtpVerified = (user: StoredRegistration) => {
    setAuthenticatedUser(user);

    let title = `${user.orgType} Dashboard`;
    const typeUpper = user.orgType.toUpperCase();

    if (typeUpper.includes('INSTITUTIONAL KITCHEN')) {
      setCurrentView('institutional-kitchen-dashboard');
      window.location.hash = 'kitchen-dashboard';
      window.scrollTo(0, 0);
      return;
    } else if (typeUpper.includes('FOOD PROCESSING UNIT') || typeUpper.includes('FPU')) {
      setCurrentView('fpu-dashboard');
      window.location.hash = 'fpu-dashboard';
      window.scrollTo(0, 0);
      return;
    } else if (typeUpper === 'NGO') {
      title = 'NGO Dashboard';
    } else if (typeUpper === 'FOOD BANK') {
      title = 'Food Bank Dashboard';
    } else if (typeUpper === 'SHELTER') {
      title = 'Shelter Dashboard';
    } else if (typeUpper === 'COMMUNITY KITCHEN') {
      title = 'Community Kitchen Dashboard';
    } else if (typeUpper.includes('SECONDARY BUYER') || typeUpper.includes('INDUSTRY')) {
      title = 'Secondary Buyer / Industry Dashboard';
    }

    setRedirectDashboardTitle(title);
    setCurrentView('dashboard-redirect');
    window.location.hash = 'dashboard';
    window.scrollTo(0, 0);
  };

  const scrollToFeatures = () => {
    if (currentView !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById('features');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('features');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // PAGE 4: REGISTRATION PAGE
  if (currentView === 'registration') {
    return (
      <RegistrationPage
        selectedOrgType={selectedOrgType}
        onBack={handleStartCreateAccount}
        onContinueAfterSubmission={() => navigateTo('home')}
      />
    );
  }

  // PAGE 9 & 10: USER LOGIN & OTP VERIFICATION
  if (currentView === 'user-login') {
    return (
      <UserLoginView
        onBackToHome={() => navigateTo('home')}
        onCreateNewAccount={handleStartCreateAccount}
        onOtpVerifiedRedirect={handleUserOtpVerified}
      />
    );
  }

  // ACTUAL INSTITUTIONAL KITCHEN DASHBOARD STRUCTURE
  if (currentView === 'institutional-kitchen-dashboard') {
    return (
      <InstitutionalKitchenDashboardView
        user={authenticatedUser || DEFAULT_DEMO_KITCHEN_USER}
        initialTab={kitchenInitialTab}
        onLogout={() => {
          setAuthenticatedUser(null);
          navigateTo('user-login');
        }}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  // FOOD PROCESSING UNIT (FPU) DASHBOARD
  if (currentView === 'fpu-dashboard') {
    return (
      <FPUDashboardView
        user={authenticatedUser || DEFAULT_DEMO_FPU_USER}
        onLogout={() => {
          setAuthenticatedUser(null);
          navigateTo('user-login');
        }}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  // MAP ANALYTICS / ROUTE OPTIMIZATION STANDALONE & DIRECT VIEW
  if (currentView === 'map-analytics') {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
        <Navigation
          currentView={currentView}
          onNavigate={navigateTo}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenSubscription={() => setSubscriptionOpen(true)}
          onOpenContact={() => setContactOpen(true)}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MapAnalyticsView
            user={authenticatedUser || DEFAULT_DEMO_KITCHEN_USER}
            onBackToDashboard={() => navigateTo('institutional-kitchen-dashboard')}
          />
        </main>
        <Footer
          onNavigate={navigateTo}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenSubscription={() => setSubscriptionOpen(true)}
          onOpenContact={() => setContactOpen(true)}
        />
      </div>
    );
  }

  // ROLE-BASED DASHBOARD ROUTING REDIRECT VIEW (for other roles)
  if (currentView === 'dashboard-redirect' && authenticatedUser) {
    return (
      <RoleDashboardRedirectView
        user={authenticatedUser}
        dashboardTitle={redirectDashboardTitle}
        onLogout={() => {
          setAuthenticatedUser(null);
          navigateTo('user-login');
        }}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  // PAGE 2: USER TYPE SELECTION ("WHO ARE YOU?" / "SELECT ACCOUNT TYPE")
  if (currentView === 'who-are-you') {
    return (
      <WhoAreYouView
        initialStep={whoAreYouInitialStep}
        onBackToHome={() => navigateTo('home')}
        onSelectAdmin={() => navigateTo('admin-login')}
        onSelectUserLogin={() => navigateTo('user-login')}
        onSelectInstitutionalKitchen={() => handleSelectOrgType('INSTITUTIONAL KITCHEN')}
        onSelectFPU={() => handleSelectOrgType('FOOD PROCESSING UNIT')}
        onSelectReceiverType={(type) => handleSelectOrgType(type)}
      />
    );
  }

  // PAGE 6: ADMIN LOGIN
  if (currentView === 'admin-login') {
    return (
      <AdminLoginView
        onBackToHome={() => navigateTo('home')}
        onGoToWhoAreYou={() => navigateTo('who-are-you')}
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // PAGE 7 & PAGE 8: ADMIN DASHBOARD & PENDING VERIFICATIONS
  if (currentView === 'admin-dashboard') {
    return (
      <AdminDashboardView
        adminEmail={currentAdminEmail}
        onLogout={handleAdminLogout}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  // HOME PAGE: Landing page with exact uploaded W2V Logo in header, Help, Subscription, Contact, Admin, Hero & sections
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      {/* Top Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSubscription={() => setSubscriptionOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Main Home Landing Page */}
      <main className="flex-1">
        <HeroSection
          onGetStarted={() => navigateTo('who-are-you')}
          onExplore={scrollToFeatures}
        />
        <ProductFeatures
          onGetStarted={() => navigateTo('who-are-you')}
        />
        <HowItWorks />
        <AboutSection />
        <CtaSection onGetStarted={() => navigateTo('who-are-you')} />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSubscription={() => setSubscriptionOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Interactive Helper Modals */}
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        onGoToRole={() => navigateTo('who-are-you')}
      />
      <SubscriptionModal
        isOpen={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        onSelectTier={() => navigateTo('who-are-you')}
      />
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
