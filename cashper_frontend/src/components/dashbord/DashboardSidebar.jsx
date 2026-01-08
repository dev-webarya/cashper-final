import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, IndianRupee, Shield, TrendingUp, Calculator, 
  Bell, FileText, HeadphonesIcon, ShoppingBag, Building2
} from 'lucide-react';
const DashboardSidebar = ({ isOpen, activeView, setActiveView, toggleSidebar }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(3); // Unread notifications count
  
  const menuItems = [
    {
      id: 'overview',
      name: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      badge: null,
      path: '/dashboard/overview'
    },
    {
      id: 'loans',
      name: 'My Loans',
      icon: <IndianRupee className="w-5 h-5" />,
      badge: null,
      path: '/dashboard/loans'
    },
    {
      id: 'insurance',
      name: 'My Insurance',
      icon: <Shield className="w-5 h-5" />,
      badge: null,
      path: '/dashboard/insurance'
    },
    {
      id: 'investments',
      name: 'My Investments',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: null,
      path: '/dashboard/investments'
    },
    {
      id: 'tax',
      name: 'Tax Planning',
      icon: <Calculator className="w-5 h-5" />,
      badge: null,
      path: '/dashboard/tax'
    },
    {
      id: 'retail-services',
      name: 'Retail Services',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: null,
      path: '/dashboard/retail-services'
    },
    {
      id: 'corporate-services',
      name: 'Corporate Services',
      icon: <Building2 className="w-5 h-5" />,
      badge: null,
      path: '/dashboard/corporate-services'
    }
  ];

  const quickAccessItems = [
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: notifications,
      onClick: () => {
        navigate('/dashboard/notifications');
        setActiveView('notifications');
        if (window.innerWidth < 1024) toggleSidebar();
      }
    },
    {
      id: 'documents',
      name: 'My Documents',
      icon: <FileText className="w-5 h-5" />,
      badge: null,
      onClick: () => {
        navigate('/dashboard/documents');
        setActiveView('documents');
        if (window.innerWidth < 1024) toggleSidebar();
      }
    },
    {
      id: 'support',
      name: 'Contact Support',
      icon: <HeadphonesIcon className="w-5 h-5" />,
      onClick: () => {
        navigate('/dashboard/support');
        setActiveView('support');
        if (window.innerWidth < 1024) toggleSidebar();
      }
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-14 xs:top-16 sm:top-16 bottom-0 left-0 z-50 w-64 xs:w-72 sm:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none lg:h-[calc(100vh-64px)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Dashboard Menu</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 xs:px-4 overflow-y-auto">
            {/* Main Services */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-3">Services</h3>
              <ul className="space-y-1 xs:space-y-1.5">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setActiveView(item.id);
                        if (window.innerWidth < 1024) {
                          toggleSidebar();
                        }
                      }}
                      className={`w-full flex items-center justify-between space-x-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg transition-all duration-200 group ${
                        activeView === item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`transition-transform duration-200 ${
                          activeView === item.id ? 'scale-110' : 'group-hover:scale-110'
                        }`}>
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm xs:text-base">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Access */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-3">Quick Access</h3>
              <ul className="space-y-1 xs:space-y-1.5">
                {quickAccessItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between space-x-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg transition-all duration-200 group ${
                        activeView === item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="transition-transform duration-200 group-hover:scale-110">
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm xs:text-base">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};
export default DashboardSidebar;
