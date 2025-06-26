import React, { useState } from 'react';
import { 
  Home, 
  MessageCircle, 
  BookOpen, 
  Video, 
  Settings,
  LogOut,
  FolderOpen,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../features/user/userSlice';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  hasSubItems?: boolean;
  isExpanded?: boolean;
  isSubItem?: boolean;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  active = false, 
  onClick, 
  hasSubItems = false,
  isExpanded = false,
  isSubItem = false,
  className = ''
}) => {
  return (
    <li className={isSubItem ? 'ml-6' : ''}>
      <button
        onClick={onClick}
        className={`
          flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg
          transition-all duration-200 group relative
          ${active 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]' 
            : isSubItem
            ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
          ${className}
        `}
      >
        <span className={`mr-3 transition-colors duration-200 ${active ? 'text-white' : ''}`}>
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        {hasSubItems && (
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRight size={16} />
          </span>
        )}
        
        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
        )}
      </button>
    </li>
  );
};

interface DynamicSidebarProps {
  activePage: string;
  onPageChange: (page: string, options?: { openModal?: boolean }) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({ 
  activePage, 
  onPageChange,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const dispatch = useAppDispatch();
  const [problemsExpanded, setProblemsExpanded] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
  };

  const handleProblemsClick = () => {
    setProblemsExpanded(!problemsExpanded);
  };
  const handleNavigation = (page: string, options?: { openModal?: boolean }) => {
    onPageChange(page, options);
  };
  
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <Home size={20} />,
      onClick: () => handleNavigation('dashboard')
    },
    { 
      id: 'ssa-coaching', 
      label: 'SSA Coaching', 
      icon: <MessageCircle size={20} />,
      onClick: () => handleNavigation('ssa-coaching')
    },
    { 
      id: 'revision', 
      label: 'Revision', 
      icon: <BookOpen size={20} />,
      onClick: () => handleNavigation('revision')
    },
    { 
      id: 'video-feedback', 
      label: 'Video Feedback', 
      icon: <Video size={20} />,
      onClick: () => handleNavigation('video-feedback')
    },
  ];
  const problemsSubItems = [
    {
      id: 'my-problems',
      label: 'My Problems',
      icon: <FolderOpen size={18} />,
      onClick: () => handleNavigation('problem-creator')
    },
    {
      id: 'create-new',
      label: 'Create New',
      icon: <PlusCircle size={18} />,
      onClick: () => handleNavigation('problem-creator', { openModal: true })
    }
  ];

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white h-full border-r border-gray-200 flex flex-col">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-hidden">
          <div className="px-3 mb-6">
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 space-y-2">
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={item.onClick}
                  className={`
                    w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200
                    ${activePage === item.id 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={item.label}
                >
                  {item.icon}
                </button>
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Problems Icon */}
            <div className="relative group">
              <button
                onClick={handleProblemsClick}
                className={`
                  w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200
                  ${(activePage === 'problem-creator' || activePage === 'my-problems') 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                title="Problems"
              >
                <FolderOpen size={20} />
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  Problems
                </div>
              </div>
            </div>
          </nav>
        </div>
        
        <div className="border-t border-gray-200 p-2">
          <div className="relative group">
            <button
              onClick={() => handleNavigation('settings')}
              className={`
                w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200
                ${activePage === 'settings' 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Settings
              </div>
            </div>
          </div>
          
          <div className="relative group mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Sign out
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 flex flex-col shadow-sm">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">AM</span>
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                AlgoMind
              </h2>
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                onClick={item.onClick}
              />
            ))}
            
            {/* Problems Section */}
            <NavItem
              icon={<FolderOpen size={20} />}
              label="Problems"
              active={activePage === 'problem-creator' || activePage === 'my-problems'}
              onClick={handleProblemsClick}
              hasSubItems={true}
              isExpanded={problemsExpanded}
            />
            
            {/* Problems Sub-items */}
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${problemsExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              <ul className="space-y-1 mt-1">
                {problemsSubItems.map((subItem) => (
                  <NavItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={activePage === subItem.id}
                    onClick={subItem.onClick}
                    isSubItem={true}
                  />
                ))}
              </ul>
            </div>
          </ul>
        </nav>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          active={activePage === 'settings'}
          onClick={() => handleNavigation('settings')}
        />
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 mt-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut size={20} className="mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default DynamicSidebar;