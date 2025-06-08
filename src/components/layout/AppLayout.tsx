import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Dashboard from '../../pages/Dashboard';
import IdeaGrader from '../../pages/IdeaGrader';
import SsaCoaching from '../../pages/SsaCoaching';
import Revision from '../../pages/Revision';
import VideoFeedback from '../../pages/VideoFeedback';
import Insights from '../../pages/Insights';
import Settings from '../../pages/Settings';
import LoginPage from '../../pages/LoginPage';
import ProblemCreator from '../../pages/ProblemCreator';
import { useAppSelector } from '../../hooks/reduxHooks';

const AppLayout: React.FC = () => {
  const { id: userId, loading } = useAppSelector((state) => state.user);
  const [activePage, setActivePage] = useState('dashboard');

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

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      // case 'idea-grader':
      //   return <IdeaGrader />;
      case 'ssa-coaching':
        return <SsaCoaching />;
      case 'revision':
        return <Revision />;
      case 'video-feedback':
        return <VideoFeedback />;
      case 'insights':
        return <Insights />;
      case 'settings':
        return <Settings />;
      case 'problem-creator':
        return <ProblemCreator />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar activePage={activePage} onPageChange={setActivePage} />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;