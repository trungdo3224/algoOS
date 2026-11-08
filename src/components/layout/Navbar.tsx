import React, { useState } from 'react';
import { Menu, X, Bell, LogOut, Search, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import ThemeSelector from '../ui/ThemeSelector';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { logout, loginAsDemo } from '../../features/user/userSlice';
import { navigateTo } from '../../utils/navigation';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const notifications = [
    {
      id: '1',
      title: 'Session analysis complete',
      description: 'Your Binary Tree problem reasoning has been analyzed',
      time: '5m ago',
      unread: true
    },
    {
      id: '2',
      title: 'Milestone reached',
      description: 'Completed 5 medium difficulty problems this week',
      time: '2h ago',
      unread: false
    }
  ];

  // Simplified navbar for non-authenticated users
  if (!user.id) {
    return (
      <header 
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        className="border-b sticky top-0 z-30 select-none transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('/')}>
              <div className="h-9 w-9 bg-zinc-950 text-white rounded-lg flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-sm border border-zinc-800">
                &gt;_
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span 
                  style={{ color: 'var(--text-primary)' }}
                  className="text-base font-bold tracking-tight"
                >
                  AlgoMind
                </span>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60 font-mono">
                  algoOS
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ThemeSelector />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => dispatch(loginAsDemo())}
                className="hidden sm:inline-flex border-zinc-300 text-zinc-800 hover:bg-zinc-100"
                leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              >
                Instant Live Demo
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateTo('/signin')}
              >
                Sign In
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => navigateTo('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      className="border-b sticky top-0 z-30 select-none transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden inline-flex items-center justify-center p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 bg-zinc-950 text-white rounded-lg flex items-center justify-center font-mono font-bold text-xs tracking-tight shadow-sm">
                &gt;_
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-sm font-bold tracking-tight text-zinc-950">
                  AlgoMind
                </span>
                <span className="hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60 font-mono">
                  v2.4
                </span>
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="relative w-64 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search problems, patterns, tags..."
                  className="w-full pl-8 pr-12 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400 focus:bg-white text-zinc-900 placeholder:text-zinc-400 transition-colors"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                  /
                </span>
              </div>
            </div>
          </div>
          
          {/* Desktop Right items */}
          <div className="hidden sm:flex sm:items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg relative transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-zinc-950 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-zinc-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Notifications
                    </span>
                    <span className="text-[11px] text-zinc-400">1 unread</span>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-zinc-50/80 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-zinc-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-zinc-900">{notification.title}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">{notification.time}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{notification.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-zinc-100 text-center">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-zinc-600 hover:text-zinc-950 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            <ThemeSelector />

            <div className="h-4 w-px bg-zinc-200 mx-1"></div>

            <div className="flex items-center space-x-2.5">
              {user.profilePicture ? (
                <img
                  className="h-7 w-7 rounded-lg ring-1 ring-zinc-200 object-cover"
                  src={user.profilePicture}
                  alt="User avatar"
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-zinc-900">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-zinc-900 leading-none">{user.name || 'Learner'}</p>
                <p className="text-[11px] text-zinc-500 leading-none mt-1 truncate max-w-[130px] font-mono">{user.email || 'user@algomind.dev'}</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
              className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50"
            >
              Sign out
            </Button>
          </div>
          
          {/* Mobile menu toggle */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{user.name || 'Learner'}</p>
              <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-zinc-600">Theme</span>
            <ThemeSelector />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="h-4 w-4" />}
            className="w-full justify-center text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            Sign out
          </Button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
