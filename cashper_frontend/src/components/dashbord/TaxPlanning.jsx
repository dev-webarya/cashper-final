import React, { useState, useEffect } from 'react';
import { 
  FileText, Calculator, PiggyBank, Briefcase, TrendingDown, 
  CheckCircle, AlertCircle, Info, Download, Plus, X, Target,
  Search, Eye
} from 'lucide-react';
import HomeServiceFormPopup from './HomeServiceFormPopup';
import Personal_tax_planning from '../Personal_tax_planning';
import Business_Tax_planning from '../Business_Tax_planning';

const TaxPlanning = () => {
  const [selectedSection, setSelectedSection] = useState('overview');
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [taxPlans, setTaxPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    activeApplications: 0,
    completedApplications: 0
  });

  // Fetch real data from backend
  useEffect(() => {
    const fetchTaxApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.error('❌ No authentication token found');
          setLoading(false);
          setTaxPlans([]);
          return;
        }
        
        console.log('🔑 Token from localStorage: Found');
        console.log('📡 Fetching Tax Planning applications...');
        
        const [personalRes, businessRes] = await Promise.all([
          fetch('http://localhost:8000/api/personal-tax/application/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('http://localhost:8000/api/business-tax/application/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        console.log('📊 Personal Tax Response Status:', personalRes.status);
        console.log('📊 Business Tax Response Status:', businessRes.status);

        let allApplications = [];

        if (personalRes.ok) {
          const personalData = await personalRes.json();
          console.log('Personal Tax Data:', personalData);
          const personalApps = Array.isArray(personalData) ? personalData : personalData.applications || [];
          allApplications.push(...personalApps.map(app => ({
            id: app._id || app.id,
            applicant: app.fullName || app.ownerName || 'Unknown',
            planType: app.preferredTaxRegime ? app.preferredTaxRegime.charAt(0).toUpperCase() + app.preferredTaxRegime.slice(1) + ' Tax Regime' : 'Personal Tax Planning',
            annualIncome: app.annualIncome || 0,
            expectedSavings: 0,
            appliedDate: new Date(app.createdAt).toLocaleDateString() || 'N/A',
            status: app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending',
            type: 'personal',
            email: app.emailAddress,
            phone: app.phoneNumber,
            pan: app.panNumber,
            employmentType: app.employmentType,
            documents: app.documents || {},
            fullData: app
          })));
        } else {
          console.error('❌ Personal Tax API error:', personalRes.status, personalRes.statusText);
          const errorData = await personalRes.json().catch(() => ({}));
          console.error('❌ Personal Tax Error Details:', errorData);
        }

        if (businessRes.ok) {
          const businessData = await businessRes.json();
          console.log('Business Tax Data:', businessData);
          const businessApps = Array.isArray(businessData) ? businessData : businessData.applications || [];
          allApplications.push(...businessApps.map(app => ({
            id: app._id || app.id,
            applicant: app.businessName || app.ownerName || 'Unknown',
            planType: 'Business Tax Planning',
            annualIncome: app.turnoverRange || 0,
            expectedSavings: 0,
            appliedDate: new Date(app.createdAt).toLocaleDateString() || 'N/A',
            status: app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending',
            type: 'business',
            email: app.businessEmail,
            phone: app.contactNumber,
            pan: app.businessPAN,
            businessStructure: app.businessStructure,
            industryType: app.industryType,
            documents: app.documents || {},
            fullData: app
          })));
        } else {
          console.error('❌ Business Tax API error:', businessRes.status, businessRes.statusText);
          const errorData = await businessRes.json().catch(() => ({}));
          console.error('❌ Business Tax Error Details:', errorData);
        }

        console.log('All Applications:', allApplications);
        setTaxPlans(allApplications);

        // Calculate stats
        const statusCounts = {
          totalApplications: allApplications.length,
          pendingApplications: allApplications.filter(app => app.status?.toLowerCase() === 'pending').length,
          activeApplications: allApplications.filter(app => app.status?.toLowerCase() === 'active').length,
          completedApplications: allApplications.filter(app => app.status?.toLowerCase() === 'completed').length
        };
        console.log('Stats:', statusCounts);
        setStats(statusCounts);
      } catch (error) {
        console.error('Error fetching tax applications:', error);
        setTaxPlans([]);
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          activeApplications: 0,
          completedApplications: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaxApplications();
  }, []);

  // Filter and pagination
  const filteredPlans = taxPlans.filter(plan => {
    // Search filter
    const matchesSearch = 
      plan.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.planType.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const statusMatch = statusFilter === 'all' || plan.status?.toLowerCase() === statusFilter.toLowerCase();
    
    // Service type filter
    let serviceMatch = true;
    if (serviceFilter === 'all') serviceMatch = true;
    else if (serviceFilter === 'personal') serviceMatch = plan.type === 'personal';
    else if (serviceFilter === 'business') serviceMatch = plan.type === 'business';
    
    return matchesSearch && statusMatch && serviceMatch;
  });

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPlans = filteredPlans.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  // Download document function
  const downloadDocument = async (documentPath) => {
    try {
      console.log('📥 Original document path:', documentPath);
      
      // Extract filename from path
      const fileName = documentPath.split('/').pop().split('\\').pop();
      
      // Normalize the path
      let normalizedPath = documentPath;
      
      // Check if it's an absolute Windows path
      if (documentPath.includes(':\\')) {
        // Extract only the relative path after 'uploads'
        const uploadsIndex = documentPath.indexOf('uploads');
        if (uploadsIndex !== -1) {
          normalizedPath = documentPath.substring(uploadsIndex);
        }
      }
      
      // Convert backslashes to forward slashes for URL
      normalizedPath = normalizedPath.replace(/\\/g, '/');
      
      // Construct download URL
      const downloadUrl = `http://localhost:8000/${normalizedPath}`;
      
      console.log('📥 Normalized path:', normalizedPath);
      console.log('📥 Download URL:', downloadUrl);
      console.log('📥 File name:', fileName);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(downloadUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Download failed:', errorText);
        throw new Error(`Download failed with status: ${response.status}`);
      }
      const blob = await response.blob();
      console.log('📥 Blob size:', blob.size, 'bytes');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download successful:', fileName);
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      alert(`Failed to download document: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Active': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Expired': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const DeductionModal = ({ deduction, onClose }) => {
    if (!deduction) return null;

    const DeductionIcon = deduction.icon;
    const utilizationPercentage = deduction.maxLimit === 'No Limit' 
      ? 100 
      : ((deduction.utilized / deduction.maxLimit) * 100).toFixed(1);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${deduction.color} p-4 text-white relative`}>
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                <DeductionIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{deduction.title}</h2>
                <p className="text-white text-opacity-90">{deduction.section}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Description */}
            <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-600">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{deduction.description}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Max Limit</p>
                <p className="text-lg font-bold text-blue-600">
                  {typeof deduction.maxLimit === 'number' ? formatCurrency(deduction.maxLimit) : deduction.maxLimit}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Utilized</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(deduction.utilized)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className="text-lg font-bold text-orange-600">
                  {typeof deduction.remaining === 'number' ? formatCurrency(deduction.remaining) : deduction.remaining}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {typeof deduction.maxLimit === 'number' && (
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-semibold text-gray-700">Utilization</span>
                  <span className="font-bold text-green-600">{utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${deduction.color} transition-all`}
                    style={{ width: `${utilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Itemized List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Claimed Items</h3>
              <div className="space-y-2">
                {deduction.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Savings */}
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Estimated Tax Savings (30% bracket)</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(deduction.utilized * 0.30)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button 
                onClick={() => handleDownloadDeductionDetails(deduction)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                <Download className="w-4 h-4" />
                Download Statement
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
              >
                <FileText className="w-4 h-4" />
                View Documents
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  };

  // Service Type Selection Modal
  const ServiceTypeModal = () => {
    if (!showServiceTypeModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowServiceTypeModal(false)}>
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowServiceTypeModal(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 text-white pt-8">
            <h2 className="text-xl font-bold">Select Tax Service</h2>
            <p className="text-green-100 text-sm mt-1">Choose the service type</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Personal Tax Planning */}
            <div 
              onClick={() => {
                setSelectedServiceType('personal');
                setShowServiceTypeModal(false);
              }}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">Personal Tax Planning</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Manage deductions & maximize savings</p>
                </div>
              </div>
            </div>

            {/* Business Tax Strategy */}
            <div 
              onClick={() => {
                setSelectedServiceType('business');
                setShowServiceTypeModal(false);
              }}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">Business Tax Strategy</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Optimize tax & GST compliance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 p-3">
      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading tax applications...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                Tax Planning Applications
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">{stats.totalApplications} total applications</p>
            </div>
            <button 
              onClick={() => setShowServiceTypeModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Apply Tax Planning Services
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-green-600">
              <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Total Applications</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalApplications}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-yellow-600">
              <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-blue-600">
              <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Active</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.activeApplications}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-purple-600">
              <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.completedApplications}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="all">All Services</option>
                <option value="personal">Personal Tax Planning</option>
                <option value="business">Business Tax Strategy</option>
              </select>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {currentPlans.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">No Applications Found</h3>
                <p className="text-sm text-gray-500">No tax applications matching your criteria. Submit a new application to get started.</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="divide-y divide-gray-200">
                    {currentPlans.map((plan) => (
                      <div key={plan.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-mono text-sm text-gray-600 font-semibold">{plan.id}</p>
                            <p className="font-semibold text-gray-800">{plan.applicant}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(plan.status)}`}>
                            {plan.status}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-semibold text-gray-800">{plan.type === 'personal' ? 'Personal' : 'Business'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Applied:</span>
                            <span className="font-semibold text-gray-800">{plan.appliedDate}</span>
                          </div>
                          {plan.email && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-semibold text-gray-800 text-right">{plan.email}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewDetails(plan)}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Application ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applied Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentPlans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{plan.id}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{plan.applicant}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {plan.type === 'personal' ? 'Personal' : 'Business'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div className="text-xs">{plan.email}</div>
                            {plan.phone && <div className="text-xs text-gray-500">{plan.phone}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{plan.appliedDate}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(plan.status)}`}>
                              {plan.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleViewDetails(plan)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      
      {/* View Application Details Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-t-xl flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Application Details</h2>
                <p className="text-green-100 text-sm mt-1">Application ID: {selectedPlan.id}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-green-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(selectedPlan.status)} shadow-md`}>
                  {selectedPlan.status}
                </span>
              </div>

              {/* Application Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                <h3 className="text-base font-bold text-green-900 mb-3">Application Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Display all fields dynamically from fullData */}
                  {(() => {
                    const data = selectedPlan.fullData || selectedPlan;
                    const excludeFields = ['_id', 'user_id', 'userId', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'documents', 'application_id', 'id', '__v'];
                    const fieldLabels = {
                      'fullName': 'Full Name',
                      'emailAddress': 'Email Address',
                      'phoneNumber': 'Phone Number',
                      'panNumber': 'PAN Number',
                      'dateOfBirth': 'Date of Birth',
                      'gender': 'Gender',
                      'maritalStatus': 'Marital Status',
                      'occupation': 'Occupation',
                      'employmentType': 'Employment Type',
                      'annualIncome': 'Annual Income',
                      'preferredTaxRegime': 'Preferred Tax Regime',
                      'taxDeductions': 'Tax Deductions',
                      'investmentPreferences': 'Investment Preferences',
                      'financialGoals': 'Financial Goals',
                      'currentAddress': 'Current Address',
                      'city': 'City',
                      'state': 'State',
                      'pincode': 'Pincode',
                      'businessName': 'Business Name',
                      'businessEmail': 'Business Email',
                      'contactNumber': 'Contact Number',
                      'businessPAN': 'Business PAN',
                      'businessAddress': 'Business Address',
                      'businessStructure': 'Business Structure',
                      'industryType': 'Industry Type',
                      'turnoverRange': 'Turnover Range',
                      'numberOfEmployees': 'Number of Employees',
                      'gstRegistered': 'GST Registered',
                      'gstNumber': 'GST Number',
                      'ownerName': 'Owner Name',
                      'ownerEmail': 'Owner Email',
                      'ownerPhone': 'Owner Phone',
                      'taxPlanningNeeds': 'Tax Planning Needs',
                      'expectedTaxLiability': 'Expected Tax Liability',
                      'previousYearTax': 'Previous Year Tax',
                      'status': 'Status'
                    };
                    
                    return Object.entries(data)
                      .filter(([key, value]) => 
                        !excludeFields.includes(key) && 
                        value !== null && 
                        value !== undefined && 
                        value !== '' &&
                        key !== 'fullData' &&
                        typeof value !== 'object'
                      )
                      .map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                            {fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase()}
                          </p>
                          <p className="text-gray-900 font-medium text-sm break-words">
                            {String(value)}
                          </p>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {/* Uploaded Documents Section */}
              {(() => {
                const documents = selectedPlan.documents || {};
                const hasDocuments = documents && typeof documents === 'object' && Object.keys(documents).length > 0;
                
                return hasDocuments ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Uploaded Documents
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        {Object.entries(documents).map(([docKey, docPath], index) => {
                          if (!docPath || typeof docPath !== 'string') return null;
                          const docName = docPath.split('\\').pop().split('/').pop();
                          const displayName = docKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          
                          return (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-green-50 transition-colors">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-semibold text-gray-900 block">{displayName}</span>
                                  <span className="text-xs text-gray-500 block truncate">{docName}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => downloadDocument(docPath)}
                                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ml-2 flex-shrink-0"
                              >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Service Type Selection Modal */}
      <ServiceTypeModal />
      
      {/* Personal Tax Planning Form Modal */}
      {selectedServiceType === 'personal' && (
        <div className="fixed top-20 left-0 right-0 z-40 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="flex justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedServiceType(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Form Content - Only Form Section */}
              <div className="pt-12 pb-8">
                <Personal_tax_planning isPopupMode={true} onPopupClose={() => setSelectedServiceType(null)} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Business Tax Planning Form Modal */}
      {selectedServiceType === 'business' && (
        <div className="fixed top-20 left-0 right-0 z-40 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="flex justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedServiceType(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Form Content - Only Form Section */}
              <div className="pt-12 pb-8">
                <Business_Tax_planning isPopupMode={true} onPopupClose={() => setSelectedServiceType(null)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxPlanning;
