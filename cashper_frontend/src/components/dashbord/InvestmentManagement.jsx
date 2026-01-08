import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, PieChart, DollarSign, Calendar, Target, Plus, 
  X, Eye, Download, RefreshCw, Search, Filter, ArrowUpRight,
  ArrowDownRight, Activity, BarChart3, Zap, FileText, Shield, Home,
  Clock, Briefcase, Heart, Car
} from 'lucide-react';
import { getUserInvestments } from '../../services/dashboardApi';
import HomeServiceFormPopup from './HomeServiceFormPopup';

const InvestmentManagement = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInvestmentTypeModal, setShowInvestmentTypeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      
      // Get user email from localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        console.log('User not logged in');
        setInvestments([]);
        return;
      }
      
      const userData = JSON.parse(user);
      const userEmail = userData.email || userData.emailAddress;
      
      if (!userEmail) {
        console.log('User email not found');
        setInvestments([]);
        return;
      }

      let allApplications = [];

      // Fetch mutual fund applications
      try {
        const mfResponse = await fetch(`http://localhost:8000/api/mutual-funds/application/user/${encodeURIComponent(userEmail)}`);
        
        if (mfResponse.ok) {
          const mfData = await mfResponse.json();
          
          if (mfData.success && mfData.applications && mfData.applications.length > 0) {
            const transformedMF = mfData.applications.map((app, index) => ({
              id: app._id || app.id || `MF${String(index + 1).padStart(3, '0')}`,
              customer: app.name || 'N/A',
              name: app.investmentGoal || 'Mutual Fund Investment',
              type: 'Mutual Fund',
              category: app.riskProfile === 'high' ? 'Equity' : 
                       app.riskProfile === 'medium' ? 'Hybrid' : 
                       app.riskProfile === 'low' ? 'Debt' : 'Hybrid',
              investmentType: app.investmentType || 'Lumpsum',
              investedAmount: app.investmentAmount || 0,
              currentValue: app.investmentAmount || 0,
              returns: 0,
              returnsPercentage: 0,
              sipAmount: app.sipAmount || 0,
              sipFrequency: app.sipFrequency || 'monthly',
              sipDate: 5,
              startDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : 'N/A',
              lastSIPDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'N/A',
              folioNumber: app.applicationNumber || 'N/A',
              units: 0,
              nav: 0,
              risk: app.riskProfile?.charAt(0).toUpperCase() + app.riskProfile?.slice(1) || 'Medium',
              status: (app.status || 'Pending').charAt(0).toUpperCase() + (app.status || 'Pending').slice(1),
              icon: TrendingUp,
              color: app.riskProfile === 'high' ? 'from-green-600 to-emerald-600' : 
                     app.riskProfile === 'low' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-indigo-600',
              bgColor: app.riskProfile === 'high' ? 'bg-green-50' : 
                       app.riskProfile === 'low' ? 'bg-blue-50' : 'bg-purple-50',
              documents: app.documents || {},
              fullData: app
            }));
            allApplications = [...allApplications, ...transformedMF];
          }
        }
      } catch (error) {
        console.error('Error fetching mutual fund applications:', error);
      }

      // Fetch SIP applications
      try {
        const sipResponse = await fetch(`http://localhost:8000/api/sip/application/user/${encodeURIComponent(userEmail)}`);
        
        if (sipResponse.ok) {
          const sipData = await sipResponse.json();
          
          if (sipData.success && sipData.applications && sipData.applications.length > 0) {
            const transformedSIP = sipData.applications.map((app, index) => ({
              id: app._id || app.id || `SIP${String(index + 1).padStart(3, '0')}`,
              customer: app.name || 'N/A',
              name: app.investmentGoal || 'SIP Investment',
              type: 'SIP',
              category: app.riskProfile === 'aggressive' ? 'Equity' : 
                       app.riskProfile === 'moderate' ? 'Hybrid' : 
                       app.riskProfile === 'conservative' ? 'Debt' : 'Hybrid',
              investmentType: 'SIP',
              investedAmount: (app.sipAmount * app.tenure * 12) || 0,
              currentValue: (app.sipAmount * app.tenure * 12) || 0,
              returns: 0,
              returnsPercentage: 0,
              sipAmount: app.sipAmount || 0,
              sipFrequency: app.sipFrequency || 'monthly',
              sipDate: 5,
              startDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : 'N/A',
              lastSIPDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'N/A',
              folioNumber: app.applicationNumber || 'N/A',
              units: 0,
              nav: 0,
              risk: app.riskProfile?.charAt(0).toUpperCase() + app.riskProfile?.slice(1) || 'Moderate',
              status: (app.status || 'Pending').charAt(0).toUpperCase() + (app.status || 'Pending').slice(1),
              icon: TrendingUp,
              color: app.riskProfile === 'aggressive' ? 'from-green-600 to-emerald-600' : 
                     app.riskProfile === 'conservative' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-indigo-600',
              bgColor: app.riskProfile === 'aggressive' ? 'bg-green-50' : 
                       app.riskProfile === 'conservative' ? 'bg-blue-50' : 'bg-purple-50',
              documents: app.documents || {},
              fullData: app
            }));
            allApplications = [...allApplications, ...transformedSIP];
          }
        }
      } catch (error) {
        console.error('Error fetching SIP applications:', error);
      }

      setInvestments(allApplications);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRiskBadge = (risk) => {
    const styles = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    return styles[risk] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category) => {
    const styles = {
      'Equity': 'bg-purple-100 text-purple-800',
      'Debt': 'bg-blue-100 text-blue-800',
      'Hybrid': 'bg-indigo-100 text-indigo-800',
      'Gold': 'bg-yellow-100 text-yellow-800'
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredInvestments = investments
    .filter(inv => {
      // Status filter
      const statusMatch = statusFilter === 'all' || inv.status === statusFilter;
      
      // Service type filter
      let serviceMatch = true;
      if (serviceFilter === 'all') serviceMatch = true;
      else if (serviceFilter === 'mutual funds') serviceMatch = inv.type === 'Mutual Fund';
      else if (serviceFilter === 'sip') serviceMatch = inv.investmentType === 'SIP';
      
      // Search filter
      const searchMatch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && serviceMatch && searchMatch;
    });

  // Pagination
  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvestments = filteredInvestments.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const investmentStats = {
    total: investments.length,
    mutualFunds: investments.filter(i => i.type === 'Mutual Fund').length,
    sip: investments.filter(i => i.investmentType === 'SIP').length,
    totalInvested: investments.reduce((sum, i) => sum + i.investedAmount, 0),
    currentValue: investments.reduce((sum, i) => sum + i.currentValue, 0),
    totalReturns: investments.reduce((sum, i) => sum + i.returns, 0)
  };

  const overallReturnsPercentage = investmentStats.totalInvested 
    ? ((investmentStats.totalReturns / investmentStats.totalInvested) * 100).toFixed(2) 
    : 0;

  const handleViewDetails = (investment) => {
    setSelectedInvestment(investment);
    setShowModal(true);
  };

  const handleStopSIP = (investment) => {
    if (window.confirm(`Are you sure you want to stop SIP for ${investment.name}?`)) {
      alert(`SIP stopped for ${investment.name}. Folio: ${investment.folioNumber}`);
      // In production: API call to stop SIP
    }
  };

  const handleDownloadStatement = (investment) => {
    // Generate and download investment statement
    const statementContent = `
      Investment Statement Report
      ==========================
      
      Investment ID: ${investment.id}
      Name: ${investment.name}
      Type: ${investment.type}
      Category: ${investment.category}
      Investment Type: ${investment.investmentType}
      Folio Number: ${investment.folioNumber}
      
      Financial Summary:
      -----------------
      Invested Amount: ${formatCurrency(investment.investedAmount)}
      Current Value: ${formatCurrency(investment.currentValue)}
      Returns: ${formatCurrency(investment.returns)}
      Returns %: ${investment.returnsPercentage}%
      
      Investment Details:
      ------------------
      Units Held: ${investment.units}
      Current NAV: ₹${investment.nav}
      Risk Profile: ${investment.risk}
      Start Date: ${formatDate(investment.startDate)}
      ${investment.sipAmount ? `SIP Amount: ${formatCurrency(investment.sipAmount)}` : ''}
      ${investment.sipDate ? `SIP Date: ${investment.sipDate} of every month` : ''}
      ${investment.lastSIPDate ? `Last SIP: ${formatDate(investment.lastSIPDate)}` : ''}
      
      Status: ${investment.status}
    `;
    
    const blob = new Blob([statementContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Investment_${investment.folioNumber}_Statement.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleViewPerformance = (investment) => {
    // Open documents/performance in new window
    const documentsHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Investment Documents - ${investment.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
          .doc-item { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #16a34a; }
          .doc-item h3 { margin: 0 0 10px 0; color: #1f2937; }
          .doc-item p { margin: 5px 0; color: #6b7280; }
          .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .stat { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📈 Investment Documents & Performance</h1>
          <p><strong>Fund Name:</strong> ${investment.name}</p>
          <p><strong>Folio Number:</strong> ${investment.folioNumber}</p>
          <p><strong>Type:</strong> ${investment.type} - ${investment.category}</p>
          
          <div class="stat">
            <h3 style="margin: 0 0 5px 0;">💰 Performance Overview</h3>
            <p style="margin: 5px 0;">Current Value: ${formatCurrency(investment.currentValue)}</p>
            <p style="margin: 5px 0;">Returns: ${formatCurrency(investment.returns)} (${investment.returnsPercentage}%)</p>
          </div>
          
          <hr style="margin: 20px 0;">
          
          <div class="doc-item">
            <h3>📋 Investment Folio Document</h3>
            <p><span class="badge">✓ Active</span></p>
            <p>Original investment folio certificate</p>
          </div>
          
          <div class="doc-item">
            <h3>🆔 KYC Documents</h3>
            <p><span class="badge">✓ Verified</span></p>
            <p>PAN Card, Aadhaar, and Address Proof</p>
          </div>
          
          <div class="doc-item">
            <h3>💳 Bank Account Details</h3>
            <p><span class="badge">✓ Verified</span></p>
            <p>Cancelled cheque / Bank statement</p>
          </div>
          
          <div class="doc-item">
            <h3>📄 Transaction History</h3>
            <p><span class="badge">✓ Available</span></p>
            <p>Complete history of SIP payments and transactions</p>
          </div>
          
          <div class="doc-item">
            <h3>📈 Performance Reports</h3>
            <p><span class="badge">✓ Updated</span></p>
            <p>Monthly performance and NAV history</p>
          </div>
          
          <div class="doc-item">
            <h3>⚖️ Tax Documents</h3>
            <p><span class="badge">✓ Available</span></p>
            <p>Capital gains statements for tax filing</p>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Note:</strong> All documents are digitally verified and compliant with SEBI regulations.
          </p>
        </div>
      </body>
      </html>
    `;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(documentsHTML);
      newWindow.document.close();
    }
  };

  const handleExportPDF = () => {
    alert('Exporting all investments to PDF...');
    // In production: Generate comprehensive investment report
  };

  const handleStartNewSIP = () => {
    window.location.href = '/mutual-funds';
  };

  // Download document function
  const downloadDocument = async (documentPath) => {
    try {
      console.log('📥 Original document path:', documentPath);
      
      // Extract filename from path
      const fileName = documentPath.split('/').pop().split('\\').pop();
      
      // Normalize the path
      let normalizedPath = documentPath;
      
      // Remove any leading/trailing slashes or backslashes
      normalizedPath = normalizedPath.replace(/^[\\\/]+|[\\\/]+$/g, '');
      
      // Check if it's an absolute Windows path (contains drive letter)
      if (normalizedPath.match(/^[a-zA-Z]:\\/)) {
        // Extract only the relative path after 'uploads'
        const uploadsIndex = normalizedPath.indexOf('uploads');
        if (uploadsIndex !== -1) {
          normalizedPath = normalizedPath.substring(uploadsIndex);
        }
      }
      
      // If path doesn't start with 'uploads', prepend it
      if (!normalizedPath.startsWith('uploads')) {
        // Check if it looks like a complete path with folder structure
        if (normalizedPath.includes('documents/') || normalizedPath.includes('mutual_funds/') || normalizedPath.includes('sip/')) {
          normalizedPath = 'uploads/' + normalizedPath;
        } else {
          // For investment documents, they're typically stored in uploads/documents/
          normalizedPath = 'uploads/documents/' + normalizedPath;
        }
      }
      
      // Convert backslashes to forward slashes for URL
      normalizedPath = normalizedPath.replace(/\\/g, '/');
      
      // Remove any double slashes
      normalizedPath = normalizedPath.replace(/\/+/g, '/');
      
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
        console.error('❌ Attempted URL:', downloadUrl);
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

  const InvestmentDetailsModal = ({ investment, onClose }) => {
    if (!investment) return null;

    const getStatusBadge = (status) => {
      const styles = {
        'Active': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-blue-100 text-blue-800',
        'Rejected': 'bg-red-100 text-red-800'
      };
      return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
      <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-6 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={`sticky top-0 bg-gradient-to-r ${investment.color} text-white px-4 py-3 rounded-t-xl flex justify-between items-center z-10`}>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Application Details</h2>
              <p className="text-white text-opacity-90 text-sm mt-1">Application ID: {investment.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(investment.status)} shadow-md`}>
                {investment.status}
              </span>
            </div>

            {/* Application Information */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
              <h3 className="text-base font-bold text-blue-900 mb-3">Application Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Display all fields dynamically from fullData */}
                {(() => {
                  const data = investment.fullData || investment;
                  const excludeFields = ['_id', 'user_id', 'userId', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'documents', 'application_id', 'id', '__v', 'icon', 'color', 'bgColor', 'fullData'];
                  const fieldLabels = {
                    'name': 'Name',
                    'email': 'Email',
                    'phone': 'Phone Number',
                    'panCard': 'PAN Card',
                    'investmentGoal': 'Investment Goal',
                    'investmentAmount': 'Investment Amount',
                    'investmentType': 'Investment Type',
                    'riskProfile': 'Risk Profile',
                    'tenure': 'Tenure (Years)',
                    'expectedReturns': 'Expected Returns',
                    'sipAmount': 'SIP Amount',
                    'sipFrequency': 'SIP Frequency',
                    'applicationNumber': 'Application Number',
                    'status': 'Status',
                    'customer': 'Customer Name',
                    'type': 'Investment Type',
                    'category': 'Category',
                    'folioNumber': 'Folio Number',
                    'risk': 'Risk Level',
                    'startDate': 'Start Date',
                    'investedAmount': 'Invested Amount',
                    'currentValue': 'Current Value',
                    'returns': 'Returns',
                    'returnsPercentage': 'Returns %'
                  };
                  
                  return Object.entries(data)
                    .filter(([key, value]) => 
                      !excludeFields.includes(key) && 
                      value !== null && 
                      value !== undefined && 
                      value !== '' &&
                      typeof value !== 'object' &&
                      typeof value !== 'function'
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
              const documents = investment.documents || {};
              const hasDocuments = documents && typeof documents === 'object' && Object.keys(documents).length > 0;
              
              return hasDocuments ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Uploaded Documents
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {Object.entries(documents).map(([docKey, docPath], index) => {
                        if (!docPath || typeof docPath !== 'string') return null;
                        const docName = docPath.split('\\').pop().split('/').pop();
                        const displayName = docKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        
                        return (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-900 block">{displayName}</span>
                                <span className="text-xs text-gray-500 block truncate">{docName}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => downloadDocument(docPath)}
                              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ml-2 flex-shrink-0"
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            My Investments
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage your investment portfolio</p>
        </div>
        <button 
          onClick={() => setShowInvestmentTypeModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Start New Investment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-blue-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Investments</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{investmentStats.total}</p>
            </div>
            <div className="hidden sm:block p-3 bg-blue-100 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-green-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">SIP</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{investmentStats.sip}</p>
            </div>
            <div className="hidden sm:block p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-purple-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Mutual Funds</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{investmentStats.mutualFunds}</p>
            </div>
            <div className="hidden sm:block p-3 bg-purple-100 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
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
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Matured">Matured</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white cursor-pointer"
          >
            <option value="all">All Services</option>
            <option value="mutual funds">Mutual Funds</option>
            <option value="sip">SIP</option>
          </select>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {currentInvestments.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-600 mb-2">No Investments Found</h3>
              <p className="text-sm text-gray-500">Start investing today to grow your wealth</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentInvestments.map((investment) => {
                const InvestmentIcon = investment.icon;

                return (
                  <div key={investment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${investment.color}`}>
                          <InvestmentIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-gray-600 font-semibold">{investment.id}</p>
                          <p className="font-semibold text-gray-800">{investment.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(investment.category)}`}>
                        {investment.category}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold text-gray-800">{investment.investmentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Value:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(investment.currentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Returns:</span>
                        <span className={`font-semibold ${investment.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {investment.returnsPercentage}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(investment)}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile Pagination */}
          {filteredInvestments.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvestments.length)} of {filteredInvestments.length} investments
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 text-xs rounded-lg transition-colors font-medium ${
                          currentPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          {/* Table Header */}
          <div className="bg-green-50 px-4 py-3 border-b border-green-100">
            <div className="flex items-center gap-8 font-semibold text-gray-700 text-sm">
              <div className="w-48">ID</div>
              <div className="w-56">CUSTOMER</div>
              <div className="w-56">FUND NAME</div>
              <div className="w-36">AMOUNT/MONTH</div>
              <div className="w-36">TOTAL INVESTED</div>
              <div className="w-32">RETURNS</div>
              <div className="w-32">STATUS</div>
              <div className="w-24 text-center">ACTIONS</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {currentInvestments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Investments Found</h3>
                <p className="text-gray-500">Start investing today to grow your wealth</p>
              </div>
            ) : (
              currentInvestments.map((investment) => {
                const InvestmentIcon = investment.icon;

                return (
                  <div key={investment.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-8 text-sm">
                      {/* ID */}
                      <div className="w-48">
                        <span className="font-mono text-gray-600 font-semibold">{investment.id}</span>
                      </div>

                      {/* Customer */}
                      <div className="w-56">
                        <p className="font-semibold text-gray-800">{investment.customer}</p>
                      </div>

                      {/* Fund Name */}
                      <div className="w-56">
                        <p className="font-semibold text-gray-800">{investment.type}</p>
                      </div>

                      {/* Amount/Month */}
                      <div className="w-36">
                        <p className="text-gray-700">{investment.sipAmount ? formatCurrency(investment.sipAmount) : 'Lumpsum'}</p>
                      </div>

                      {/* Total Invested */}
                      <div className="w-36">
                        <p className="font-bold text-gray-800">{formatCurrency(investment.investedAmount)}</p>
                      </div>

                      {/* Returns */}
                      <div className="w-32">
                        <div className="flex items-center gap-1">
                          {investment.returns >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`font-bold text-sm ${investment.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {investment.returnsPercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="w-32">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {investment.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="w-24 flex justify-center">
                        <button
                          onClick={() => handleViewDetails(investment)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Pagination */}
          {filteredInvestments.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvestments.length)} of {filteredInvestments.length} investments
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 text-sm rounded-lg transition-colors font-medium ${
                          currentPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Details Modal */}
      {showModal && selectedInvestment && (
        <InvestmentDetailsModal investment={selectedInvestment} onClose={() => setShowModal(false)} />
      )}

      {/* Investment Type Selection Modal */}
      {showInvestmentTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <button
              onClick={() => setShowInvestmentTypeModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 pr-8">
                Start New Investment
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Choose your investment plan and start building wealth for the future</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { name: 'Mutual Funds', icon: PieChart, color: 'from-green-500 to-green-600', desc: 'Diversified fund options', badge: 'Popular' },
                { name: 'SIP', icon: TrendingUp, color: 'from-blue-500 to-blue-600', desc: 'Systematic Investment Plan', badge: 'Recommended' },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowInvestmentTypeModal(false);
                    setSelectedServiceType(item.name);
                  }}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95 relative"
                >
                  {item.badge && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-blue-700 truncate">{item.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Home Service Form Popup */}
      {selectedServiceType && (
        <HomeServiceFormPopup 
          serviceType={selectedServiceType} 
          onClose={() => setSelectedServiceType(null)} 
        />
      )}
    </div>
  );
};

export default InvestmentManagement;
