import React, { useState } from 'react';
import { Save, Bell, Lock, User as UserIcon, Shield, Check, Palette, Sun, Moon, BookOpen, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAppSelector } from '../hooks/reduxHooks';
import { useTheme } from '../context/ThemeContext';
import { ThemeId } from '../types/theme';

const Settings: React.FC = () => {
  const { name: userName, email: userEmail, profilePicture: userProfilePicture } = useAppSelector((state) => state.user);
  const { theme, setTheme, themes } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={userProfilePicture || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'}
                    alt="User avatar"
                    className="w-16 h-16 rounded-full object-cover border border-zinc-200"
                  />
                </div>
                <div className="space-y-1">
                  <Button variant="outline" size="sm">
                    Change photo
                  </Button>
                  <p className="text-[11px] text-zinc-400">JPG, PNG or WebP up to 2MB</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200/90 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  defaultValue={userName}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200/90 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  defaultValue={userEmail}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Bio / Specialization
              </label>
              <textarea
                id="bio"
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200/90 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                defaultValue="Software engineer focusing on algorithmic problem formulation and pattern recognition."
              />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              {saveSuccess ? (
                <span className="inline-flex items-center text-xs font-mono text-emerald-600">
                  <Check className="h-3.5 w-3.5 mr-1" /> Preferences saved
                </span>
              ) : <div />}
              <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  Design System • 4 Themes
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">Interface Appearance</h3>
              <p className="text-xs text-zinc-500">
                Choose between neutral high-contrast light, low-eyestrain warm book paper, and focused developer dark workbenches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((t) => {
                const isActive = t.id === theme;
                const getIcon = (id: ThemeId) => {
                  switch (id) {
                    case 'zinc-light':
                      return <Sun className="h-4 w-4" />;
                    case 'warm-paper':
                      return <BookOpen className="h-4 w-4" />;
                    case 'midnight':
                      return <Moon className="h-4 w-4" />;
                    case 'nordic-navy':
                      return <Sparkles className="h-4 w-4" />;
                  }
                };

                return (
                  <div
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`
                      relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between
                      ${
                        isActive
                          ? 'border-zinc-900 ring-2 ring-zinc-900/10 shadow-md bg-white'
                          : 'border-zinc-200/90 hover:border-zinc-300 bg-zinc-50/40 hover:bg-white shadow-xs'
                      }
                    `}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-700">
                            {getIcon(t.id)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-zinc-900">{t.name}</h4>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                {t.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-600">
                            Click to apply
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                        {t.description}
                      </p>

                      {/* Mockup Preview Window */}
                      <div
                        className="rounded-lg p-3 border mb-3 text-left overflow-hidden transition-colors"
                        style={{
                          backgroundColor: t.swatch.bg,
                          borderColor: t.swatch.border,
                        }}
                      >
                        <div
                          className="rounded-md p-2.5 border shadow-xs"
                          style={{
                            backgroundColor: t.swatch.surface,
                            borderColor: t.swatch.border,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.swatch.accent }} />
                              <span className="text-[10px] font-mono font-semibold" style={{ color: t.swatch.text }}>
                                algoOS // {t.name}
                              </span>
                            </div>
                            <span
                              className="text-[9px] font-mono px-1 rounded"
                              style={{
                                backgroundColor: t.swatch.accent,
                                color: t.id === 'midnight' ? '#09090b' : t.id === 'nordic-navy' ? '#0b0f19' : '#ffffff',
                              }}
                            >
                              active
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 rounded-full w-4/5 opacity-80" style={{ backgroundColor: t.swatch.text }} />
                            <div className="h-1.5 rounded-full w-3/5 opacity-40" style={{ backgroundColor: t.swatch.text }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Palette swatches */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Palette</span>
                      <div className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs" style={{ backgroundColor: t.swatch.bg }} title="Canvas" />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs" style={{ backgroundColor: t.swatch.surface }} title="Surface" />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs" style={{ backgroundColor: t.swatch.border }} title="Border" />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs" style={{ backgroundColor: t.swatch.accent }} title="Accent" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Email Digest &amp; Alerts</h3>
              <p className="text-xs text-zinc-500 mb-3">Choose the frequency and types of email communications you receive.</p>
              <div className="space-y-2.5">
                {[
                  { id: 'weekly-summary', label: 'Weekly progress & retention analysis' },
                  { id: 'new-feedback', label: 'AI diagnostic evaluation completed' },
                  { id: 'revision-reminder', label: 'Spaced repetition queue reminders' },
                  { id: 'achievement', label: 'Pattern milestone acknowledgments' },
                ].map((item) => (
                  <label key={item.id} htmlFor={item.id} className="flex items-center p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50/60 cursor-pointer transition-colors">
                    <input
                      id={item.id}
                      type="checkbox"
                      className="h-4 w-4 text-zinc-900 focus:ring-zinc-900 border-zinc-300 rounded accent-zinc-900"
                      defaultChecked={true}
                    />
                    <span className="ml-3 text-xs text-zinc-700 font-medium">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">In-App Coaching Signals</h3>
              <p className="text-xs text-zinc-500 mb-3">Real-time suggestions delivered within the coaching workspace.</p>
              <div className="space-y-2.5">
                {[
                  { id: 'coaching-tips', label: 'Contextual Socratic coaching hints' },
                  { id: 'new-problems', label: 'New synthetic real-world scenario challenges' },
                  { id: 'streak-reminder', label: 'Daily cadence & practice streak notifications' },
                ].map((item) => (
                  <label key={item.id} htmlFor={item.id} className="flex items-center p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50/60 cursor-pointer transition-colors">
                    <input
                      id={item.id}
                      type="checkbox"
                      className="h-4 w-4 text-zinc-900 focus:ring-zinc-900 border-zinc-300 rounded accent-zinc-900"
                      defaultChecked={true}
                    />
                    <span className="ml-3 text-xs text-zinc-700 font-medium">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              {saveSuccess ? (
                <span className="inline-flex items-center text-xs font-mono text-emerald-600">
                  <Check className="h-3.5 w-3.5 mr-1" /> Preferences saved
                </span>
              ) : <div />}
              <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
                Save Preferences
              </Button>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Authentication Credentials</h3>
              <p className="text-xs text-zinc-500 mb-4">Ensure your account uses an alphanumeric password with high entropy.</p>
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="current-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200/90 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200/90 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200/90 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Two-Factor Authentication</h3>
              <p className="text-xs text-zinc-500 mb-3">Add hardware security key or TOTP authenticator protection.</p>
              
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-600">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900">TOTP Auth</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                        Disabled
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Protect account from unauthorized device logins</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              {saveSuccess ? (
                <span className="inline-flex items-center text-xs font-mono text-emerald-600">
                  <Check className="h-3.5 w-3.5 mr-1" /> Password updated
                </span>
              ) : <div />}
              <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
                Save Security Settings
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-zinc-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          Account Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your personal profile, notification triggers, and security credentials.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-zinc-200/80 overflow-hidden">
        <div className="flex border-b border-zinc-200/80 bg-zinc-50/40 px-6 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;