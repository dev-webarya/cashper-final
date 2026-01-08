import React, { useState, useEffect } from 'react';
import { 
  Shield, Heart, Car, Home, Briefcase, Users, Calendar, 
  IndianRupee, CheckCircle, Clock, AlertCircle, X, Eye, 
  Download, RefreshCw, Plus, Search, Filter, TrendingUp, DollarSign, FileText, ArrowUpRight
} from 'lucide-react';
import { 
  getHealthInsuranceApplications, 
  getMotorInsuranceApplications, 
  getTermInsuranceApplications 
} from '../../services/dashboardApi';
import HomeServiceFormPopup from './HomeServiceFormPopup';

const InsuranceManagement = () => {
  const [insurancePolicies, setInsurancePolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInsuranceTypeModal, setShowInsuranceTypeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  useEffect(() => {
    // Initial fetch on component mount
    fetchInsurancePolicies();
    
    // Only refresh when page comes into focus (user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page came into focus - refreshing data');
        fetchInsurancePolicies();
      }
    };
    
    // Refresh when window gains focus
    const handleWindowFocus = () => {
      console.log('Window focused - refreshing data');
      fetchInsurancePolicies();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      console.log('Cleaning up insurance management effects');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const fetchInsurancePolicies = async () => {
    try {
      // Don't set loading to true on auto-refresh to avoid UI flicker
      const isAutoRefresh = !document.hidden;
      if (!isAutoRefresh) setLoading(true);
      
      // Fetch all three insurance types from specific APIs
      const [healthResponse, motorResponse, termResponse] = await Promise.all([
        getHealthInsuranceApplications().catch(err => {
          console.error('Health insurance fetch failed:', err);
          return [];
        }),
        getMotorInsuranceApplications().catch(err => {
          console.error('Motor insurance fetch failed:', err);
          return [];
        }),
        getTermInsuranceApplications().catch(err => {
          console.error('Term insurance fetch failed:', err);
          return [];
        })
      ]);
      
      console.log('Health Insurance Apps:', healthResponse);
      console.log('Motor Insurance Apps:', motorResponse);
      console.log('Term Insurance Apps:', termResponse);
      
      // Combine all applications with proper type assignment
      let allPolicies = [];
      
      // Add health insurance applications
      if (Array.isArray(healthResponse) && healthResponse.length > 0) {
        console.log('Adding', healthResponse.length, 'health applications');
        allPolicies = allPolicies.concat(healthResponse.map(app => ({
          ...app,
          type: 'Health Insurance'
        })));
      }
      
      // Add motor insurance applications
      if (Array.isArray(motorResponse) && motorResponse.length > 0) {
        console.log('Adding', motorResponse.length, 'motor applications');
        allPolicies = allPolicies.concat(motorResponse.map(app => ({
          ...app,
          type: 'Motor Insurance'
        })));
      }
      
      // Add term insurance applications
      if (Array.isArray(termResponse) && termResponse.length > 0) {
        console.log('Adding', termResponse.length, 'term applications');
        allPolicies = allPolicies.concat(termResponse.map(app => ({
          ...app,
          type: 'Term Insurance'
        })));
      }
      
      console.log('Total Combined Policies:', allPolicies.length);
      
      // Transform policies with proper data mapping
      const transformedPolicies = allPolicies.map((policy, index) => {
        let icon, color, bgColor;
        
        if (policy.type === 'Health Insurance') {
          icon = Heart;
          color = 'from-red-600 to-pink-600';
          bgColor = 'bg-red-50';
        } else if (policy.type === 'Motor Insurance') {
          icon = Car;
          color = 'from-blue-600 to-cyan-600';
          bgColor = 'bg-blue-50';
        } else if (policy.type === 'Term Insurance') {
          icon = Shield;
          color = 'from-green-600 to-emerald-600';
          bgColor = 'bg-green-50';
        } else {
          icon = Shield;
          color = 'from-purple-600 to-pink-600';
          bgColor = 'bg-purple-50';
        }
        
        return {
          ...policy,
          id: policy.id || `policy-${index}-${Date.now()}`,
          icon,
          color,
          bgColor,
          status: policy.status || 'pending',
          policyNumber: policy.applicationNumber || policy.policyNumber || `APP-${index + 1}`,
          provider: policy.insuranceProvider || policy.provider || 'N/A',
          appliedDate: policy.createdAt || policy.appliedDate || 'N/A',
          benefits: policy.benefits || []
        };
      });
      
      console.log('Transformed Policies Count:', transformedPolicies.length);
      console.log('Transformed Policies:', transformedPolicies);
      
      setInsurancePolicies(transformedPolicies);
    } catch (error) {
      console.error('Error fetching insurance policies:', error);
      // Keep existing data on error
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

  const getStatusBadge = (status) => {
    const styles = {
      'Active': 'bg-green-100 text-green-800',
      'Expiring Soon': 'bg-yellow-100 text-yellow-800',
      'Expired': 'bg-red-100 text-red-800',
      'Pending': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusCategory = (apiStatus) => {
    /**
     * Map API statuses to UI categories
     * Backend returns: submitted, under_review, documents_pending, medical_pending, approved, rejected, policy_issued, etc.
     * UI shows: Active, Expiring Soon, Expired, Pending, Cancelled
     */
    const statusMap = {
      'submitted': 'Pending',
      'under_review': 'Pending',
      'documents_pending': 'Pending',
      'medical_pending': 'Pending',
      'approved': 'Active',
      'policy_issued': 'Active',
      'rejected': 'Cancelled',
      'expired': 'Expired'
    };
    return statusMap[apiStatus?.toLowerCase()] || apiStatus;
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPolicies = insurancePolicies
    .filter(policy => {
      // Status filter
      let statusMatch = true;
      if (statusFilter !== 'all') {
        const policyStatus = (policy.status || '').toLowerCase();
        const filterStatus = statusFilter.toLowerCase();
        statusMatch = policyStatus === filterStatus;
      }
      
      // Service type filter
      let serviceMatch = true;
      if (serviceFilter === 'all') serviceMatch = true;
      else if (serviceFilter === 'health') serviceMatch = policy.type === 'Health Insurance';
      else if (serviceFilter === 'motor') serviceMatch = policy.type === 'Motor Insurance' || policy.type === 'Vehicle Insurance';
      else if (serviceFilter === 'term') serviceMatch = policy.type === 'Term Insurance';
      
      // Search filter
      const searchMatch = policy.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (policy.policyNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (policy.provider || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && serviceMatch && searchMatch;
    });

  // Pagination
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const insuranceStats = {
    total: insurancePolicies.length,
    active: insurancePolicies.filter(p => {
      const status = (p.status || '').toLowerCase();
      return status === 'active' || status === 'approved' || status === 'accepted';
    }).length,
    pending: insurancePolicies.filter(p => {
      const status = (p.status || '').toLowerCase();
      return status === 'pending' || status === 'submitted' || status === 'processing' || status === 'under review';
    }).length,
    health: insurancePolicies.filter(p => p.type === 'Health Insurance').length,
    motor: insurancePolicies.filter(p => p.type === 'Motor Insurance').
    length,
    term: insurancePolicies.filter(p => p.type === 'Term Insurance').length,
    expiring: insurancePolicies.filter(p => {
      const status = (p.status || '').toLowerCase();
      return status.includes('expiring') || status.includes('expiring soon');
    }).length,
    totalCoverage: insurancePolicies.reduce((sum, p) => {
      // Handle multiple coverage field names
      const coverageValue = p.coverage || p.coverageAmount || p.sumInsured || '0';
      if (typeof coverageValue === 'string') {
        const num = parseInt(coverageValue.replace(/[^\d]/g, '')) || 0;
        return sum + num;
      }
      return sum + (parseInt(coverageValue) || 0);
    }, 0),
    totalPremium: insurancePolicies.reduce((sum, p) => {
      // Handle multiple premium field names
      const premiumValue = p.premium || p.monthlyPremium || p.premiumAmount || '0';
      if (typeof premiumValue === 'string') {
        const num = parseInt(premiumValue.replace(/[^\d]/g, '')) || 0;
        return sum + num;
      }
      return sum + (parseInt(premiumValue) || 0);
    }, 0)
  };

  console.log('Insurance Stats Updated:', insuranceStats);

  const handleViewDetails = async (policy) => {
    try {
      const token = localStorage.getItem('access_token');
      
      console.log('🔍 Viewing details for policy:', policy);
      
      // Determine the correct API endpoint based on insurance type
      let endpoint = '';
      if (policy.type === 'Health Insurance') {
        endpoint = 'health-insurance';
      } else if (policy.type === 'Motor Insurance' || policy.type === 'Vehicle Insurance') {
        endpoint = 'motor-insurance';
      } else if (policy.type === 'Term Insurance') {
        endpoint = 'term-insurance';
      }
      
      if (endpoint && policy._id) {
        console.log(`📡 Fetching from: http://localhost:8000/api/${endpoint}/applications/${policy._id}`);
        
        const response = await fetch(`http://localhost:8000/api/${endpoint}/applications/${policy._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Fetched full application details:', data);
          console.log('📄 Documents in response:', data.documents);
          
          setSelectedPolicy({
            ...policy,
            fullData: data
          });
        } else {
          console.error('❌ Failed to fetch application details, status:', response.status);
          setSelectedPolicy(policy);
        }
      } else {
        console.log('⚠️ Using policy data directly (no endpoint or _id)');
        setSelectedPolicy(policy);
      }
    } catch (error) {
      console.error('❌ Error fetching application details:', error);
      setSelectedPolicy(policy);
    }
    setShowModal(true);
  };

  const handleRenewPolicy = (policy) => {
    alert(`Initiating renewal process for Policy: ${policy.policyNumber}`);
    // In production: Navigate to renewal page or open renewal form
    // navigate('/insurance/renew?policyId=' + policy.id);
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
      
      console.log('📥 Download URL:', downloadUrl);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(downloadUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }
      
      const blob = await response.blob();
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

  const handleDownloadPolicy = (policy) => {
    // Generate and download PDF report
    const reportContent = `
      Insurance Policy Report
      =====================
      
      Policy Number: ${policy.policyNumber}
      Type: ${policy.type}
      Provider: ${policy.provider}
      Premium: ${policy.premium || 'N/A'}
      Coverage: ${policy.coverage || 'N/A'}
      Applied Date: ${policy.appliedDate || 'N/A'}
      Renewal Date: ${policy.renewalDate || 'N/A'}
      Status: ${getStatusCategory(policy.status)}
      
      Additional Details:
      - Days to Renewal: ${policy.daysToRenewal || 'N/A'}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Insurance_Policy_${policy.policyNumber}_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDocuments = (policy) => {
    // Open documents in new window or tab
    const documentsHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Policy Documents - ${policy.policyNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
          .doc-item { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #16a34a; }
          .doc-item h3 { margin: 0 0 10px 0; color: #1f2937; }
          .doc-item p { margin: 5px 0; color: #6b7280; }
          .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 20px; font-size: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📄 Policy Documents</h1>
          <p><strong>Policy Number:</strong> ${policy.policyNumber}</p>
          <p><strong>Type:</strong> ${policy.type}</p>
          <hr style="margin: 20px 0;">
          
          <div class="doc-item">
            <h3>📋 Policy Certificate</h3>
            <p><span class="badge">✓ Uploaded</span></p>
            <p>Original policy document issued by ${policy.provider}</p>
          </div>
          
          <div class="doc-item">
            <h3>🆔 Identity Proof (Aadhaar/PAN)</h3>
            <p><span class="badge">✓ Verified</span></p>
            <p>Government issued identification document</p>
          </div>
          
          <div class="doc-item">
            <h3>📸 Photograph</h3>
            <p><span class="badge">✓ Uploaded</span></p>
            <p>Passport size photograph</p>
          </div>
          
          <div class="doc-item">
            <h3>🏥 Medical Reports (if applicable)</h3>
            <p><span class="badge">✓ Uploaded</span></p>
            <p>Pre-policy medical examination reports</p>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Note:</strong> All documents have been verified and approved by ${policy.provider}.
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
    alert('Exporting all insurance policies to PDF...');
    // In production: Generate PDF report
  };

  const handleApplyNewPolicy = () => {
    // Navigate to insurance application page
    window.location.href = '/insurance';
  };

  const PolicyDetailsModal = ({ policy, onClose }) => {
    if (!policy) return null;

    const PolicyIcon = policy.icon;
    const daysUntilExpiry = getDaysUntilExpiry(policy.endDate);

    return (
      <div 
        className="fixed inset-0 z-50  flex items-center justify-center p-4"
        onClick={(e) => {
          // Only close if clicking on the backdrop itself
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        style={{ overflow: 'hidden' }}
      >
        <div 
          className="bg-white  shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3  flex justify-between items-center z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{policy.type}</h2>
              <p className="text-green-100 text-sm mt-1">Policy: {policy.policyNumber}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-green-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(getStatusCategory(policy.status))} shadow-md`}>
                {getStatusCategory(policy.status)}
              </span>
            </div>

            {/* Policy Information */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
              <h3 className="text-base font-bold text-green-900 mb-3">Policy Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(() => {
                  const data = policy.fullData || policy;
                  const excludeFields = ['_id', 'user_id', 'created_at', 'updated_at', 'documents', 'icon', 'color', 'fullData', '__v'];
                  
                  // Document field patterns to exclude from policy information
                  const documentFieldPatterns = ['aadhar', 'aadhaar', 'pan', 'photo', 'signature', 'medical', 'id_proof', 'address_proof', 'income_proof', 'vehicle_rc', 'driving_license', 'passport'];
                  
                  const fieldLabels = {
                    'policyNumber': 'Policy Number',
                    'applicationNumber': 'Application Number',
                    'application_number': 'Application Number',
                    'userId': 'User ID',
                    'user_id': 'User ID',
                    'type': 'Insurance Type',
                    'provider': 'Insurance Provider',
                    'coverage': 'Coverage Amount',
                    'coverageAmount': 'Coverage Amount',
                    'coverage_amount': 'Coverage Amount',
                    'premium': 'Premium Amount',
                    'appliedDate': 'Applied Date',
                    'renewalDate': 'Renewal Date',
                    'status': 'Status',
                    'name': 'Applicant Name',
                    'email': 'Email',
                    'phone': 'Phone',
                    'age': 'Age',
                    'gender': 'Gender',
                    'familySize': 'Family Size',
                    'family_size': 'Family Size',
                    'policyType': 'Policy Type',
                    'policy_type': 'Policy Type',
                    'medical_history': 'Medical History',
                    'existingConditions': 'Existing Conditions',
                    'existing_conditions': 'Existing Conditions',
                    'family_members': 'Family Members',
                    'sum_insured': 'Sum Insured',
                    'policy_term': 'Policy Term',
                    'vehicle_type': 'Vehicle Type',
                    'vehicle_number': 'Vehicle Number',
                    'vehicle_model': 'Vehicle Model',
                    'vehicle_year': 'Vehicle Year',
                    'nominee_name': 'Nominee Name',
                    'nominee_relationship': 'Nominee Relationship',
                    'address': 'Address',
                    'city': 'City',
                    'state': 'State',
                    'pincode': 'Pincode'
                  };
                  
                  return Object.entries(data)
                    .filter(([key, value]) => {
                      // Exclude basic fields
                      if (excludeFields.includes(key)) return false;
                      
                      // Exclude document fields (any field that looks like a file path)
                      const keyLower = key.toLowerCase();
                      const isDocumentField = documentFieldPatterns.some(pattern => keyLower.includes(pattern));
                      if (isDocumentField) return false;
                      
                      // Exclude if value looks like a file path
                      const valueStr = String(value);
                      if (valueStr.includes('uploads/') || valueStr.includes('\\') || valueStr.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
                        return false;
                      }
                      
                      // Exclude null, undefined, empty values and objects
                      if (value === null || value === undefined || value === '' || typeof value === 'object') {
                        return false;
                      }
                      
                      return true;
                    })
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                          {fieldLabels[key] || key.replace(/_/g, ' ').toUpperCase()}
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
              const data = policy.fullData || policy;
              
              // Check for documents in multiple places
              let documents = {};
              
              // First check if documents object exists
              if (data.documents && typeof data.documents === 'object') {
                documents = { ...data.documents };
              }
              
              // Also check for individual document fields in the data
              const documentFieldPatterns = ['aadhar', 'aadhaar', 'pan', 'photo', 'signature', 'medical', 'id_proof', 'address_proof', 'income_proof', 'vehicle_rc', 'driving_license', 'passport'];
              Object.entries(data).forEach(([key, value]) => {
                const keyLower = key.toLowerCase();
                const isDocField = documentFieldPatterns.some(pattern => keyLower.includes(pattern));
                const valueStr = String(value);
                const isFilePath = valueStr.includes('uploads/') || valueStr.includes('\\') || valueStr.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i);
                
                if ((isDocField || isFilePath) && value && typeof value === 'string') {
                  documents[key] = value;
                }
              });
              
              const hasDocuments = Object.keys(documents).length > 0;
              
              console.log('📄 Documents found:', documents);
              
              return hasDocuments ? (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Uploaded Documents
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {Object.entries(documents).map(([docKey, docPath], index) => {
                      if (!docPath || typeof docPath !== 'string') return null;
                      const docName = docPath.split('\\').pop().split('/').pop();
                      const displayName = docKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                              <p className="text-xs text-gray-500 truncate">{docName}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => downloadDocument(docPath)}
                            className="flex items-center gap-2 px-3 py-1.5 text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors whitespace-nowrap ml-3 flex-shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Benefits - Only show if benefits exist */}
            {policy.benefits && policy.benefits.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-2">Coverage Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {policy.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <p className="text-gray-600">Loading your insurance policies...</p>
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
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            My Insurance
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track all your insurance policies</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchInsurancePolicies}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:opacity-50"
            title="Refresh to fetch latest data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowInsuranceTypeModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Buy New Policy
          </button>
        </div>
      </div>

      {/* Stats and Insurance Type Cards - All 5 in One Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Active */}
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow-md border-l-4 border-green-600">
          <p className="text-gray-600 text-xs mb-1">Active</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{insuranceStats.active}</p>
        </div>

        {/* Pending */}
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow-md border-l-4 border-yellow-600">
          <p className="text-gray-600 text-xs mb-1">Pending</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{insuranceStats.pending}</p>
        </div>

        {/* Health Insurance */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 sm:p-4 rounded-lg shadow-md border-l-4 border-red-600">
          <p className="text-gray-700 text-xs font-semibold mb-1">Health</p>
          <p className="text-xl sm:text-3xl font-bold text-red-600">{insuranceStats.health || 0}</p>
        </div>

        {/* Motor Insurance */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-2 sm:p-4 rounded-lg shadow-md border-l-4 border-cyan-600">
          <p className="text-gray-700 text-xs font-semibold mb-1">Motor</p>
          <p className="text-xl sm:text-3xl font-bold text-cyan-600">{insuranceStats.motor || 0}</p>
        </div>

        {/* Term Insurance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-4 rounded-lg shadow-md border-l-4 border-green-600">
          <p className="text-gray-700 text-xs font-semibold mb-1">Term</p>
          <p className="text-xl sm:text-3xl font-bold text-green-600">{insuranceStats.term || 0}</p>
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
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white cursor-pointer"
          >
            <option value="all">All Services</option>
            <option value="health">Health Insurance</option>
            <option value="motor">Motor Insurance</option>
            <option value="term">Term Insurance</option>
          </select>
        </div>
      </div>

      {/* Policies List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {currentPolicies.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-600 mb-2">No Policies Found</h3>
              <p className="text-sm text-gray-500">You don't have any insurance policies matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentPolicies.map((policy) => {
                const PolicyIcon = policy.icon;
                const daysUntilExpiry = getDaysUntilExpiry(policy.endDate);

                return (
                  <div key={policy.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${policy.color}`}>
                          <PolicyIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-gray-600 font-semibold">{policy.policyNumber}</p>
                          <p className="font-semibold text-gray-800">{policy.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(getStatusCategory(policy.status))}`}>
                        {getStatusCategory(policy.status)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Provider:</span>
                        <span className="font-semibold text-gray-800">{policy.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Premium:</span>
                        <span className="font-semibold text-green-600">{policy.premium || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applied:</span>
                        <span className="font-semibold">{policy.appliedDate || 'N/A'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(policy)}
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
          {filteredPolicies.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPolicies.length)} of {filteredPolicies.length} policies
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
        <div className="hidden md:block overflow-x-auto">
          {/* Table Header */}
          <div className="bg-green-50 border-b border-green-100">
            <div className="flex items-center px-4 py-3 font-semibold text-gray-700 text-xs sticky top-0 bg-green-50">
              <div className="flex-[1.2] pr-3">POLICY NO</div>
              <div className="flex-1 pr-3">TYPE</div>
              {/* Conditionally show NAME if we have it */}
              {currentPolicies.some(p => p.name && p.name.trim()) && (
                <div className="flex-1 pr-3">NAME</div>
              )}
              {/* Conditionally show EMAIL if we have it */}
              {currentPolicies.some(p => p.email && p.email.trim()) && (
                <div className="flex-[1.3] pr-3">EMAIL</div>
              )}
              {/* Conditionally show PHONE if we have it */}
              {currentPolicies.some(p => p.phone && p.phone.trim()) && (
                <div className="flex-1 pr-3">PHONE</div>
              )}
              <div className="flex-1 pr-3">STATUS</div>
              <div className="flex-[0.5] text-center">ACTIONS</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {currentPolicies.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Policies Found</h3>
                <p className="text-gray-500">You don't have any insurance policies matching your criteria</p>
              </div>
            ) : (
              currentPolicies.map((policy) => {
                const hasName = policy.name && policy.name.trim();
                const hasEmail = policy.email && policy.email.trim();
                const hasPhone = policy.phone && policy.phone.trim();

                return (
                  <div key={policy.id} className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-xs text-gray-800">
                    {/* Policy Number */}
                    <div className="flex-[1.2] pr-3 font-mono font-semibold text-gray-700">
                      {policy.policyNumber}
                    </div>

                    {/* Type */}
                    <div className="flex-1 pr-3 font-semibold text-gray-800">
                      {policy.type}
                    </div>

                    {/* Name - Show if available */}
                    {currentPolicies.some(p => p.name && p.name.trim()) && (
                      <div className="flex-1 pr-3 truncate text-gray-700">
                        {hasName ? policy.name : '-'}
                      </div>
                    )}

                    {/* Email - Show if available */}
                    {currentPolicies.some(p => p.email && p.email.trim()) && (
                      <div className="flex-[1.3] pr-3 truncate text-blue-600">
                        {hasEmail ? policy.email : '-'}
                      </div>
                    )}

                    {/* Phone - Show if available */}
                    {currentPolicies.some(p => p.phone && p.phone.trim()) && (
                      <div className="flex-1 pr-3 text-gray-700">
                        {hasPhone ? policy.phone : '-'}
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex-1 pr-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(getStatusCategory(policy.status))}`}>
                        {getStatusCategory(policy.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex-[0.5] flex justify-center">
                      <button
                        onClick={() => handleViewDetails(policy)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Pagination */}
          {filteredPolicies.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPolicies.length)} of {filteredPolicies.length} policies
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

      {/* Policy Details Modal */}
      {showModal && selectedPolicy && (
        <PolicyDetailsModal policy={selectedPolicy} onClose={() => setShowModal(false)} />
      )}

      {/* Insurance Type Selection Modal */}
      {showInsuranceTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <button
              onClick={() => setShowInsuranceTypeModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 pr-8">
                Buy New Policy
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Protect yourself and your loved ones with comprehensive coverage</p>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'Health Insurance', icon: Heart, color: 'from-red-500 to-red-600', desc: 'Comprehensive health coverage' },
                  { name: 'Motor Insurance', icon: Car, color: 'from-blue-500 to-blue-600', desc: 'Vehicle insurance coverage' },
                  { name: 'Term Insurance', icon: Shield, color: 'from-teal-500 to-teal-600', desc: 'Life protection for family' },
                ].map((insurance, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setShowInsuranceTypeModal(false);
                      setSelectedServiceType(insurance.name);
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

export default InsuranceManagement;
