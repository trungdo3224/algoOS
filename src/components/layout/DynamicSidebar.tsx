import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  RefreshCw, 
  MessageSquareCode, 
  BookMarked, 
  Settings,
  LogOut,
  FolderGit2,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  ListOrdered
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
  badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  active = false, 
  onClick, 
  hasSubItems = false,
  isExpanded = false,
  isSubItem = false,
  className = '',
  badge
}) => {
  return (
    <li className={isSubItem ? 'ml-3' : ''}>
      <button
        onClick={onClick}
        className={`
          flex items-center w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg
          transition-all duration-150 group relative select-none
          ${active 
            ? 'bg-zinc-900 text-white shadow-sm font-semibold' 
            : isSubItem
            ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
          }
          ${className}
        `}
      >
        <span className={`mr-2.5 transition-colors ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
          {icon}
        </span>
        <span className="flex-1 text-left truncate">{label}</span>
        
        {badge && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mr-1 ${
            active ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200/70 text-zinc-700'
          }`}>
            {badge}
          </span>
        )}

        {hasSubItems && (
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${
            active ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'
          }`}>
            <ChevronRight size={14} />
          </span>
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
  const [problemsExpanded, setProblemsExpanded] = useState(true);
  
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
      icon: <LayoutDashboard size={18} />,
      onClick: () => handleNavigation('dashboard')
    },
    { 
      id: 'voice-reasoning', 
      label: 'Voice Reasoning', 
      icon: <Mic size={18} />,
      badge: 'Live',
      onClick: () => handleNavigation('voice-reasoning')
    },
    { 
      id: 'reverse-challenge', 
      label: 'Reverse Challenge', 
      icon: <RefreshCw size={18} />,
      onClick: () => handleNavigation('reverse-challenge')
    },
    { 
      id: 'ssa-coaching', 
      label: 'SSA Coaching', 
      icon: <MessageSquareCode size={18} />,
      onClick: () => handleNavigation('ssa-coaching')
    },
    { 
      id: 'revision', 
      label: 'Revision Queue', 
      icon: <BookMarked size={18} />,
      onClick: () => handleNavigation('revision')
    },
  ];

  const problemsSubItems = [
    {
      id: 'my-problems',
      label: 'All Problems',
      icon: <ListOrdered size={16} />,
      onClick: () => handleNavigation('problem-creator'),
      isActive: activePage === 'problem-creator' || activePage === 'my-problems'
    },
    {
      id: 'create-new',
      label: 'Add Problem',
      icon: <PlusCircle size={16} />,
      onClick: () => handleNavigation('problem-creator', { openModal: true }),
      isActive: activePage === 'create-new'
    }
  ];

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-white h-full border-r border-zinc-200/90 flex flex-col items-center select-none">
        <div className="pt-4 pb-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none"
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
        
        <nav className="flex-1 w-full px-2 space-y-1 mt-2">
          {navItems.map((item) => (
            <div key={item.id} className="relative group flex justify-center">
              <button
                onClick={item.onClick}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                  ${activePage === item.id 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                  }
                `}
                title={item.label}
              >
                {item.icon}
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                <div className="bg-zinc-900 text-white text-[11px] font-medium rounded px-2 py-1 whitespace-nowrap shadow-md">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
          
          <div className="relative group flex justify-center">
            <button
              onClick={() => handleNavigation('problem-creator')}
              className={`
                w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                ${(activePage === 'problem-creator' || activePage === 'my-problems' || activePage === 'create-new') 
                  ? 'bg-zinc-900 text-white shadow-sm' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }
              `}
              title="Problems"
            >
              <FolderGit2 size={18} />
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              <div className="bg-zinc-900 text-white text-[11px] font-medium rounded px-2 py-1 whitespace-nowrap shadow-md">
                Problems
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-zinc-200/90 w-full p-2 space-y-1">
          <div className="relative group flex justify-center">
            <button
              onClick={() => handleNavigation('settings')}
              className={`
                w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                ${activePage === 'settings' 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }
              `}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              <div className="bg-zinc-900 text-white text-[11px] font-medium rounded px-2 py-1 whitespace-nowrap shadow-md">
                Settings
              </div>
            </div>
          </div>
          
          <div className="relative group flex justify-center">
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              <div className="bg-zinc-900 text-white text-[11px] font-medium rounded px-2 py-1 whitespace-nowrap shadow-md">
                Sign out
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-white h-full border-r border-zinc-200/90 flex flex-col select-none">
      <div className="flex-1 flex flex-col pt-4 pb-2 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-2">
            Workspace
          </span>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                onClick={item.onClick}
                badge={item.badge}
              />
            ))}
            
            <div className="pt-2 pb-1">
              <div className="h-px bg-zinc-100 my-1 mx-2"></div>
            </div>

            {/* Problems Section */}
            <NavItem
              icon={<FolderGit2 size={18} />}
              label="Problem Bank"
              active={activePage === 'problem-creator' || activePage === 'my-problems' || activePage === 'create-new'}
              onClick={handleProblemsClick}
              hasSubItems={true}
              isExpanded={problemsExpanded}
            />
            
            {/* Problems Sub-items */}
            {problemsExpanded && (
              <ul className="space-y-0.5 mt-0.5 pl-2 border-l border-zinc-200/60 ml-4">
                {problemsSubItems.map((subItem) => (
                  <NavItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={subItem.isActive}
                    onClick={subItem.onClick}
                    isSubItem={true}
                  />
                ))}
              </ul>
            )}
          </ul>
        </nav>
      </div>
      
      <div className="border-t border-zinc-200/90 p-3 space-y-0.5">
        <NavItem
          icon={<Settings size={18} />}
          label="Settings"
          active={activePage === 'settings'}
          onClick={() => handleNavigation('settings')}
        />
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-xs sm:text-sm font-medium text-zinc-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={18} className="mr-2.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default DynamicSidebar;
