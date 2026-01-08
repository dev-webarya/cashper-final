import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to check auth status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    
    // Check if user is admin
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.isAdmin === true);
      } catch (e) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Check auth status on mount and route change
    checkAuthStatus();
  }, [location]);

  // Listen for storage changes (logout from other tabs/components)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === null) {
        // Token or user removed, or localStorage cleared
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom logout event
    const handleLogout = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const handleApplyNow = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('popular-products');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById('popular-products');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    if (isLoggedIn) {
      // If user is logged in, go to appropriate dashboard
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Otherwise go to login page
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Navigate to home after a small delay to allow scroll
    setTimeout(() => {
      navigate('/');
    }, 100);
    setIsMenuOpen(false);
  };

  // Handle navigation link clicks to scroll to hero section
  const handleNavLinkClick = (path) => {
    // Navigate to the page
    navigate(path);
    // Scroll to top (hero section) after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = (dropdownName) =>
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);

  const handleMouseEnter = (dropdownName) => setHoveredDropdown(dropdownName);
  const handleMouseLeave = () => setHoveredDropdown(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const isCurrentPage = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    {
      name: 'Loans',
      dropdown: [
        { name: 'Short-Term Loan', path: '/loans/short-term' },
        { name: 'Personal Loan', path: '/loans/personal' },
        { name: 'Home Loan', path: '/loans/home' },
        { name: 'Business Loan', path: '/loans/business' },
      ],
    },
    {
      name: 'Insurance',
      dropdown: [
        { name: 'Health Insurance', path: '/insurance/health' },
        { name: 'Motor Insurance', path: '/insurance/motor' },
        { name: 'Term Insurance', path: '/insurance/term' },
      ],
    },
    {
      name: 'Investments',
      dropdown: [
        { name: 'Mutual Funds', path: '/investments/mutual-funds' },
        { name: 'SIP', path: '/investments/sip' },
      ],
    },
    {
      name: 'Tax Planning',
      dropdown: [
        { name: 'Personal Tax Planning', path: '/services/tax-planning' },
        { name: 'Business Tax Strategy', path: '/tax-planning/business' },
      ],
    },
    {
      name: 'Retail Services',
      dropdown: [
        { name: 'File Your ITR', path: '/services/file-itr' },
        { name: 'Revise Your ITR', path: '/services/revise-itr' },
        { name: 'Reply to ITR Notice', path: '/services/reply-itr-notice' },
        { name: 'Apply for Individual PAN', path: '/services/apply-individual-pan' },
        { name: 'Apply for HUF PAN', path: '/services/apply-huf-pan' },
        { name: 'Withdraw Your PF', path: '/services/withdraw-pf' },
        { name: 'Update Aadhaar or PAN Details', path: '/services/update-aadhaar-pan' },
        { name: 'Online Trading & Demat', path: '/services/online-trading-demat' },
        { name: 'Bank Account Services', path: '/services/bank-account' },
        { name: 'Financial Planning & Advisory', path: '/services/financial-planning' },
      ],
    },
    {
      name: 'Corporate Services',
      dropdown: [
        { name: 'Register New Company', path: '/services/register-company' },
        { name: 'Compliance for New Company', path: '/services/compliance-new-company' },
        { name: 'Tax Audit', path: '/services/tax-audit' },
        { name: 'Legal Advice', path: '/services/legal-advice' },
        { name: 'Provident Fund Services', path: '/services/provident-fund-services' },
        { name: 'TDS-Related Services', path: '/services/tds-services' },
        { name: 'GST-Related Services', path: '/services/gst-services' },
        { name: 'Payroll Services', path: '/services/payroll-services' },
        { name: 'Accounting & Bookkeeping', path: '/services/accounting-bookkeeping' },
      ],
    },
    { name: 'Contact Us', path: '/contact' },
  ];
  return (
    <nav className="w-full shadow-xl border-b-2 border-blue-100 py-1.5 xs:py-2 sm:py-2.5 md:py-3 lg:py-3 xl:py-3 fixed top-0 z-[9999] bg-white">
      <div className="w-full max-w-[1920px] mx-auto px-4 xs:px-4 sm:px-4 md:px-6 lg:px-8 xl:px-10">
        <div className="flex justify-between items-center h-12 xs:h-13 sm:h-14 md:h-16 lg:h-16 xl:h-18">
          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center group flex-shrink-0 cursor-pointer">
            <img
              src="/logo_company.png"
              alt="Cashper Logo"
              className="h-7 xs:h-8 sm:h-10 md:h-12 lg:h-12 xl:h-12 w-auto group-hover:scale-105 transition-all duration-300"
            />
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0.5">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="relative dropdown-container z-50"
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                {item.dropdown ? (
                  <div className="relative z-50">
                    <button
                      className={`px-2 py-1.5 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs lg:text-sm xl:text-base text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-green-500 hover:to-indigo-100 relative group flex items-center gap-0.5 whitespace-nowrap ${
                        hoveredDropdown === item.name
                          ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50'
                          : ''
                      }`}
                      aria-expanded={hoveredDropdown === item.name}
                      aria-haspopup="true"
                      aria-label={`${item.name} dropdown menu`}
                    >
                      {item.name}
                      <svg
                        className={`w-3 h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 transition-transform duration-300 ${
                          hoveredDropdown === item.name ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </button>

                    {/* Desktop Dropdown Menu */}
                    <div
                      className={`absolute top-full left-0 mt-2 w-56 lg:w-60 xl:w-64 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-300 ease-in-out transform z-[100] ${
                        hoveredDropdown === item.name
                          ? 'opacity-100 visible translate-y-0 scale-100'
                          : 'opacity-0 invisible -translate-y-2 scale-95'
                      }`}
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="py-2 lg:py-3">
                        {item.dropdown.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            onClick={() => handleNavLinkClick(subItem.path)}
                            className="w-full text-left block px-4 lg:px-5 xl:px-6 py-2.5 lg:py-3 text-sm lg:text-base text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 font-medium group/item bg-transparent border-0 cursor-pointer"
                            role="menuitem"
                          >
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></span>
                              {subItem.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavLinkClick(item.path)}
                    className={`px-2 py-1.5 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs lg:text-sm xl:text-base text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-green-500 hover:to-indigo-100 relative group bg-transparent border-0 cursor-pointer whitespace-nowrap ${
                      isCurrentPage(item.path)
                        ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50'
                        : ''
                    }`}
                  >
                    {item.name}
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-1 lg:space-x-1 xl:space-x-1.5 flex-shrink-0">
            <button
              onClick={handleLogin}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white px-4 py-2 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg lg:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 text-sm lg:text-sm xl:text-base cursor-pointer whitespace-nowrap mr-4 lg:mr-6 xl:mr-8"
            >
              Login
            </button>
          </div>

          {/* Mobile & Tablet Menu Button */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 active:text-blue-700 focus:outline-none p-1.5 xs:p-2 sm:p-2.5 md:p-2.5 rounded-lg xs:rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 active:bg-gradient-to-r active:from-blue-100 active:to-indigo-100 transition-all duration-300 touch-manipulation"
              aria-expanded={isMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 md:h-7 md:w-7 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t-2 border-blue-100 shadow-2xl max-h-[calc(100vh-60px)] xs:max-h-[calc(100vh-65px)] sm:max-h-[calc(100vh-70px)] md:max-h-[calc(100vh-75px)] overflow-y-auto animate-slideDown scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 z-[100]">
            <div className="px-2 xs:px-3 sm:px-4 md:px-5 pt-2 xs:pt-3 sm:pt-4 md:pt-4 pb-4 xs:pb-5 sm:pb-6 md:pb-6 space-y-1 xs:space-y-1.5 sm:space-y-2 md:space-y-2">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <div>
                      {/* Dropdown Toggle Button */}
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`w-full flex items-center justify-between px-2.5 xs:px-3 sm:px-4 md:px-4 py-2 xs:py-2.5 sm:py-3 md:py-3 text-xs xs:text-sm sm:text-base md:text-lg text-gray-700 hover:text-blue-600 active:text-blue-700 font-semibold rounded-lg xs:rounded-xl transition-all duration-300 touch-manipulation ${
                          activeDropdown === item.name
                            ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50'
                            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 active:bg-gradient-to-r active:from-blue-100 active:to-indigo-100'
                        }`}
                        aria-expanded={activeDropdown === item.name}
                        aria-label={`${item.name} dropdown menu`}
                      >
                        <span>{item.name}</span>
                        <svg
                          className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-5 md:h-5 transition-transform duration-300 ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      
                      {/* Dropdown Sub-Items */}
                      {activeDropdown === item.name && (
                        <div className="pl-2 xs:pl-3 sm:pl-4 md:pl-4 space-y-0.5 xs:space-y-1 mt-1 xs:mt-1.5 sm:mt-2 animate-slideDown">
                          {item.dropdown.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              onClick={() => handleNavLinkClick(subItem.path)}
                              className="w-full text-left flex items-center px-2.5 xs:px-3 sm:px-4 md:px-4 py-2 xs:py-2.5 sm:py-3 md:py-3 text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 hover:text-blue-600 active:text-blue-700 font-medium rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 active:bg-gradient-to-r active:from-blue-100 active:to-indigo-100 transition-all duration-200 bg-transparent border-0 cursor-pointer touch-manipulation"
                            >
                              <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2 sm:h-2 md:w-2 md:h-2 bg-blue-400 rounded-full mr-2 xs:mr-2.5 sm:mr-3 md:mr-3 flex-shrink-0"></span>
                              <span className="flex-1">{subItem.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavLinkClick(item.path)}
                      className={`w-full text-left block px-2.5 xs:px-3 sm:px-4 md:px-4 py-2 xs:py-2.5 sm:py-3 md:py-3 text-xs xs:text-sm sm:text-base md:text-lg font-semibold rounded-lg xs:rounded-xl transition-all duration-300 text-gray-700 hover:text-blue-600 active:text-blue-700 hover:bg-gradient-to-r hover:from-green-500 hover:to-indigo-100 active:bg-gradient-to-r active:from-green-600 active:to-indigo-200 bg-transparent border-0 cursor-pointer touch-manipulation ${
                        isCurrentPage(item.path)
                          ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50'
                          : ''
                      }`}
                    >
                      {item.name}
                    </button>
                  )}
                </div>
              ))}
              
              {/* Mobile & Tablet CTA Buttons */}
              <div className="pt-3 xs:pt-4 sm:pt-5 md:pt-6 space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-3 border-t-2 border-gray-100 mt-2 xs:mt-3 sm:mt-4 md:mt-4">
                <button
                  onClick={handleLogin}
                  className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white px-4 xs:px-5 sm:px-6 md:px-6 py-2.5 xs:py-3 sm:py-3.5 md:py-4 rounded-lg xs:rounded-xl font-bold transition-all duration-300 text-center shadow-lg hover:shadow-xl text-xs xs:text-sm sm:text-base md:text-lg cursor-pointer transform hover:scale-105 active:scale-95 touch-manipulation"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
