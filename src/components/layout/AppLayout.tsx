import React, { useState } from 'react';
import Navbar from './Navbar';
import DynamicSidebar from './DynamicSidebar';
import Dashboard from '../../pages/Dashboard';
import IdeaGrader from '../../pages/IdeaGrader';
import SsaCoaching from '../../pages/SsaCoaching';
import VoiceReasoningMode from '../../pages/VoiceReasoningMode';
import Revision from '../../pages/Revision';
import VideoFeedback from '../../pages/VideoFeedback';
import Settings from '../../pages/Settings';
import LoginPage from '../../pages/LoginPage';
import ProblemCreator from '../../pages/ProblemCreator';
import { useAppSelector } from '../../hooks/reduxHooks';

const AppLayout: React.FC = () => {
  const { id: userId, loading } = useAppSelector((state) => state.user);
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openProblemModal, setOpenProblemModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userId) {
    return <LoginPage />;
  }

  const handlePageChange = (page: string, options?: { openModal?: boolean }) => {
    setActivePage(page);
    if (options?.openModal) {
      setOpenProblemModal(true);
    } else {
      setOpenProblemModal(false);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'voice-reasoning':
        return <VoiceReasoningMode />;
      case 'idea-grader':
        return <IdeaGrader />;
      case 'ssa-coaching':
        return <SsaCoaching />;
      case 'revision':
        return <Revision />;
      case 'video-feedback':
        return <VideoFeedback />;
      case 'settings':
        return <Settings />;
      case 'problem-creator':
      case 'my-problems':
      case 'create-new':
        return <ProblemCreator openModal={openProblemModal} onModalClose={() => setOpenProblemModal(false)} />;
      default:
        return <Dashboard />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex md:flex-shrink-0">
          <DynamicSidebar 
            activePage={activePage} 
            onPageChange={handlePageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {!isSidebarCollapsed && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <DynamicSidebar 
                activePage={activePage} 
                onPageChange={(page, options) => {
                  handlePageChange(page, options);
                  setIsSidebarCollapsed(true);
                }}
                isCollapsed={false}
                onToggleCollapse={toggleSidebar}
              />
            </div>
          </div>
        )}
        
        <main className={`
          flex-1 overflow-y-auto bg-gray-50 transition-all duration-300
          ${isSidebarCollapsed ? 'md:ml-0' : 'md:ml-0'}
          ${activePage === 'voice-reasoning' ? 'p-0' : 'p-4 sm:p-6 md:p-8'}
        `}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;