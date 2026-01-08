import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Settings as SettingsIcon, HelpCircle, Menu, X, Edit, Lock, UserCircle } from 'lucide-react';
import { logoutUser } from '../../services/api';
import { getMyNotifications, getUnreadCount } from '../../services/notificationApi';

const DashboardHeader = ({ toggleSidebar, setActiveView, userData }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await getMyNotifications({ limit: 5, include_read: false });
      setNotifications(data.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: getTimeAgo(n.createdAt),
        unread: !n.isRead
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    setActiveView('profile');
    setShowUserMenu(false);
  };

  const handleEditProfileClick = () => {
    navigate('/dashboard/profile/edit');
    setActiveView('profile-edit');
    setShowUserMenu(false);
  };

  const handleChangePasswordClick = () => {
    navigate('/dashboard/settings');
    setShowUserMenu(false);
    setActiveView('change-password');
  };

  const handleViewAllNotifications = () => {
    navigate('/dashboard/notifications');
    setShowNotifications(false);
    setActiveView('all-notifications');
  };

  // Search functionality - searchable items
  const searchableItems = [
    { title: 'Dashboard', category: 'Navigation', action: () => { navigate('/dashboard/overview'); setActiveView('overview'); } },
    { title: 'Loans', category: 'Services', action: () => { navigate('/dashboard/loans'); setActiveView('loans'); } },
    { title: 'Insurance', category: 'Services', action: () => { navigate('/dashboard/insurance'); setActiveView('insurance'); } },
    { title: 'Investments', category: 'Services', action: () => { navigate('/dashboard/investments'); setActiveView('investments'); } },
    { title: 'Tax Planning', category: 'Services', action: () => { navigate('/dashboard/tax'); setActiveView('tax-planning'); } },
    { title: 'My Profile', category: 'Account', action: () => { navigate('/dashboard/profile'); setActiveView('profile'); } },
    { title: 'Settings', category: 'Account', action: () => { navigate('/dashboard/settings'); setActiveView('settings'); } },
    { title: 'Change Password', category: 'Account', action: () => { navigate('/dashboard/settings'); setActiveView('change-password'); } },
    { title: 'Calculator Management', category: 'Tools', action: () => { navigate('/dashboard/calculators'); setActiveView('calculator-management'); } },
    { title: 'All Notifications', category: 'Account', action: () => { navigate('/dashboard/notifications'); setActiveView('all-notifications'); } },
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

  const handleLogout = async () => {
    try {
      // Call backend API to logout
      await logoutUser();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Navigate to login regardless (token is cleared)
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 xs:h-16 sm:h-16">
          {/* Left Section: Logo & Menu Button */}
          <div className="flex items-center space-x-3 xs:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg focus:outline-none transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src="/logo_company.png" 
                alt=" Cashper Logo" 
                className="h-8 xs:h-10 sm:h-12 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Welcome Message - Hidden on mobile */}
            <div className="hidden md:block ml-4">
              <h1 className="text-base lg:text-lg font-bold text-gray-900">
                Welcome back, <span className="text-green-700">{userData?.name || 'User'}</span>
              </h1>
              <p className="text-xs text-gray-500">Manage your finances</p>
            </div>
          </div>

          {/* Right Section: Search, Notifications, User */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3">
            {/* Search Bar - Hidden on small mobile */}
            <div className="hidden sm:block relative">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 sm:py-2 max-w-xs lg:max-w-sm focus-within:ring-2 focus-within:ring-green-500 transition-all">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => searchTerm && setShowSearchResults(true)}
                  className="ml-2 bg-transparent outline-none border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 w-20 sm:w-32 lg:w-48"
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
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Search Results</h3>
                    </div>
                    {filteredSearchResults.length > 0 ? (
                      <div className="py-1">
                        {filteredSearchResults.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchItemClick(item)}
                            className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0"
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
              className="sm:hidden p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 xs:w-6 xs:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[18px] text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 xs:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-40">
                    <div className="p-3 xs:p-4 border-b border-gray-200">
                      <h3 className="text-sm xs:text-base font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                          <p className="text-xs text-gray-500 mt-2">Loading...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 xs:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              notification.unread ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-xs xs:text-sm font-semibold text-gray-900">{notification.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-[10px] xs:text-xs text-gray-400 mt-1">{notification.time}</p>
                              </div>
                              {notification.unread && (
                                <span className="w-2 h-2 bg-green-600 rounded-full mt-1"></span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-gray-200">
                      <button 
                        onClick={handleViewAllNotifications}
                        className="text-xs xs:text-sm text-green-700 hover:text-green-800 font-medium"
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
                className="flex items-center space-x-1 xs:space-x-2 p-1 hover:bg-green-50 rounded-lg transition-colors"
                aria-label="User menu"
              >
                {userData?.profileImage ? (
                  <img 
                    src={userData.profileImage.startsWith('http') ? userData.profileImage : `http://localhost:8000${userData.profileImage}`} 
                    alt={userData?.name || 'User'}
                    className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-green-500"
                    onError={(e) => {
                      console.error('Navbar profile image failed to load:', userData.profileImage);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-semibold text-sm xs:text-base">
                    {userData?.initials || userData?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <svg className="hidden sm:block w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-40">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{userData?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{userData?.email || 'user@example.com'}</p>
                    </div>
                    <div className="py-2">
                      <button 
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <UserCircle className="w-4 h-4 text-blue-600 group-hover:text-green-600" />
                        </div>
                        <span className="font-medium">My Profile</span>
                      </button>
                      
                      <button 
                        onClick={handleEditProfileClick}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <Edit className="w-4 h-4 text-purple-600 group-hover:text-green-600" />
                        </div>
                        <span className="font-medium">Edit Profile</span>
                      </button>
                      
                      <button 
                        onClick={handleChangePasswordClick}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <Lock className="w-4 h-4 text-orange-600 group-hover:text-green-600" />
                        </div>
                        <span className="font-medium">Change Password</span>
                      </button>
                    </div>
                    <div className="py-2 border-t border-gray-200">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-semibold">Logout</span>
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

export default DashboardHeader;
