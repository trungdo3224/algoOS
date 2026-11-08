import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import DynamicSidebar from './DynamicSidebar';
import Dashboard from '../../pages/Dashboard';
import IdeaGrader from '../../pages/IdeaGrader';
import SsaCoaching from '../../pages/SsaCoaching';
import VoiceReasoningMode from '../../pages/VoiceReasoningMode';
import ReverseChallenge from '../../pages/ReverseChallenge';
import Revision from '../../pages/Revision';
import Settings from '../../pages/Settings';
import LoginPage from '../../pages/LoginPage';
import LandingPage from '../../pages/LandingPage';
import ProblemCreator from '../../pages/ProblemCreator';
import { useAppSelector } from '../../hooks/reduxHooks';

const VALID_PAGES = [
  'dashboard',
  'voice-reasoning',
  'reverse-challenge',
  'idea-grader',
  'ssa-coaching',
  'revision',
  'settings',
  'problem-creator',
  'my-problems',
  'create-new',
] as const;

function getPageFromPath(path: string): string {
  const cleanPath = path.replace(/^\//, '').split('?')[0];
  return (VALID_PAGES as readonly string[]).includes(cleanPath) ? cleanPath : 'dashboard';
}

const AppLayout: React.FC = () => {
  const { id: userId, loading } = useAppSelector((state) => state.user);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [activePage, setActivePage] = useState<string>(() => getPageFromPath(window.location.pathname));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openProblemModal, setOpenProblemModal] = useState(false);

  // Sync with browser back/forward buttons and navigateTo events
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      setActivePage(getPageFromPath(path));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When logged in, redirect away from landing/login/signup routes to dashboard
  useEffect(() => {
    if (userId && (currentPath === '/signin' || currentPath === '/signup' || currentPath === '/')) {
      window.history.replaceState(null, '', '/dashboard');
      setCurrentPath('/dashboard');
      setActivePage('dashboard');
    }
  }, [userId, currentPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle authentication routing
  if (!userId) {
    if (currentPath === '/signin' || currentPath === '/signup') {
      return (
        <div 
          style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
          className="min-h-screen transition-colors"
        >
          <Navbar />
          <LoginPage />
        </div>
      );
    }
    return (
      <div 
        style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
        className="min-h-screen flex flex-col transition-colors"
      >
        <Navbar />
        <LandingPage />
      </div>
    );
  }

  const handlePageChange = (page: string, options?: { openModal?: boolean }) => {
    setActivePage(page);
    setOpenProblemModal(Boolean(options?.openModal));
    setIsMobileSidebarOpen(false);

    const targetPath = `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'voice-reasoning':
        return <VoiceReasoningMode />;
      case 'reverse-challenge':
        return <ReverseChallenge />;
      case 'idea-grader':
        return <IdeaGrader />;
      case 'ssa-coaching':
        return <SsaCoaching />;
      case 'revision':
        return <Revision />;
      case 'settings':
        return <Settings />;
      case 'problem-creator':
      case 'my-problems':
      case 'create-new':
        return (
          <ProblemCreator
            openModal={openProblemModal || activePage === 'create-new'}
            onModalClose={() => setOpenProblemModal(false)}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 flex flex-col antialiased">
      <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <DynamicSidebar 
            activePage={activePage} 
            onPageChange={handlePageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div 
              className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileSidebarOpen(false)} 
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50 shadow-2xl">
              <DynamicSidebar 
                activePage={activePage} 
                onPageChange={handlePageChange}
                isCollapsed={false}
                onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}
        
        <main className={`
          flex-1 overflow-y-auto bg-zinc-50/70
          ${activePage === 'voice-reasoning' ? 'p-0' : 'p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full'}
        `}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
