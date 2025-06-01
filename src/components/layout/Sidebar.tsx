import React from 'react';
import { 
  Home, 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Video, 
  BarChart2, 
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../features/user/userSlice';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={`
          flex items-center w-full px-3 py-2 text-sm font-medium rounded-md
          ${active 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
          transition-colors duration-200
        `}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </button>
    </li>
  );
};

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const dispatch = useAppDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'idea-grader', label: 'AI Idea Grader', icon: <Brain size={20} /> },
    { id: 'ssa-coaching', label: 'SSA Coaching', icon: <MessageCircle size={20} /> },
    { id: 'revision', label: 'Revision', icon: <BookOpen size={20} /> },
    { id: 'video-feedback', label: 'Video Feedback', icon: <Video size={20} /> },
    { id: 'insights', label: 'Insights', icon: <BarChart2 size={20} /> },
    { id: 'problem-creator', label: 'Create Problem', icon: <Plus size={20} /> },
  ];

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Learning OS</h2>
        </div>
        <nav className="mt-5 flex-1 px-4 space-y-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                onClick={() => onPageChange(item.id)}
              />
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4">
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          active={activePage === 'settings'}
          onClick={() => onPageChange('settings')}
        />
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 mt-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut size={20} className="mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;