import React from 'react';
import { useNavigate } from 'react-router-dom';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Navigate to home after a small delay to allow scro
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  // Handle all footer link clicks to scroll to hero section
  const handleLinkClick = (path) => {
    // Navigate to the page
    navigate(path);
    // Scroll to top (hero section) after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };
  const footerLinks = {
    company: [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Contact Us", path: "/contact" }
    ],
    legal: [
      { name: "Terms of Service", path: "/legal/terms" },
      { name: "Privacy Policy", path: "/legal/privacy" },
      { name: "Cookie Policy", path: "/legal/cookies" }
    ],
    insurance: [
      { name: "Health Insurance", path: "/insurance/health" },
      { name: "Motor Insurance", path: "/insurance/motor" },
      { name: "Term Insurance", path: "/insurance/term" }
    ],
    investments: [
      { name: "Mutual Funds", path: "/investments/mutual-funds" },
      { name: "SIP", path: "/investments/sip" }
    ],
    taxPlanning: [
      { name: "Personal Tax Planning", path: "/services/tax-planning" },
      { name: "Business Tax Strategy", path: "/tax-planning/business" }
    ],
    retailServices: [
      { name: "File Your ITR", path: "/services/file-itr" },
      { name: "Revise Your ITR", path: "/services/revise-itr" },
      { name: "Reply to ITR Notice", path: "/services/reply-itr-notice" },
      { name: "Apply for Individual PAN", path: "/services/apply-individual-pan" },
      { name: "Apply for HUF PAN", path: "/services/apply-huf-pan" },
      { name: "Withdraw Your PF", path: "/services/withdraw-pf" },
      { name: "Update Aadhaar or PAN", path: "/services/update-aadhaar-pan" },
      { name: "Online Trading & Demat", path: "/services/online-trading-demat" },
      { name: "Bank Account Services", path: "/services/bank-account" },
      { name: "Financial Planning & Advisory", path: "/services/financial-planning" }
    ],
    corporateServices: [
      { name: "Register New Company", path: "/services/register-company" },
      { name: "Compliance for New Company", path: "/services/compliance-new-company" },
      { name: "Tax Audit", path: "/services/tax-audit" },
      { name: "Legal Advice", path: "/services/legal-advice" },
      { name: "Provident Fund Services", path: "/services/provident-fund-services" },
      { name: "TDS Services", path: "/services/tds-services" },
      { name: "GST Services", path: "/services/gst-services" },
      { name: "Payroll Services", path: "/services/payroll-services" },
      { name: "Accounting & Bookkeeping", path: "/services/accounting-bookkeeping" }
    ],
    loans: [
      { name: "Short-Term Loan", path: "/loans/short-term" },
      { name: "Personal Loan", path: "/loans/personal" },
      { name: "Home Loan", path: "/loans/home" },
      { name: "Business Loan", path: "/loans/business" }
    ],
    
  };

  const socialLinks = [
    { 
      name: "Facebook", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ), 
      url: "https://www.facebook.com/profile.php?id=61585416795807" 
    },
    { 
      name: "Twitter", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ), 
      url: "#" 
    },
    { 
      name: "LinkedIn", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ), 
      url: "https://www.linkedin.com/company/cashper-ai/" 
    },
    { 
      name: "Instagram", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ), 
      url: "https://www.instagram.com/cashper.ai?igsh=MWZ5dXhianFoemphaQ==" 
    },
    { 
      name: "YouTube", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ), 
      url: "https://www.youtube.com/@CASHPER-n7z" 
    }
  ];
  return (
   <div className='bg-gray-900 text-white w-full overflow-hidden'>
     <footer className="w-full max-w-7xl py-8 sm:py-10 mx-auto">
      {/* Main Footer Content */}
      <div className="w-full px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-6 xs:py-7 sm:py-8 md:py-10 lg:py-12">
        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          
          {/* Column 1 - Company Info & Contact */}
          <div className="text-center md:text-left">
            <div className="mb-4 xs:mb-5 sm:mb-6">
              <img 
                src="/logo_company.png" 
                alt="Cashper" 
                onClick={handleLogoClick}
                className='h-9 xs:h-10 sm:h-12 md:h-14 lg:h-16 w-auto mb-3 xs:mb-3.5 sm:mb-4 mx-auto sm:mx-0 cursor-pointer hover:scale-105 transition-all duration-300' 
              />
              <p className="text-gray-300 text-xs xs:text-sm sm:text-sm md:text-base lg:text-base leading-relaxed mb-4 xs:mb-5 sm:mb-6 max-w-xs sm:max-w-sm md:max-w-md mx-auto sm:mx-0">
                Your trusted partner for comprehensive financial solutions. 
                We provide loans, insurance, investments, and tax planning services to help you achieve your financial goals.
              </p>
            </div>
            {/* Contact Info - Responsive layout */}
            <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 mb-4 xs:mb-5 sm:mb-6">
              <div className="flex items-start sm:items-center justify-center sm:justify-start space-x-2 xs:space-x-2.5 sm:space-x-3">
                <span className="text-green-600 text-base xs:text-lg sm:text-lg md:text-xl flex-shrink-0 mt-0.5 sm:mt-0">📞</span>
                <span className="text-gray-300 text-xs xs:text-sm sm:text-sm md:text-base break-words">
                  <a href="tel:6200755759" className="hover:text-green-500 transition-all duration-300">6200755759</a>
                  <br/>
                  <a href="tel:7393080847" className="hover:text-green-500 transition-all duration-300">7393080847</a>
                </span>
              </div>
              <div className="flex items-start sm:items-center justify-center sm:justify-start space-x-2 xs:space-x-2.5 sm:space-x-3">
                <span className="text-green-600 text-base xs:text-lg sm:text-lg md:text-xl flex-shrink-0 mt-0.5 sm:mt-0">✉️</span>
                <a href="mailto:info@cashper.ai" className="text-gray-300 hover:text-green-500 transition-all duration-300 text-xs xs:text-sm sm:text-sm md:text-base break-all">info@cashper.ai</a>
              </div>
              <div className="flex items-start sm:items-center justify-center sm:justify-start space-x-2 xs:space-x-2.5 sm:space-x-3">
                <svg className="text-green-600 w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 flex-shrink-0 mt-1 sm:mt-0.5 md:mt-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-gray-300 text-xs xs:text-sm sm:text-sm md:text-base break-words leading-relaxed">B - 3011, Gaur Siddhartham, Siddhartha Vihar, Ghaziabad, Uttar Pradesh - 201009</span>
              </div>
            </div>
            
            {/* Social Media - Responsive grid */}
            <div className="mt-4 xs:mt-5 sm:mt-6">
              <h4 className="text-sm xs:text-base sm:text-base md:text-lg font-semibold mb-3 xs:mb-3.5 sm:mb-4 text-green-600 text-center sm:text-left">Follow Us</h4>
              <div className="flex justify-center sm:justify-start flex-wrap gap-2 xs:gap-2.5 sm:gap-3 md:gap-3.5">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 xs:w-10 xs:h-10 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
                    title={social.name}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 - Retail Services & Corporate Services in Flex Row */}
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
              {/* Retail Services */}
              <div className="flex-1">
                <h4 className="text-lg md:text-xl font-semibold mb-4 text-green-600">Retail Services</h4>
                <ul className="space-y-2">
                  {footerLinks.retailServices.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleLinkClick(link.path)}
                        className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Corporate Services */}
              <div className="flex-1">
                <h4 className="text-lg md:text-xl font-semibold mb-4 text-green-600">Corporate Services</h4>
                <ul className="space-y-2">
                  {footerLinks.corporateServices.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleLinkClick(link.path)}
                        className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3 - All Other Services in 2 Rows */}
          <div className="text-center md:text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Row */}
              <div className="space-y-6">
                {/* Company Links */}
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 text-green-600">Company</h4>
                  <ul className="space-y-2">
                    {footerLinks.company.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Loans */}
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 text-green-600">Loans</h4>
                  <ul className="space-y-2">
                    {footerLinks.loans.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Insurance */}
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 text-green-600">Insurance</h4>
                  <ul className="space-y-2">
                    {footerLinks.insurance.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Second Row */}
              <div className="space-y-6">
                {/* Investments */}
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 text-green-600">Investments</h4>
                  <ul className="space-y-2">
                    {footerLinks.investments.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tax Planning */}
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 text-green-600">Tax Planning</h4>
                  <ul className="space-y-2">
                    {footerLinks.taxPlanning.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 text-green-600">Legal</h4>
                  <ul className="space-y-2">
                    {footerLinks.legal.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-gray-300 hover:text-green-500 transition-all duration-300 text-sm md:text-base block py-1 cursor-pointer bg-transparent border-0 w-full text-center md:text-left hover:translate-x-1"
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </footer>
   </div>
  );
};

export default Footer;
