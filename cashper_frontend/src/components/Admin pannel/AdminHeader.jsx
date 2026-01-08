import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Settings as SettingsIcon, Menu } from 'lucide-react';

const AdminHeader = ({ toggleSidebar, setActiveView, adminProfile }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleMenuClick = (view) => {
    navigate(`/admin/${view}`);
    setActiveView(view);
    setShowUserMenu(false);
  };

  const notifications = [
    { id: 1, type: 'loan', message: '5 new loan applications pending review', time: '5 min ago', unread: true },
    { id: 2, type: 'user', message: '12 new users registered today', time: '1 hour ago', unread: true },
    { id: 3, type: 'insurance', message: '3 insurance claims require approval', time: '2 hours ago', unread: false },
    { id: 4, type: 'alert', message: 'System backup completed successfully', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Search functionality - searchable items for Admin
  const searchableItems = [
    { title: 'Dashboard', category: 'Navigation', action: () => { navigate('/admin/dashboard'); setActiveView('dashboard'); } },
    { title: 'User Management', category: 'Management', action: () => { navigate('/admin/users'); setActiveView('users'); } },
    { title: 'Loan Management', category: 'Management', action: () => { navigate('/admin/loans'); setActiveView('loans'); } },
    { title: 'Insurance Management', category: 'Management', action: () => { navigate('/admin/insurance'); setActiveView('insurance'); } },
    { title: 'Investment Management', category: 'Management', action: () => { navigate('/admin/investments'); setActiveView('investments'); } },
    { title: 'Tax Planning Management', category: 'Management', action: () => { navigate('/admin/taxplanning'); setActiveView('taxplanning'); } },
    { title: 'Reports & Analytics', category: 'Analytics', action: () => { navigate('/admin/reports'); setActiveView('reports'); } },
    { title: 'Settings', category: 'Configuration', action: () => { navigate('/admin/settings'); setActiveView('settings'); } },
    { title: 'Notifications', category: 'Communication', action: () => { navigate('/admin/notifications'); setActiveView('notifications'); } },
    { title: 'System Logs', category: 'System', action: () => { navigate('/admin/logs'); setActiveView('logs'); } },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(value.length > 0);
  };

  const filteredSearchResults = searchableItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchItemClick = (item) => {
    item.action();
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminProfile');
    
    // Close the menu
    setShowUserMenu(false);
    
    // Redirect to login
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 xs:h-16 sm:h-16">
          {/* Left Section: Logo & Menu Button */}
          <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 xs:p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg focus:outline-none transition-colors active:scale-95"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src="/logo_company.png" 
                alt=" Cashper Logo" 
                className="h-7 xs:h-8 sm:h-10 md:h-12 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Admin Badge */}
            <div className="hidden md:flex items-center ml-2 lg:ml-4">
              <span className="px-2.5 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white text-[10px] sm:text-xs font-bold rounded-full">
                ADMIN PANEL
              </span>
            </div>
          </div>

          {/* Right Section: Search, Notifications, User */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 md:space-x-3">
            {/* Search Bar - Hidden on small mobile */}
            <div className="hidden sm:block relative">
              <div className="flex items-center bg-gray-100 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 max-w-[120px] md:max-w-xs lg:max-w-sm focus-within:ring-2 focus-within:ring-green-500 transition-all">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => searchTerm && setShowSearchResults(true)}
                  className="ml-1.5 sm:ml-2 bg-transparent outline-none border-none focus:ring-0 text-xs sm:text-sm text-gray-700 placeholder-gray-400 w-full min-w-0"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowSearchResults(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
                      <h3 className="text-sm font-semibold text-white">Search Results</h3>
                    </div>
                    {filteredSearchResults.length > 0 ? (
                      <div className="py-1">
                        {filteredSearchResults.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchItemClick(item)}
                            className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 active:bg-green-100"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                              </div>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">No results found for "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Search Icon for Mobile */}
            <button 
              onClick={() => {
                setShowSearchResults(!showSearchResults);
                setSearchTerm('');
              }}
              className="sm:hidden p-1.5 xs:p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors active:scale-95"
            >
              <Search className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 xs:p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] xs:w-80 sm:w-96 max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 z-40">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 xs:px-4 py-2.5 xs:py-3 rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-xs xs:text-sm sm:text-base">Notifications</h3>
                        <span className="text-[10px] xs:text-xs bg-white/20 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-white">{unreadCount} new</span>
                      </div>
                    </div>
                    <div className="max-h-[60vh] xs:max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-3 xs:px-4 py-2.5 xs:py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100 ${
                            notification.unread ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2 xs:space-x-3">
                            <div className={`w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full mt-1.5 xs:mt-2 flex-shrink-0 ${notification.unread ? 'bg-green-600' : 'bg-gray-300'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] xs:text-xs sm:text-sm text-gray-800 font-medium leading-snug">{notification.message}</p>
                              <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 mt-0.5 xs:mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 xs:px-4 py-2 xs:py-3 bg-gray-50 text-center border-t rounded-b-xl">
                      <button 
                        onClick={() => {
                          setActiveView('notifications');
                          setShowNotifications(false);
                        }}
                        className="text-[11px] xs:text-xs sm:text-sm text-green-700 hover:text-green-800 font-semibold active:scale-95 transition-transform"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 p-0.5 xs:p-1 hover:bg-green-50 rounded-lg transition-colors active:scale-95"
                aria-label="User menu"
              >
                {adminProfile?.profileImage ? (
                  <img 
                    src={adminProfile.profileImage.startsWith('http') ? adminProfile.profileImage : `http://localhost:8000${adminProfile.profileImage}`}
                    alt="Admin Profile"
                    className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover shadow-lg border-2 border-green-600"
                    onError={(e) => {
                      console.error('Failed to load profile image:', adminProfile.profileImage);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-semibold text-xs xs:text-sm sm:text-base shadow-lg"
                  style={{ display: adminProfile?.profileImage ? 'none' : 'flex' }}
                >
                  {adminProfile?.fullName?.charAt(0) || 'AD'}
                </div>
                <svg className="hidden sm:block w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-52 xs:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-40">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 xs:px-4 py-2.5 xs:py-3 rounded-t-xl">
                      <p className="text-white font-semibold text-xs xs:text-sm">{adminProfile?.fullName || 'Admin User'}</p>
                      <p className="text-[10px] xs:text-xs text-green-100 truncate">{adminProfile?.email || 'sudha@gmail.com'}</p>
                    </div>
                    <div className="py-1.5 xs:py-2">
                      <button 
                        onClick={() => handleMenuClick('profile')}
                        className="w-full flex items-center space-x-2 px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors active:bg-green-100"
                      >
                        <span>My Profile</span>
                      </button>
                      <button 
                        onClick={() => handleMenuClick('settings')}
                        className="w-full flex items-center space-x-2 px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors active:bg-green-100"
                      >
                        <span>Settings</span>
                      </button>
                    </div>
                    <div className="py-1.5 xs:py-2 border-t border-gray-200">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm text-red-600 hover:bg-red-50 transition-colors active:bg-red-100"
                      >
                        <LogOut className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
