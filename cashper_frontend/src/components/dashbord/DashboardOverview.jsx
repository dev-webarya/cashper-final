import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Shield, TrendingUp, PiggyBank, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, FileText, CreditCard, Home, Car, Briefcase, Heart, ShieldCheck, Activity, Calculator, DollarSign, TrendingDown, PieChart, ChevronDown, X, ShoppingBag, Building2, BarChart3 } from 'lucide-react';
import { getDashboardStats, getFinancialGrowthTrend, getApplicationStatusOverview, getRecentActivities } from '../../services/dashboardApi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoanFormPopup from './LoanFormPopup';

const DashboardOverview = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // New state for analytics data
  const [financialGrowthData, setFinancialGrowthData] = useState([]);
  const [applicationStatusData, setApplicationStatusData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [growthPeriod, setGrowthPeriod] = useState('6months');
  const [loadingGrowth, setLoadingGrowth] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Fetch all dashboard data on mount
  useEffect(() => {
    // fetchDashboardStats(); // Removed - stats cards not needed
    fetchFinancialGrowth(growthPeriod);
    fetchApplicationStatus();
    fetchRecentActivities();
  }, []);

  // Refetch financial growth when period changes
  useEffect(() => {
    fetchFinancialGrowth(growthPeriod);
  }, [growthPeriod]);

  const fetchFinancialGrowth = async (period) => {
    try {
      setLoadingGrowth(true);
      const data = await getFinancialGrowthTrend(period);
      setFinancialGrowthData(data.chartData || []);
    } catch (error) {
      console.error('Error fetching financial growth:', error);
      // Fallback to default data
      setFinancialGrowthData([
        { month: 'Jan', loans: 0, investments: 0, insurance: 0 },
        { month: 'Feb', loans: 0, investments: 0, insurance: 0 },
        { month: 'Mar', loans: 0, investments: 0, insurance: 0 },
        { month: 'Apr', loans: 0, investments: 0, insurance: 0 },
        { month: 'May', loans: 0, investments: 0, insurance: 0 },
        { month: 'Jun', loans: 0, investments: 0, insurance: 0 }
      ]);
    } finally {
      setLoadingGrowth(false);
    }
  };

  const fetchApplicationStatus = async () => {
    try {
      setLoadingStatus(true);
      const data = await getApplicationStatusOverview();
      setApplicationStatusData(data.chartData || []);
    } catch (error) {
      console.error('Error fetching application status:', error);
      // Fallback to default data
      setApplicationStatusData([
        { status: 'Approved', count: 0, fill: '#10b981' },
        { status: 'Pending', count: 0, fill: '#f59e0b' },
        { status: 'Under Review', count: 0, fill: '#3b82f6' },
        { status: 'Rejected', count: 0, fill: '#ef4444' }
      ]);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setLoadingActivities(true);
      const data = await getRecentActivities(10);
      setRecentActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Helper function to get icon based on activity type and status
  const getActivityIcon = (type, status) => {
    if (status === 'approved') return CheckCircle;
    if (status === 'pending' || status === 'under_review') return Clock;
    if (status === 'rejected') return AlertCircle;
    if (status === 'success') return CheckCircle;
    
    // Default based on type
    if (type === 'loan') return IndianRupee;
    if (type === 'investment') return TrendingUp;
    if (type === 'insurance') return Shield;
    if (type === 'document') return FileText;
    return Activity;
  };

 
  // Available Services - Comprehensive List
  const loanServices = [
    { name: 'Personal Loan', icon: '💵', route: '/personal-loan' },
    { name: 'Home Loan', icon: '🏠', route: '/home-loan' },
    { name: 'Business Loan', icon: '💼', route: '/business-loan' },
    { name: 'Short Term Loan', icon: '⚡', route: '/short-term-loan' },
    { name: 'Education Loan', icon: '🎓', route: '/education-loan' },
    { name: 'Car Loan', icon: '🚗', route: '/car-loan' }
  ];

  const insuranceServices = [
    { name: 'Health Insurance', icon: '❤️', route: '/health-insurance' },
    { name: 'Motor Insurance', icon: '🚗', route: '/motor-insurance' },
    { name: 'Term Insurance', icon: '🛡️', route: '/term-insurance' },
    { name: 'Life Insurance', icon: '👨‍👩‍👧‍👦', route: '/life-insurance' }
  ];

  const investmentServices = [
    { name: 'Mutual Funds', icon: '📊', route: '/mutual-funds' },
    { name: 'SIP Investment', icon: '📈', route: '/sip' },
    { name: 'Portfolio Management', icon: '💼', route: '/investments' }
  ];

  const taxServices = [
    { name: 'Personal Tax Planning', icon: '📋', route: '/personal-tax' },
    { name: 'Business Tax Planning', icon: '🏢', route: '/business-tax' },
    { name: 'File ITR', icon: '📄', route: '/services' }
  ];

  const retailServices = [
    { name: 'File Your ITR', icon: '📝', route: '/services' },
    { name: 'Revise Your ITR', icon: '🔄', route: '/services' },
    { name: 'Reply to ITR Notice', icon: '📨', route: '/services' },
    { name: 'Apply for Individual PAN', icon: '🆔', route: '/services' },
    { name: 'Apply for HUF PAN', icon: '👨‍👩‍👧‍👦', route: '/services' },
    { name: 'Withdraw Your PF', icon: '💰', route: '/services' },
    { name: 'Update Aadhaar/PAN', icon: '🔐', route: '/services' },
    { name: 'Online Trading & Demat', icon: '📊', route: '/services' },
    { name: 'Bank Account Services', icon: '🏦', route: '/services' },
    { name: 'Financial Planning', icon: '💡', route: '/services' }
  ];

  const corporateServices = [
    { name: 'Register New Company', icon: '🏢', route: '/services' },
    { name: 'Company Compliance', icon: '✅', route: '/services' },
    { name: 'Tax Audit', icon: '🔍', route: '/services' },
    { name: 'Legal Advice', icon: '⚖️', route: '/services' },
    { name: 'Provident Fund Services', icon: '💼', route: '/services' },
    { name: 'TDS Services', icon: '📑', route: '/services' },
    { name: 'GST Services', icon: '🧾', route: '/services' },
    { name: 'Payroll Services', icon: '💵', route: '/services' },
    { name: 'Accounting & Bookkeeping', icon: '📚', route: '/services' },
    { name: 'Business Registration', icon: '📋', route: '/services' }
  ];

  const calculators = [
    {
      id: 'personal-loan',
      name: 'Personal Loan EMI',
      description: 'Calculate monthly EMI for personal loans with detailed breakup',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      category: 'Loans'
    },
    {
      id: 'home-loan',
      name: 'Home Loan EMI',
      description: 'Plan your dream home with accurate home loan EMI calculator',
      icon: <Home className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      category: 'Loans'
    },
    {
      id: 'business-loan',
      name: 'Business Loan EMI',
      description: 'Calculate business loan EMI and grow your business',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      category: 'Loans'
    },
    {
      id: 'car-loan',
      name: 'Car Loan EMI',
      description: 'Calculate car loan EMI and plan your vehicle purchase',
      icon: <Car className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      category: 'Loans'
    },
    {
      id: 'mutual-funds',
      name: 'Mutual Fund Calculator',
      description: 'Calculate returns from lumpsum and SIP mutual fund investments',
      icon: <PieChart className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      category: 'Investments'
    },
    {
      id: 'sip',
      name: 'SIP Calculator',
      description: 'Calculate your SIP returns and plan systematic investments',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-pink-500 to-pink-600',
      category: 'Investments'
    },
    {
      id: 'personal-tax',
      name: 'Personal Tax Calculator',
      description: 'Calculate income tax and plan your tax savings',
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-yellow-500 to-yellow-600',
      category: 'Tax'
    },
    {
      id: 'business-tax',
      name: 'Business Tax Calculator',
      description: 'Calculate business tax liability and optimize savings',
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-cyan-500 to-cyan-600',
      category: 'Tax'
    },
    {
      id: 'insurance',
      name: 'Insurance Calculator',
      description: 'Calculate insurance premium and coverage requirements',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-teal-500 to-teal-600',
      category: 'Insurance'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-xl sm:rounded-2xl shadow-lg p-4 md:p-6 text-white">
        <div>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-2">Welcome to Your Dashboard! 👋</h2>
          <p className="text-xs md:text-base text-green-50">Here's an overview of your financial activities</p>
        </div>
      </div>

      {/* Financial Calculators Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
              Financial Calculators
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Plan your finances with our smart calculators</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
          {calculators.map((calculator) => (
            <button
              key={calculator.id}
              onClick={() => setActiveView('calculators')}
              className="group flex flex-col items-center p-4 md:p-5 bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 border-2 border-gray-200 hover:border-green-500 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${calculator.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-3`}>
                {calculator.icon}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 text-center mb-1 group-hover:text-green-700 transition-colors">
                {calculator.name}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-500 text-center line-clamp-2">
                {calculator.description}
              </p>
              <div className="mt-3 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold group-hover:bg-green-600 group-hover:text-white transition-colors">
                Calculate Now
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Loan Application Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowLoanModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 pr-8">
              Apply for Loan
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 md:mb-6">Choose the type of loan you want to apply for</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { name: 'Personal Loan', icon: FileText, route: '/personal-loan', color: 'from-blue-500 to-blue-600', desc: 'Quick personal loans' },
                { name: 'Home Loan', icon: Home, route: '/home-loan', color: 'from-green-500 to-green-600', desc: 'Finance your dream home' },
                { name: 'Business Loan', icon: Briefcase, route: '/business-loan', color: 'from-purple-500 to-purple-600', desc: 'Grow your business' },
                { name: 'Car Loan', icon: Car, route: '/car-loan', color: 'from-indigo-500 to-indigo-600', desc: 'Buy your dream car' },
                { name: 'Short-Term Loan', icon: Clock, route: '/short-term-loan', color: 'from-orange-500 to-orange-600', desc: 'Quick cash loans' },
                { name: 'Education Loan', icon: FileText, route: '/education-loan', color: 'from-pink-500 to-pink-600', desc: 'Fund your education' },
              ].map((loan, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Only open popup for available loan types
                    if (['Personal Loan', 'Home Loan', 'Business Loan', 'Short-Term Loan'].includes(loan.name)) {
                      setSelectedLoanType(loan.name);
                      setShowLoanModal(false);
                    } else {
                      // Navigate for other loan types not yet implemented
                      navigate(loan.route);
                      setShowLoanModal(false);
                    }
                  }}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-green-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${loan.color} flex items-center justify-center flex-shrink-0`}>
                    <loan.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-green-700 truncate">{loan.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{loan.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Insurance Modal - Enhanced */}
      {showInsuranceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInsuranceModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {/* Header Section */}
            <div className="mb-6">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 pr-8">
                Insurance Plans
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Protect yourself and your loved ones with comprehensive coverage</p>
            </div>

            {/* Life & Health Insurance Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                Life & Health Insurance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Term Insurance', icon: ShieldCheck, route: '/term-insurance', color: 'from-blue-500 to-blue-600', desc: 'Life protection for family', badge: 'Popular' },
                  { name: 'Health Insurance', icon: Heart, route: '/health-insurance', color: 'from-red-500 to-red-600', desc: 'Comprehensive health coverage', badge: 'Essential' },
                  { name: 'Life Insurance', icon: Shield, route: '/life-insurance', color: 'from-teal-500 to-teal-600', desc: 'Complete life coverage' },
                  { name: 'Critical Illness', icon: Activity, route: '/critical-illness', color: 'from-orange-500 to-orange-600', desc: 'Coverage for major diseases' },
                  { name: 'Personal Accident', icon: AlertCircle, route: '/accident-insurance', color: 'from-pink-500 to-pink-600', desc: 'Accident protection plan' },
                ].map((insurance, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(insurance.route);
                      setShowInsuranceModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-emerald-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95 relative"
                  >
                    {insurance.badge && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {insurance.badge}
                      </span>
                    )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${insurance.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <insurance.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-emerald-700 truncate">{insurance.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{insurance.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-emerald-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* General Insurance Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                General Insurance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Motor Insurance', icon: Car, route: '/motor-insurance', color: 'from-blue-500 to-blue-600', desc: 'Vehicle insurance coverage' },
                  { name: 'Home Insurance', icon: Home, route: '/home-insurance', color: 'from-green-500 to-green-600', desc: 'Protect your home' },
                  { name: 'Travel Insurance', icon: Activity, route: '/travel-insurance', color: 'from-purple-500 to-purple-600', desc: 'Safe travel coverage' },
                ].map((insurance, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(insurance.route);
                      setShowInsuranceModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-emerald-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${insurance.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <insurance.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-emerald-700 truncate">{insurance.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{insurance.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-emerald-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Retail Services Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                📝 Retail Services (Individual)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'File Your ITR', icon: FileText, route: '/services', color: 'from-teal-500 to-teal-600', desc: 'Income tax return filing' },
                  { name: 'Apply for PAN', icon: CreditCard, route: '/services', color: 'from-cyan-500 to-cyan-600', desc: 'Individual/HUF PAN card' },
                  { name: 'Withdraw PF', icon: DollarSign, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Provident fund withdrawal' },
                  { name: 'Update Aadhaar/PAN', icon: Shield, route: '/services', color: 'from-indigo-500 to-indigo-600', desc: 'Update KYC details' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(service.route);
                      setShowInsuranceModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-teal-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-teal-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Corporate Services Section */}
            <div>
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                🏢 Corporate Services (Business)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Register New Company', icon: Building2, route: '/services', color: 'from-orange-500 to-orange-600', desc: 'Company registration' },
                  { name: 'GST Services', icon: FileText, route: '/services', color: 'from-purple-500 to-purple-600', desc: 'GST filing & registration' },
                  { name: 'TDS Services', icon: Calculator, route: '/services', color: 'from-pink-500 to-pink-600', desc: 'TDS return filing' },
                  { name: 'Payroll Services', icon: DollarSign, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Payroll management' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(service.route);
                      setShowInsuranceModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-orange-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-orange-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Investment Modal - Enhanced */}
      {showInvestmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInvestmentModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {/* Header Section */}
            <div className="mb-6">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 pr-8">
                Investment Options
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Choose your investment plan and start building wealth for the future</p>
            </div>

            {/* Mutual Funds & SIP Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                Mutual Funds & SIP
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Start SIP', icon: TrendingUp, route: '/investments/sip', color: 'from-blue-500 to-blue-600', desc: 'Systematic Investment Plan', badge: 'Recommended' },
                  { name: 'Mutual Funds', icon: PieChart, route: '/investments/mutual-funds', color: 'from-green-500 to-green-600', desc: 'Diversified fund options', badge: 'Popular' },
                  { name: 'Equity Funds', icon: Activity, route: '/investments/equity', color: 'from-purple-500 to-purple-600', desc: 'High growth potential' },
                  { name: 'Debt Funds', icon: Shield, route: '/investments/debt', color: 'from-indigo-500 to-indigo-600', desc: 'Stable returns & low risk' },
                ].map((investment, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(investment.route);
                      setShowInvestmentModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95 relative"
                  >
                    {investment.badge && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {investment.badge}
                      </span>
                    )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${investment.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <investment.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-blue-700 truncate">{investment.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{investment.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Other Investment Options Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                Tax Saving & Fixed Income
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'ELSS (Tax Saver)', icon: PiggyBank, route: '/investments/elss', color: 'from-green-500 to-green-600', desc: 'Save tax under 80C' },
                  { name: 'Fixed Deposits', icon: Shield, route: '/investments/fd', color: 'from-cyan-500 to-cyan-600', desc: 'Guaranteed returns' },
                  { name: 'NPS', icon: ShieldCheck, route: '/investments/nps', color: 'from-orange-500 to-orange-600', desc: 'National Pension Scheme' },
                  { name: 'PPF', icon: CheckCircle, route: '/investments/ppf', color: 'from-teal-500 to-teal-600', desc: 'Public Provident Fund' },
                ].map((investment, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(investment.route);
                      setShowInvestmentModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${investment.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <investment.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-blue-700 truncate">{investment.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{investment.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Alternative Investments Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Alternative Investments
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Digital Gold', icon: TrendingUp, route: '/investments/gold', color: 'from-yellow-500 to-yellow-600', desc: 'Invest in 24K gold online' },
                  { name: 'Stocks & ETFs', icon: Activity, route: '/investments/stocks', color: 'from-red-500 to-red-600', desc: 'Trade in equity market' },
                  { name: 'Bonds', icon: FileText, route: '/investments/bonds', color: 'from-blue-500 to-blue-600', desc: 'Corporate & govt bonds' },
                  { name: 'Real Estate', icon: Home, route: '/investments/realestate', color: 'from-pink-500 to-pink-600', desc: 'Property investment plans' },
                ].map((investment, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(investment.route);
                      setShowInvestmentModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${investment.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <investment.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-blue-700 truncate">{investment.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{investment.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Retail Services Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                📝 Retail Services (Individual)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'File Your ITR', icon: FileText, route: '/services', color: 'from-teal-500 to-teal-600', desc: 'Income tax return filing' },
                  { name: 'Apply for PAN', icon: CreditCard, route: '/services', color: 'from-cyan-500 to-cyan-600', desc: 'Individual/HUF PAN card' },
                  { name: 'Withdraw PF', icon: DollarSign, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Provident fund withdrawal' },
                  { name: 'Update Aadhaar/PAN', icon: Shield, route: '/services', color: 'from-indigo-500 to-indigo-600', desc: 'Update KYC details' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(service.route);
                      setShowInvestmentModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-teal-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-teal-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Corporate Services Section */}
            <div>
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                🏢 Corporate Services (Business)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Register New Company', icon: Building2, route: '/services', color: 'from-orange-500 to-orange-600', desc: 'Company registration' },
                  { name: 'GST Services', icon: FileText, route: '/services', color: 'from-purple-500 to-purple-600', desc: 'GST filing & registration' },
                  { name: 'TDS Services', icon: Calculator, route: '/services', color: 'from-pink-500 to-pink-600', desc: 'TDS return filing' },
                  { name: 'Payroll Services', icon: DollarSign, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Payroll management' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(service.route);
                      setShowInvestmentModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-orange-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-orange-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tax Planning Modal - Enhanced */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTaxModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {/* Header Section */}
            <div className="mb-6">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 pr-8">
                Tax Planning Services
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Save more with smart tax planning strategies and expert consultation</p>
            </div>

            {/* Tax Planning Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                Tax Planning & Filing
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Personal Tax Planning', icon: Calculator, route: '/tax-planning/personal', color: 'from-purple-500 to-purple-600', desc: 'Individual tax solutions', badge: 'Popular' },
                  { name: 'Business Tax Planning', icon: Briefcase, route: '/tax-planning/business', color: 'from-pink-500 to-pink-600', desc: 'Corporate tax strategies' },
                  { name: 'ITR Filing', icon: FileText, route: '/tax-planning/itr-filing', color: 'from-indigo-500 to-indigo-600', desc: 'Income Tax Return filing' },
                  { name: 'Tax Consultation', icon: Activity, route: '/tax-planning/consultation', color: 'from-blue-500 to-blue-600', desc: 'Expert tax advisory' },
                ].map((tax, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(tax.route);
                      setShowTaxModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-purple-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95 relative"
                  >
                    {tax.badge && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {tax.badge}
                      </span>
                    )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${tax.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <tax.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-purple-700 truncate">{tax.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{tax.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Saving Investments Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                Tax Saving Investments (80C)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'ELSS Funds', icon: TrendingUp, route: '/tax-planning/elss', color: 'from-green-500 to-green-600', desc: 'Tax saving mutual funds' },
                  { name: 'PPF Account', icon: ShieldCheck, route: '/tax-planning/ppf', color: 'from-teal-500 to-teal-600', desc: 'Public Provident Fund' },
                  { name: 'Tax Saver FD', icon: Shield, route: '/tax-planning/tax-saver-fd', color: 'from-cyan-500 to-cyan-600', desc: '5-year fixed deposits' },
                  { name: 'Life Insurance', icon: Heart, route: '/tax-planning/life-insurance', color: 'from-blue-500 to-blue-600', desc: 'Term & ULIP plans' },
                ].map((tax, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(tax.route);
                      setShowTaxModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-purple-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${tax.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <tax.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-purple-700 truncate">{tax.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{tax.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Retail Services Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                📝 Retail Services (Individual)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'File Your ITR', icon: FileText, route: '/services', color: 'from-teal-500 to-teal-600', desc: 'Income tax return filing' },
                  { name: 'Revise Your ITR', icon: Activity, route: '/services', color: 'from-cyan-500 to-cyan-600', desc: 'Revise filed returns' },
                  { name: 'Reply to ITR Notice', icon: AlertCircle, route: '/services', color: 'from-orange-500 to-orange-600', desc: 'Handle tax notices' },
                  { name: 'Apply for PAN', icon: CreditCard, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Individual/HUF PAN card' },
                  { name: 'Withdraw PF', icon: DollarSign, route: '/services', color: 'from-green-500 to-green-600', desc: 'Provident fund withdrawal' },
                  { name: 'Update Aadhaar/PAN', icon: Shield, route: '/services', color: 'from-indigo-500 to-indigo-600', desc: 'Update KYC details' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(service.route);
                      setShowTaxModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-teal-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-teal-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Corporate Services Section */}
            <div className="mb-6">
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3">
                🏢 Corporate Services (Business)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Register New Company', icon: Building2, route: '/services', color: 'from-orange-500 to-orange-600', desc: 'Company registration' },
                  { name: 'Company Compliance', icon: CheckCircle, route: '/services', color: 'from-red-500 to-red-600', desc: 'Regulatory compliance' },
                  { name: 'GST Services', icon: FileText, route: '/services', color: 'from-purple-500 to-purple-600', desc: 'GST filing & registration' },
                  { name: 'TDS Services', icon: Calculator, route: '/services', color: 'from-pink-500 to-pink-600', desc: 'TDS return filing' },
                  { name: 'Payroll Services', icon: DollarSign, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Payroll management' },
                  { name: 'Tax Audit', icon: Activity, route: '/services', color: 'from-teal-500 to-teal-600', desc: 'Statutory tax audits' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(service.route);
                      setShowTaxModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-orange-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-orange-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Tax Benefits Section */}
            <div>
              <h4 className="text-base md:text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                Additional Tax Benefits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'NPS (80CCD)', icon: CheckCircle, route: '/tax-planning/nps', color: 'from-orange-500 to-orange-600', desc: 'Extra ₹50K deduction' },
                  { name: 'Health Insurance (80D)', icon: Heart, route: '/tax-planning/health-insurance', color: 'from-red-500 to-red-600', desc: 'Medical insurance benefits' },
                  { name: 'Home Loan (80C + 24)', icon: Home, route: '/tax-planning/home-loan', color: 'from-green-500 to-green-600', desc: 'Home loan tax benefits' },
                  { name: 'Education Loan (80E)', icon: FileText, route: '/tax-planning/education-loan', color: 'from-indigo-500 to-indigo-600', desc: 'Interest deduction' },
                ].map((tax, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(tax.route);
                      setShowTaxModal(false);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-purple-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${tax.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <tax.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-purple-700 truncate">{tax.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{tax.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* All Activities Modal */}
      {showAllActivities && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-green-500 max-w-4xl w-full max-h-[90vh] overflow-hidden relative animate-slideIn">
            <button
              onClick={() => setShowAllActivities(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-red-600 hover:text-red-700 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {/* Modal Content with Scroll */}
            <div className="overflow-y-auto max-h-[90vh] p-4 md:p-6">
            
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 pr-8">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              All Activities
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 md:mb-6">Complete history of your financial activities</p>
            
            <div className="space-y-2 sm:space-y-3">
              {[
                ...recentActivities,
                { id: 5, title: 'Car Insurance Payment', amount: '₹10,500', date: '1 week ago', status: 'success', icon: CheckCircle },
                { id: 6, title: 'Loan Application Submitted', amount: 'N/A', date: '2 weeks ago', status: 'success', icon: CheckCircle },
                { id: 7, title: 'Investment Rebalanced', amount: '₹20,000', date: '2 weeks ago', status: 'success', icon: CheckCircle },
                { id: 8, title: 'Document Upload', amount: 'N/A', date: '3 weeks ago', status: 'success', icon: CheckCircle },
                { id: 9, title: 'Profile Updated', amount: 'N/A', date: '1 month ago', status: 'success', icon: CheckCircle },
                { id: 10, title: 'Account Verification', amount: 'N/A', date: '1 month ago', status: 'success', icon: CheckCircle },
              ].map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <activity.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        activity.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-green-700 ml-2 flex-shrink-0">{activity.amount}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllActivities(false)}
              className="w-full mt-4 md:mt-6 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Close
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Form Popup */}
      {selectedLoanType && (
        <LoanFormPopup 
          loanType={selectedLoanType}
          onClose={() => setSelectedLoanType(null)}
        />
      )}
    </div>
  );
};
export default DashboardOverview;
