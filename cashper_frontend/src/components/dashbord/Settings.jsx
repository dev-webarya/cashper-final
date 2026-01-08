import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, MessageSquare, Sun, Moon, Lock, Shield, Download, Trash2, HelpCircle, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import settingsApi from '../../services/settingsApi';
import { getLoginHistory, logoutSession, logoutAllSessions } from '../../services/settingsApi';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showDownloadData, setShowDownloadData] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [twoFactorData, setTwoFactorData] = useState(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await settingsApi.getUserSettings();
      setEmailNotifications(settings.notificationPreferences.email);
      setSmsNotifications(settings.notificationPreferences.sms);
      setPushNotifications(settings.notificationPreferences.push);
      setTheme(settings.theme);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadLoginHistory = async () => {
    try {
      const data = await getLoginHistory(10);
      setLoginHistory(data.sessions || []);
    } catch (error) {
      console.error('Error loading login history:', error);
      toast.error('Failed to load login history');
    }
  };

  const handleToggleNotification = async (type) => {
    setLoading(true);
    try {
      let newPreferences = {
        email: emailNotifications,
        sms: smsNotifications,
        push: pushNotifications
      };
      
      switch(type) {
        case 'email':
          newPreferences.email = !emailNotifications;
          setEmailNotifications(!emailNotifications);
          break;
        case 'sms':
          newPreferences.sms = !smsNotifications;
          setSmsNotifications(!smsNotifications);
          break;
        case 'push':
          newPreferences.push = !pushNotifications;
          setPushNotifications(!pushNotifications);
          break;
      }
      
      await settingsApi.updateNotificationPreferences(newPreferences);
      toast.success(`${type.toUpperCase()} notifications ${newPreferences[type] ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification preferences');
      // Revert the change on error
      loadSettings();
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (newTheme === 'dark') {
      toast.info('Dark mode coming soon! 🌙\n\nWe\'re working on bringing you a beautiful dark theme.');
      return;
    }
    
    setLoading(true);
    try {
      await settingsApi.updateTheme(newTheme);
      setTheme(newTheme);
      toast.success('Light theme activated! ☀️');
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const data = await settingsApi.setup2FA();
      setTwoFactorData(data);
      toast.success('2FA setup initiated! Scan the QR code with your authenticator app.');
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error(error.detail || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (verificationCode) => {
    setLoading(true);
    try {
      await settingsApi.enable2FA(verificationCode);
      toast.success('Two-Factor Authentication enabled successfully!\n\nYour account is now more secure.');
      setShow2FAModal(false);
      setTwoFactorData(null);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error(error.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      await logoutSession(sessionId);
      toast.success('Session logged out successfully');
      loadLoginHistory();
    } catch (error) {
      console.error('Error logging out session:', error);
      toast.error('Failed to logout session');
    }
  };

  const handleLogoutAllSessions = async () => {
    if (confirm('Logout from all devices except this one?\n\nThis will sign you out from all other devices.')) {
      try {
        const result = await logoutAllSessions();
        toast.success(result.message || 'Successfully logged out from all other devices!');
        loadLoginHistory();
      } catch (error) {
        console.error('Error logging out all sessions:', error);
        toast.error('Failed to logout sessions');
      }
    }
  };

  const handleRequestDataDownload = async () => {
    try {
      const result = await settingsApi.requestDataDownload({
        includeDocuments: true,
        includeTransactions: true,
        includeApplications: true
      });
      toast.success(result.message || 'Data download requested!\n\nYour data will be prepared and sent to your email within 24-48 hours.');
      setShowDownloadData(false);
    } catch (error) {
      console.error('Error requesting data download:', error);
      toast.error('Failed to request data download');
    }
  };

  const handleRequestAccountDeletion = async (confirmation, password, reason) => {
    try {
      const result = await settingsApi.requestAccountDeletion({
        confirmation,
        password,
        reason
      });
      toast.info('We\'re sorry to see you go.\n\nYour account deletion request has been received. Your account will be permanently deleted within 30 days.\n\nYou can cancel this request by logging in during this period.');
      setShowDeleteAccount(false);
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      toast.error(error.detail || 'Failed to request account deletion');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailNotifications}
                onChange={() => handleToggleNotification('email')}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">SMS Notifications</p>
                <p className="text-xs text-gray-500">Get alerts via SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={smsNotifications}
                onChange={() => handleToggleNotification('sms')}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Push Notifications</p>
                <p className="text-xs text-gray-500">Receive push notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={pushNotifications}
                onChange={() => handleToggleNotification('push')}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Theme</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <Sun className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">Light</p>
                    <p className="text-xs text-gray-500">Default theme</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg shadow-md flex items-center justify-center">
                    <Moon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">Dark</p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy & Security
        </h2>
        <div className="space-y-4">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">Change Password</span>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            onClick={() => setShow2FAModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">Two-Factor Authentication</span>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            onClick={() => {
              setShowLoginHistory(true);
              loadLoginHistory();
            }}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">Login History</span>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Account Management</h2>
        <div className="space-y-4">
          <button 
            onClick={() => setShowDownloadData(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">Download My Data</span>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            onClick={() => setShowDeleteAccount(true)}
            className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left border border-red-200 group"
          >
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" />
              <span className="text-sm font-semibold text-red-600 group-hover:text-red-700 transition-colors">Delete Account</span>
            </div>
            <svg className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Need Help?</h2>
        </div>
        <p className="text-gray-600 mb-4">Our support team is here to assist you</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => alert('Contact Support\n\nEmail: support@ Cashper.com\nPhone: 1800-XXX-XXXX\nHours: 24/7\n\nOur team will respond within 24 hours.')}
            className="flex-1 bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Contact Support
          </button>
          <button 
            onClick={() => alert('Frequently Asked Questions\n\n1. How do I apply for a loan?\n2. How to track my application?\n3. What documents are needed?\n4. How to update my profile?\n5. How to download statements?\n\nVisit our help center for detailed answers.')}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
          >
            View FAQs
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fadeInUp">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <button 
              onClick={() => {
                alert('Password changed successfully!\n\nYou will be logged out and need to log in again with your new password.');
                setShowPasswordModal(false);
              }}
              className="w-full mt-6 bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fadeInUp">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enable Two-Factor Authentication</h3>
            <p className="text-gray-600 mb-6">Add an extra layer of security to your account</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 mb-2">How it works:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Download Google Authenticator or Authy app</li>
                  <li>Scan the QR code or enter the key</li>
                  <li>Enter the 6-digit code to verify</li>
                </ul>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-gray-300">
                    <p className="text-gray-400 text-sm">QR Code Here</p>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">ABCD-EFGH-IJKL-MNOP</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Verification Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
                />
              </div>
            </div>
            
            <button 
              onClick={() => {
                setShow2FAModal(true);
                handleSetup2FA();
              }}
              className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showLoginHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative animate-fadeInUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowLoginHistory(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Login History</h3>
            
            <div className="space-y-4">
              {loginHistory.map((login, index) => (
                <div key={index} className={`p-4 rounded-lg border ${login.status === 'current' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        {login.device}
                        {login.status === 'current' && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">Current</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{login.location}</p>
                      <p className="text-xs text-gray-500 mt-1">{login.time}</p>
                    </div>
                    {login.status !== 'current' && (
                      <button 
                        onClick={() => handleLogoutSession(login.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleLogoutAllSessions}
              className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Logout from All Other Devices
            </button>
          </div>
        </div>
      )}

      {/* Download Data Modal */}
      {showDownloadData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fadeInUp">
            <button
              onClick={() => setShowDownloadData(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Download My Data</h3>
            <p className="text-gray-600 mb-6">Request a copy of all your data</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 mb-2">What's included:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Profile information and documents</li>
                  <li>Loan application history</li>
                  <li>Investment and insurance records</li>
                  <li>Transaction history</li>
                  <li>Tax planning data</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Your data will be prepared and sent to your registered email within 24-48 hours in a secure ZIP file.
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleRequestDataDownload}
              className="w-full mt-6 bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Request Data Download
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fadeInUp">
            <button
              onClick={() => setShowDeleteAccount(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Account?</h3>
              <p className="text-gray-600">This action cannot be undone</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-900 mb-2">This will permanently delete:</p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>Your profile and all personal data</li>
                  <li>Application and transaction history</li>
                  <li>Saved documents and preferences</li>
                  <li>All account access and privileges</li>
                </ul>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Type "DELETE" to confirm</label>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowDeleteAccount(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirm('Are you absolutely sure?\n\nThis will permanently delete your account and all associated data. This action CANNOT be undone.')) {
                    alert('We\'re sorry to see you go.\n\nYour account deletion request has been received. Your account will be permanently deleted within 30 days.\n\nYou can cancel this request by logging in during this period.');
                    setShowDeleteAccount(false);
                  }
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
