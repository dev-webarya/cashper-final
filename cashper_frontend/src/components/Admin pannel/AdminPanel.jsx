import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import LoanManagement from './LoanManagement';
import InsuranceManagement from './InsuranceManagement';
import InvestmentManagement from './InvestmentManagement';
import TaxPlanningManagement from './TaxPlanningManagement';
import RetailServicesManagement from './RetailServicesManagement';
import CorporateServicesManagement from './CorporateServicesManagement';
import ReportsAnalytics from './ReportsAnalytics';
import AdminSettings from './AdminSettings';
import AdminNotifications from './AdminNotifications';
import Inquiry from './Inquiry';

const AdminPanel = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [adminProfile, setAdminProfile] = useState({
    fullName: 'Admin User',
    email: 'sudha@gmail.com',
    profileImage: null
  });

  // Fetch admin profile data on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found, skipping profile fetch');
          return;
        }

        // First, try to get cached profile from localStorage
        const cachedProfile = localStorage.getItem('adminProfile');
        if (cachedProfile) {
          try {
            const parsedProfile = JSON.parse(cachedProfile);
            setAdminProfile(parsedProfile);
          } catch (e) {
            console.error('Error parsing cached profile:', e);
          }
        }

        // Then fetch fresh data from API
        const response = await fetch('http://127.0.0.1:8000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          console.error('Unauthorized - token may be invalid or expired');
          // Clear invalid token
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('adminProfile');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const profileData = {
            fullName: data.fullName || 'Admin User',
            email: data.email || 'sudha@gmail.com',
            profileImage: data.profileImage || null
          };
          setAdminProfile(profileData);
          // Cache the profile in localStorage
          localStorage.setItem('adminProfile', JSON.stringify(profileData));
        } else {
          console.error('Failed to fetch profile:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
      }
    };

    fetchAdminProfile();
  }, []);

  // Function to update profile (image and other data)
  const updateAdminProfile = (updates) => {
    const updatedProfile = {
      ...adminProfile,
      ...updates
    };
    setAdminProfile(updatedProfile);
    // Update localStorage
    localStorage.setItem('adminProfile', JSON.stringify(updatedProfile));
  };
  
  // Function to refresh profile from server
  const refreshAdminProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const profileData = {
          fullName: data.fullName || 'Admin User',
          email: data.email || 'sudha@gmail.com',
          profileImage: data.profileImage || null
        };
        setAdminProfile(profileData);
        localStorage.setItem('adminProfile', JSON.stringify(profileData));
      }
    } catch (error) {
      console.error('Failed to refresh admin profile:', error);
    }
  };
  
  // Sync activeView with URL path
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/admin/dashboard' || path === '/admin') {
      setActiveView('dashboard');
    } else if (path === '/admin/users') {
      setActiveView('users');
    } else if (path === '/admin/loans') {
      setActiveView('loans');
    } else if (path === '/admin/insurance') {
      setActiveView('insurance');
    } else if (path === '/admin/investments') {
      setActiveView('investments');
    } else if (path === '/admin/taxplanning') {
      setActiveView('taxplanning');
    } else if (path === '/admin/taxconsultations') {
      setActiveView('taxconsultations');
    } else if (path === '/admin/retailservices') {
      setActiveView('retailservices');
    } else if (path === '/admin/corporateservices') {
      setActiveView('corporateservices');
    } else if (path === '/admin/reports') {
      setActiveView('reports');
    } else if (path === '/admin/settings') {
      setActiveView('settings');
    } else if (path === '/admin/profile') {
      setActiveView('profile');
    } else if (path === '/admin/notifications') {
      setActiveView('notifications');
    }
  }, [location]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'loans':
        return <LoanManagement />;
      case 'insurance':
        return <InsuranceManagement />;
      case 'investments':
        return <InvestmentManagement />;
      case 'taxplanning':
        return <TaxPlanningManagement />;
      case 'taxconsultations':
        return <Inquiry />;
      case 'retailservices':
        return <RetailServicesManagement />;
      case 'corporateservices':
        return <CorporateServicesManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <AdminSettings />;
      case 'profile':
        return <AdminProfile adminProfile={adminProfile} updateAdminProfile={updateAdminProfile} />;
      case 'notifications':
        return <AdminNotifications />;
      default:
        return <AdminDashboard />;
    }
  };

  // All Notifications Component
  const AllNotifications = () => {
    const [filter, setFilter] = useState('all');
    const [showSendModal, setShowSendModal] = useState(false);
    const [newNotification, setNewNotification] = useState({
      title: '',
      message: '',
      type: 'alert',
      priority: 'medium',
      recipients: 'all'
    });
    
    const allNotifications = [
      { id: 1, type: 'loan', title: 'New Loan Applications', message: '5 new loan applications pending review', time: '5 min ago', unread: true, priority: 'high' },
      { id: 2, type: 'user', title: 'User Registrations', message: '12 new users registered today', time: '1 hour ago', unread: true, priority: 'medium' },
      { id: 3, type: 'insurance', title: 'Insurance Claims', message: '3 insurance claims require approval', time: '2 hours ago', unread: false, priority: 'high' },
      { id: 4, type: 'alert', title: 'System Update', message: 'System backup completed successfully', time: '3 hours ago', unread: false, priority: 'low' },
      { id: 5, type: 'investment', title: 'Investment Alerts', message: '2 mutual fund applications need verification', time: '4 hours ago', unread: false, priority: 'medium' },
      { id: 6, type: 'user', title: 'Account Update', message: 'User profile update requests pending', time: '5 hours ago', unread: false, priority: 'low' },
      { id: 7, type: 'loan', title: 'Loan Disbursement', message: '8 loans approved and ready for disbursement', time: '6 hours ago', unread: false, priority: 'high' },
      { id: 8, type: 'alert', title: 'Security Alert', message: 'Multiple failed login attempts detected', time: '8 hours ago', unread: false, priority: 'high' },
      { id: 9, type: 'insurance', title: 'Policy Renewals', message: '15 policies due for renewal this week', time: '1 day ago', unread: false, priority: 'medium' },
      { id: 10, type: 'user', title: 'Support Tickets', message: '4 new support tickets received', time: '1 day ago', unread: false, priority: 'medium' },
    ];

    const filteredNotifications = filter === 'all' 
      ? allNotifications 
      : filter === 'unread'
      ? allNotifications.filter(n => n.unread)
      : allNotifications.filter(n => n.type === filter);

    const unreadCount = allNotifications.filter(n => n.unread).length;

    const getNotificationIcon = (type) => {
      switch(type) {
        case 'loan':
          return (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          );
        case 'user':
          return (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          );
        case 'insurance':
          return (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          );
        case 'investment':
          return (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          );
        case 'alert':
          return (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          );
        default:
          return null;
      }
    };

    const getPriorityBadge = (priority) => {
      const colors = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        low: 'bg-green-100 text-green-700 border-green-200'
      };
      return (
        <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full border ${colors[priority]}`}>
          {priority.toUpperCase()}
        </span>
      );
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">All Notifications</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{unreadCount} unread notifications</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowSendModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold text-sm transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Send Notification
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold text-sm transition-all active:scale-95">
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'loan', label: 'Loans' },
              { value: 'user', label: 'Users' },
              { value: 'insurance', label: 'Insurance' },
              { value: 'investment', label: 'Investments' },
              { value: 'alert', label: 'Alerts' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all active:scale-95 ${
                  filter === filterOption.value
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Notifications</h3>
              <p className="text-sm sm:text-base text-gray-600">You're all caught up! No notifications to display.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer p-3 sm:p-4 md:p-5 border-l-4 ${
                  notification.unread 
                    ? 'border-l-green-600 bg-gradient-to-r from-green-50 to-white' 
                    : 'border-l-gray-300'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                          {notification.title}
                        </h3>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    
                    <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {notification.time}
                      </span>
                      
                      <button className="text-green-700 hover:text-green-800 font-semibold hover:underline">
                        View Details
                      </button>
                      
                      {notification.unread && (
                        <button className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                          Mark as Read
                        </button>
                      )}
                      
                      <button className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing {filteredNotifications.length} of {allNotifications.length} notifications
              </p>
              <div className="flex gap-2">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm transition-all active:scale-95">
                  Previous
                </button>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all active:scale-95">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Notification Modal */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-500">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Send Notification</h2>
                    <p className="text-xs sm:text-sm text-blue-100">Create and send notification to users</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Recipients Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Send To <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { value: 'all', label: 'All Users', icon: '👥' },
                      { value: 'active', label: 'Active Users', icon: '✅' },
                      { value: 'premium', label: 'Premium Users', icon: '⭐' },
                      { value: 'loan', label: 'Loan Applicants', icon: '💰' },
                      { value: 'insurance', label: 'Insurance Holders', icon: '🛡️' },
                      { value: 'custom', label: 'Custom List', icon: '📋' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setNewNotification({...newNotification, recipients: option.value})}
                        className={`p-3 rounded-lg border-2 text-left transition-all active:scale-95 ${
                          newNotification.recipients === option.value
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-xl mb-1">{option.icon}</div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Notification Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      onClick={() => setNewNotification({...newNotification, type: 'alert'})}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                        newNotification.type === 'alert'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Alert
                    </button>
                    <button
                      onClick={() => setNewNotification({...newNotification, type: 'loan'})}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                        newNotification.type === 'loan'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Loan
                    </button>
                    <button
                      onClick={() => setNewNotification({...newNotification, type: 'insurance'})}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                        newNotification.type === 'insurance'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Insurance
                    </button>
                    <button
                      onClick={() => setNewNotification({...newNotification, type: 'investment'})}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                        newNotification.type === 'investment'
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Investment
                    </button>
                    <button
                      onClick={() => setNewNotification({...newNotification, type: 'user'})}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                        newNotification.type === 'user'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      User
                    </button>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { value: 'low', label: 'Low', icon: '🟢', desc: 'Normal notification' },
                      { value: 'medium', label: 'Medium', icon: '🟡', desc: 'Important update' },
                      { value: 'high', label: 'High', icon: '🔴', desc: 'Urgent action required' }
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() => setNewNotification({...newNotification, priority: priority.value})}
                        className={`p-3 rounded-lg border-2 text-center transition-all active:scale-95 ${
                          newNotification.priority === priority.value
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{priority.icon}</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900">{priority.label}</div>
                        <div className="text-[10px] text-gray-600 mt-1 hidden sm:block">{priority.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Notification Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    placeholder="Enter notification title..."
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newNotification.title.length}/100 characters</p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Enter your message here..."
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    maxLength={500}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">{newNotification.message.length}/500 characters</p>
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </h3>
                  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                          {newNotification.title || 'Notification Title'}
                        </h4>
                        <p className="text-xs text-gray-700">
                          {newNotification.message || 'Your notification message will appear here...'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-2">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-4 rounded-b-xl border-t flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm sm:text-base transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newNotification.title && newNotification.message) {
                      alert('Notification sent successfully! ✅');
                      setShowSendModal(false);
                      setNewNotification({
                        title: '',
                        message: '',
                        type: 'alert',
                        priority: 'medium',
                        recipients: 'all'
                      });
                    } else {
                      alert('Please fill in all required fields! ⚠️');
                    }
                  }}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Admin Profile Component
  const AdminProfile = ({ adminProfile, updateAdminProfile }) => {
    const [profileData, setProfileData] = useState({
      fullName: 'Admin User',
      email: 'sudha@gmail.com',
      phone: '+91 98765 43210',
      role: 'Administrator',
      department: '',
      location: 'Mumbai, India',
      bio: '',
      profileImage: null,
      lastLogin: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = React.useRef(null);

    // Load admin profile data when component mounts or adminProfile changes
    useEffect(() => {
      const loadProfileData = async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) return;

          const response = await fetch('http://localhost:8000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setProfileData({
              fullName: data.fullName || 'Admin User',
              email: data.email || 'sudha@gmail.com',
              phone: data.phone || '+91 98765 43210',
              role: 'Administrator',
              department: data.department || '',
              location: data.address || 'Mumbai, India',
              bio: data.bio || '',
              profileImage: data.profileImage || null,
              lastLogin: data.lastLogin || null
            });
            
            if (data.profileImage) {
              const imageUrl = data.profileImage.startsWith('http') 
                ? data.profileImage 
                : `http://localhost:8000${data.profileImage}`;
              setPreviewImage(imageUrl);
            }
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      };

      loadProfileData();
    }, []);

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size should be less than 5MB');
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert('Please upload an image file');
          return;
        }
        
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Upload immediately
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            alert('Please login again');
            return;
          }

          const formData = new FormData();
          formData.append('profileImage', file);

          const response = await fetch('http://localhost:8000/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const updatedProfile = await response.json();
            alert('Profile picture uploaded successfully! ✅');
            
            // Update profile data
            setProfileData(prev => ({
              ...prev,
              profileImage: updatedProfile.profileImage
            }));
            
            // Update parent component and cache
            if (updatedProfile.profileImage) {
              const imageUrl = updatedProfile.profileImage.startsWith('http') 
                ? updatedProfile.profileImage 
                : `http://localhost:8000${updatedProfile.profileImage}`;
              setPreviewImage(imageUrl);
              
              // Update navbar profile
              updateAdminProfile({
                profileImage: updatedProfile.profileImage,
                fullName: updatedProfile.fullName || profileData.fullName,
                email: updatedProfile.email || profileData.email
              });
            }
          } else {
            const errorData = await response.json();
            alert(`Failed to upload: ${errorData.detail || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        }
      }
    };

    const handleRemoveImage = async () => {
      if (!window.confirm('Are you sure you want to remove your profile picture?')) {
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Please login again');
          return;
        }
        
        // Send removal flag to backend
        const formData = new FormData();
        formData.append('removeProfileImage', 'true');
        
        const response = await fetch('http://localhost:8000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const updatedProfile = await response.json();
          setPreviewImage(null);
          setProfileData(prev => ({
            ...prev,
            profileImage: null
          }));
          
          // Update navbar profile
          updateAdminProfile({ profileImage: null });
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          alert('Profile picture removed successfully! ✅');
        } else {
          const errorData = await response.json();
          alert(`Failed to remove profile picture: ${errorData.detail || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error removing image:', error);
        alert('Failed to remove image. Please try again.');
      }
    };

    const handleSave = async () => {
      setIsSaving(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Please login again');
          setIsSaving(false);
          return;
        }

        const formData = new FormData();
        
        // Add all editable fields (NOT email and role as they should not be changed)
        if (profileData.fullName && profileData.fullName.trim()) {
          formData.append('fullName', profileData.fullName.trim());
        }
        if (profileData.phone && profileData.phone.trim()) {
          formData.append('phone', profileData.phone.trim());
        }
        if (profileData.location && profileData.location.trim()) {
          formData.append('address', profileData.location.trim());
        }
        if (profileData.bio && profileData.bio.trim()) {
          formData.append('bio', profileData.bio.trim());
        }
        if (profileData.department && profileData.department.trim()) {
          formData.append('department', profileData.department.trim());
        }
        
        // Add profile image if it's a File object
        if (profileData.profileImage && profileData.profileImage instanceof File) {
          formData.append('profileImage', profileData.profileImage);
        }

        console.log('Sending profile update with fields:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value instanceof File ? `File(${value.name})` : value}`);
        }

        const response = await fetch('http://localhost:8000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        console.log('Response status:', response.status);
        const updatedProfile = await response.json();
        console.log('Updated profile response:', updatedProfile);

        if (response.ok) {
          alert('Profile updated successfully! ✅');
          
          // Update profile data state with response values (only editable fields)
          setProfileData(prev => ({
            ...prev,
            fullName: updatedProfile.fullName !== undefined ? updatedProfile.fullName : prev.fullName,
            phone: updatedProfile.phone !== undefined ? updatedProfile.phone : prev.phone,
            location: updatedProfile.address !== undefined ? updatedProfile.address : prev.location,
            bio: updatedProfile.bio !== undefined ? updatedProfile.bio : prev.bio,
            department: updatedProfile.department !== undefined ? updatedProfile.department : prev.department,
            profileImage: updatedProfile.profileImage !== undefined ? updatedProfile.profileImage : prev.profileImage,
            lastLogin: updatedProfile.lastLogin !== undefined ? updatedProfile.lastLogin : prev.lastLogin
          }));
          
          // Update navbar profile with updated data
          updateAdminProfile({
            fullName: updatedProfile.fullName,
            profileImage: updatedProfile.profileImage
          });
          
          // Update preview image if changed
          if (updatedProfile.profileImage) {
            const imageUrl = updatedProfile.profileImage.startsWith('http') 
              ? updatedProfile.profileImage 
              : `http://localhost:8000${updatedProfile.profileImage}`;
            setPreviewImage(imageUrl);
          }
          
          setIsEditing(false);
        } else {
          const errorMessage = updatedProfile.detail || 'Unknown error';
          alert(`Failed to update profile: ${errorMessage}`);
          console.error('Backend error:', updatedProfile);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      } finally {
        setIsSaving(false);
      }
    };

    const handleInputChange = (field, value) => {
      setProfileData({...profileData, [field]: value});
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your personal information and profile picture</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Picture
          </h2>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            {/* Image Display */}
            <div className="relative group">
              {previewImage ? (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="Profile" 
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-green-600 shadow-2xl"
                  />
                  {isEditing && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-5xl sm:text-6xl md:text-7xl font-bold shadow-2xl border-4 border-green-600">
                  {profileData.fullName.charAt(0)}
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 w-full text-center md:text-left">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Upload Profile Picture</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Click the button below to upload a new profile picture
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isEditing}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isEditing
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white active:scale-95 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choose Image
                </button>
                {previewImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={!isEditing}
                    className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      isEditing
                        ? 'bg-red-100 hover:bg-red-200 text-red-700 active:scale-95 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
              
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500">• Recommended size: 400x400 pixels</p>
                <p className="text-xs text-gray-500">• Maximum file size: 5MB</p>
                <p className="text-xs text-gray-500">• Supported formats: JPG, PNG, GIF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 border-b-2 border-green-600 pb-2">Personal Information</h3>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg transition-all ${
                    isEditing 
                      ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  disabled={true}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg transition-all bg-gray-50 border-gray-200 cursor-not-allowed`}
                  title="Email cannot be changed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg transition-all ${
                    isEditing 
                      ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input 
                  type="text" 
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg transition-all ${
                    isEditing 
                      ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-2">Account Details</h3>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Role</label>
                <input 
                  type="text" 
                  value={profileData.role} 
                  disabled={true}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  title="Role cannot be changed"
                />
                <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Department</label>
                <input 
                  type="text" 
                  value={profileData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg transition-all ${
                    isEditing 
                      ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Account Created</label>
                <input 
                  type="text" 
                  value="January 1, 2024" 
                  readOnly 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Last Login</label>
                <input 
                  type="text" 
                  value={profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  }) : 'Not available'} 
                  readOnly 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Bio / About</label>
            <textarea 
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              rows="4"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg transition-all resize-none ${
                isEditing 
                  ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            ></textarea>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm sm:text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </div>


      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Full-Width Header/Navbar at Top - Fixed */}
      <div className="flex-shrink-0">
        <AdminHeader toggleSidebar={toggleSidebar} setActiveView={setActiveView} adminProfile={adminProfile} />
      </div>
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar - Fixed, No Scroll */}
        <div className="flex-shrink-0">
          <AdminSidebar 
            isOpen={isSidebarOpen}
            activeView={activeView}
            setActiveView={setActiveView}
            toggleSidebar={toggleSidebar}
          />
        </div>
        
        {/* Main Content - Scrollable Only */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 [scroll-behavior:smooth] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-400">
          <div className="p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 w-full max-w-full">
            <div className="w-full">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 backdrop-blur-sm"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
export default AdminPanel;
