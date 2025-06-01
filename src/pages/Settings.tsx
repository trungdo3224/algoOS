import React, { useState } from 'react';
import { Save, Bell, Lock, User as UserIcon } from 'lucide-react';
import Card from '../components/ui/Car';
import Button from '../components/ui/Button';
import { useAppSelector } from '../hooks/reduxHooks';

const Settings: React.FC = () => {
  const { name: userName, email: userEmail, profilePicture: userProfilePicture } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <img
                    src={userProfilePicture || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'}
                    alt="User avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={userName}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={userEmail}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Software engineer passionate about algorithms and data structures."
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <Button leftIcon={<Save className="h-4 w-4" />}>
                Save Changes
              </Button>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            <div className="space-y-4">
              {[
                { id: 'weekly-summary', label: 'Weekly progress summary' },
                { id: 'new-feedback', label: 'New video feedback available' },
                { id: 'revision-reminder', label: 'Revision reminders' },
                { id: 'achievement', label: 'Achievement unlocked' },
              ].map((item) => (
                <div key={item.id} className="flex items-center">
                  <input
                    id={item.id}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={true}
                  />
                  <label htmlFor={item.id} className="ml-2 block text-sm text-gray-700">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900">In-App Notifications</h3>
            <div className="space-y-4">
              {[
                { id: 'coaching-tips', label: 'Coaching tips and suggestions' },
                { id: 'new-problems', label: 'New problems available' },
                { id: 'streak-reminder', label: 'Daily streak reminders' },
              ].map((item) => (
                <div key={item.id} className="flex items-center">
                  <input
                    id={item.id}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={true}
                  />
                  <label htmlFor={item.id} className="ml-2 block text-sm text-gray-700">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button leftIcon={<Save className="h-4 w-4" />}>
                Save Preferences
              </Button>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Status: <span className="text-red-600">Disabled</span></p>
                  <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button leftIcon={<Save className="h-4 w-4" />}>
                Save Changes
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-3 text-sm font-medium border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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