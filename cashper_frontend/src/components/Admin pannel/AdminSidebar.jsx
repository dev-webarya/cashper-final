import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, IndianRupee, Shield, TrendingUp, Calculator, BarChart3, Settings as SettingsIcon, ArrowLeft, Calendar, ShoppingBag, Building2, LayoutDashboard } from 'lucide-react';

const AdminSidebar = ({ isOpen, activeView, setActiveView, toggleSidebar }) => {
  const navigate = useNavigate();
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'users',
      name: 'User Management',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'loans',
      name: 'Loan Management',
      icon: <IndianRupee className="w-5 h-5" />
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'taxplanning',
      name: 'Tax Planning',
      icon: <Calculator className="w-5 h-5" />
    },
    {
      id: 'retailservices',
      name: 'Retail Services',
      icon: <ShoppingBag className="w-5 h-5" />
    },
    {
      id: 'corporateservices',
      name: 'Corporate Services',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 'taxconsultations',
      name: 'Inquiry',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'reports',
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <SettingsIcon className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 bottom-0 z-40 w-[280px] xs:w-72 sm:w-64 lg:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between p-3 xs:p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white flex-shrink-0">
            <h2 className="text-base xs:text-lg font-bold text-gray-900">Admin Menu</h2>
            <button
              onClick={toggleSidebar}
              className="p-1.5 xs:p-2 text-gray-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors active:scale-95 [touch-action:manipulation] [-webkit-tap-highlight-color:rgba(16,185,129,0.2)]"
              aria-label="Close sidebar"
            >
              <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-3 xs:py-4 px-2 xs:px-3 sm:px-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-green-500 [&::-webkit-scrollbar-thumb]:rounded">
            <ul className="space-y-1 xs:space-y-1.5">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(`/admin/${item.id}`);
                      setActiveView(item.id);
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={`w-full flex items-center space-x-2.5 xs:space-x-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg transition-all duration-200 group active:scale-[0.98] [touch-action:manipulation] [-webkit-tap-highlight-color:rgba(16,185,129,0.2)] ${
                      activeView === item.id
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    <span className={`transition-transform duration-200 flex-shrink-0 ${
                      activeView === item.id ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm xs:text-base truncate min-w-0">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="p-2 xs:p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] [touch-action:manipulation] [-webkit-tap-highlight-color:rgba(16,185,129,0.2)]"
            >
              <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" />
              <span className="font-semibold text-sm xs:text-base whitespace-nowrap">Back to Home</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
