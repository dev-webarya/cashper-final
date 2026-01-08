import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, Calendar, TrendingUp, FileText, Clock, CheckCircle, 
  AlertCircle, Eye, Download, ChevronRight, Plus, Filter, Search,
  CreditCard, Home, Briefcase, DollarSign, X, RefreshCw, ArrowUpRight
} from 'lucide-react';
import { getUserLoans, getLoanDetails } from '../../services/dashboardApi';
import LoanFormPopup from './LoanFormPopup';

const LoanManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLoanTypeModal, setShowLoanTypeModal] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Helper function to parse documents string into individual fields
  const parseDocuments = (documentsStr) => {
    const docs = {
      aadhar: '',
      pan: '',
      bankStatement: '',
      salarySlip: '',
      photo: ''
    };

    if (!documentsStr || typeof documentsStr !== 'string') {
      return docs;
    }

    // Parse "aadhar: /path/to/file.jpg, pan: /path/to/file.png, ..."
    const pairs = documentsStr.split(',').map(pair => pair.trim());
    pairs.forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value && docs.hasOwnProperty(key)) {
        docs[key] = value;
      }
    });

    return docs;
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching all loan applications...');
      
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        setLoans([]);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch from all 4 loan APIs in parallel
      const [personalLoans, homeLoans, businessLoans, shortTermLoans] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/personal-loan/applications', { headers })
          .then(async res => {
            console.log('Personal Loan API Status:', res.status);
            if (!res.ok) {
              console.error('Personal Loan API Error:', await res.text());
              return [];
            }
            return res.json();
          })
          .catch(err => { console.error('Personal Loan Fetch Error:', err); return []; }),
        fetch('http://127.0.0.1:8000/api/home-loan/applications', { headers })
          .then(async res => {
            console.log('Home Loan API Status:', res.status);
            if (!res.ok) {
              console.error('Home Loan API Error:', await res.text());
              return [];
            }
            return res.json();
          })
          .catch(err => { console.error('Home Loan Fetch Error:', err); return []; }),
        fetch('http://127.0.0.1:8000/api/business-loan/applications', { headers })
          .then(async res => {
            console.log('Business Loan API Status:', res.status);
            if (!res.ok) {
              console.error('Business Loan API Error:', await res.text());
              return [];
            }
            return res.json();
          })
          .catch(err => { console.error('Business Loan Fetch Error:', err); return []; }),
        fetch('http://127.0.0.1:8000/api/short-term-loan/applications', { headers })
          .then(async res => {
            console.log('🎯 Short Term Loan API Status:', res.status);
            if (!res.ok) {
              const errorText = await res.text();
              console.error('❌ Short Term Loan API Error:', errorText);
              return [];
            }
            const data = await res.json();
            console.log('✅ Short Term Loan Data Received:', data);
            return data;
          })
          .catch(err => { 
            console.error('❌ Short Term Loan Fetch Error:', err); 
            return []; 
          })
      ]);

      console.log('📊 API Response Counts:', { 
        personal: personalLoans?.length || 0, 
        home: homeLoans?.length || 0, 
        business: businessLoans?.length || 0, 
        shortTerm: shortTermLoans?.length || 0
      });

      // Transform and combine all loan data
      const allLoans = [];

      // Process Personal Loans
      if (Array.isArray(personalLoans)) {
        personalLoans.forEach(loan => {
          // Parse documents string if present
          const parsedDocs = loan.documents ? parseDocuments(loan.documents) : {};
          
          allLoans.push({
            id: loan._id || loan.id || `PL${Date.now()}${Math.random()}`,
            type: 'Personal Loan',
            serviceType: 'personal',
            customer: loan.fullName || loan.name || 'N/A',
            email: loan.email || '',
            phone: loan.phone || loan.mobileNumber || '',
            address: loan.address || '',
            city: loan.city || '',
            state: loan.state || '',
            pincode: loan.pincode || '',
            userId: loan.userId || '',
            panNumber: loan.panNumber || '',
            aadharNumber: loan.aadharNumber || '',
            companyName: loan.companyName || '',
            workExperience: loan.workExperience || '',
            creditScore: loan.creditScore || '',
            amount: parseInt(loan.loanAmount) || 0,
            outstandingAmount: parseInt(loan.loanAmount) || 0,
            disbursedAmount: loan.status === 'Approved' ? parseInt(loan.loanAmount) : 0,
            emiAmount: loan.monthlyEmi || Math.round((parseInt(loan.loanAmount) || 0) / 12),
            interestRate: loan.interestRate || 12.5,
            tenure: loan.loanTenure || 12,
            completedTenure: 0,
            employmentType: loan.employment || loan.employmentType || '',
            monthlyIncome: parseInt(loan.monthlyIncome) || 0,
            loanPurpose: loan.purpose || loan.loanPurpose || '',
            status: loan.status || 'Pending',
            applicationDate: loan.createdAt || loan.submittedAt || new Date().toISOString(),
            approvalDate: loan.approvedAt || null,
            disbursementDate: loan.disbursedAt || null,
            nextEmiDate: loan.nextEmiDate || null,
            submittedAt: loan.createdAt || loan.submittedAt,
            lastUpdated: loan.updatedAt || loan.lastUpdated,
            // Document fields - parse from documents string or use individual fields
            aadharCard: loan.aadhar || parsedDocs.aadhar || loan.aadharCard || loan.documents?.aadharCard || '',
            panCard: loan.pan || parsedDocs.pan || loan.panCard || loan.documents?.panCard || '',
            photograph: loan.photo || parsedDocs.photo || loan.photograph || loan.documents?.photograph || '',
            incomeProof: loan.salarySlip || parsedDocs.salarySlip || loan.incomeProof || loan.documents?.incomeProof || '',
            addressProof: loan.addressProof || loan.documents?.addressProof || '',
            bankStatements: loan.bankStatement || parsedDocs.bankStatement || loan.bankStatements || loan.documents?.bankStatements || '',
            aadharCardFileName: loan.aadharCardFileName || (loan.aadhar || parsedDocs.aadhar ? (loan.aadhar || parsedDocs.aadhar).split('/').pop() : `${loan._id}_aadhar.png`),
            panCardFileName: loan.panCardFileName || (loan.pan || parsedDocs.pan ? (loan.pan || parsedDocs.pan).split('/').pop() : `${loan._id}_pan.png`),
            photographFileName: loan.photographFileName || (loan.photo || parsedDocs.photo ? (loan.photo || parsedDocs.photo).split('/').pop() : `${loan._id}_photo.png`),
            incomeProofFileName: loan.incomeProofFileName || (loan.salarySlip || parsedDocs.salarySlip ? (loan.salarySlip || parsedDocs.salarySlip).split('/').pop() : `${loan._id}_income.png`),
            addressProofFileName: loan.addressProofFileName || `${loan._id}_address.png`,
            bankStatementsFileName: loan.bankStatementsFileName || (loan.bankStatement || parsedDocs.bankStatement ? (loan.bankStatement || parsedDocs.bankStatement).split('/').pop() : `${loan._id}_bank.png`),
            icon: CreditCard,
            color: 'from-blue-500 to-blue-600'
          });
        });
      }

      // Process Home Loans
      if (Array.isArray(homeLoans)) {
        homeLoans.forEach(loan => {
          allLoans.push({
            id: loan._id || loan.id || `HL${Date.now()}${Math.random()}`,
            type: 'Home Loan',
            serviceType: 'home',
            customer: loan.fullName || loan.name || 'N/A',
            email: loan.email || '',
            phone: loan.mobileNumber || loan.phone || '',
            address: loan.address || '',
            userId: loan.userId || '',
            amount: loan.loanAmount || 0,
            outstandingAmount: loan.loanAmount || 0,
            disbursedAmount: loan.status === 'Approved' ? loan.loanAmount : 0,
            emiAmount: loan.monthlyEmi || Math.round((loan.loanAmount || 0) / 240),
            interestRate: loan.interestRate || 8.5,
            tenure: loan.loanTenure || 240,
            completedTenure: 0,
            employmentType: loan.employmentType || '',
            monthlyIncome: loan.monthlyIncome || 0,
            loanPurpose: loan.loanPurpose || 'Home Purchase',
            status: loan.status || 'Pending',
            applicationDate: loan.submittedAt || loan.createdAt || new Date().toISOString(),
            approvalDate: loan.approvedAt || null,
            disbursementDate: loan.disbursedAt || null,
            nextEmiDate: loan.nextEmiDate || null,
            submittedAt: loan.submittedAt || loan.createdAt,
            lastUpdated: loan.updatedAt || loan.lastUpdated,
            // Document fields
            aadharCard: loan.aadharCard || loan.documents?.aadharCard || '',
            panCard: loan.panCard || loan.documents?.panCard || '',
            photograph: loan.photograph || loan.documents?.photograph || '',
            incomeProof: loan.incomeProof || loan.documents?.incomeProof || '',
            addressProof: loan.addressProof || loan.documents?.addressProof || '',
            bankStatements: loan.bankStatements || loan.documents?.bankStatements || '',
            aadharCardFileName: loan.aadharCardFileName || `${loan._id}_aadhar.png`,
            panCardFileName: loan.panCardFileName || `${loan._id}_pan.png`,
            photographFileName: loan.photographFileName || `${loan._id}_photo.png`,
            incomeProofFileName: loan.incomeProofFileName || `${loan._id}_income.png`,
            addressProofFileName: loan.addressProofFileName || `${loan._id}_address.png`,
            bankStatementsFileName: loan.bankStatementsFileName || `${loan._id}_bank.png`,
            icon: Home,
            color: 'from-green-500 to-green-600'
          });
        });
      }

      // Process Business Loans
      if (Array.isArray(businessLoans)) {
        businessLoans.forEach(loan => {
          allLoans.push({
            id: loan._id || loan.id || `BL${Date.now()}${Math.random()}`,
            type: 'Business Loan',
            serviceType: 'business',
            customer: loan.fullName || loan.businessName || loan.name || 'N/A',
            amount: loan.loanAmount || 0,
            outstandingAmount: loan.loanAmount || 0,
            disbursedAmount: loan.status === 'Approved' ? loan.loanAmount : 0,
            emiAmount: loan.monthlyEmi || Math.round((loan.loanAmount || 0) / 60),
            interestRate: loan.interestRate || 14,
            tenure: loan.loanTenure || 60,
            completedTenure: 0,
            status: loan.status || 'Pending',
            applicationDate: loan.submittedAt || loan.createdAt || new Date().toISOString(),
            approvalDate: loan.approvedAt || null,
            disbursementDate: loan.disbursedAt || null,
            nextEmiDate: loan.nextEmiDate || null,
            icon: Briefcase,
            color: 'from-purple-500 to-purple-600'
          });
        });
      }

      // Process Short-Term Loans
      if (Array.isArray(shortTermLoans)) {
        console.log('🔍 Processing short-term loans:', shortTermLoans);
        shortTermLoans.forEach(loan => {
          console.log('📊 Short-term loan record:', loan);
          allLoans.push({
            id: loan.id || loan._id || `ST${Date.now()}${Math.random()}`,
            type: 'Short-Term Loan',
            serviceType: 'short-term',
            customer: loan.fullName || loan.name || 'N/A',
            email: loan.email || '',
            phone: loan.phone || loan.mobileNumber || '',
            address: loan.address || '',
            city: loan.city || '',
            state: loan.state || '',
            pincode: loan.pincode || '',
            userId: loan.userId || '',
            employmentType: loan.employment || loan.employmentType || '',
            monthlyIncome: loan.monthlyIncome || 0,
            loanPurpose: loan.purpose || loan.loanPurpose || 'Emergency',
            amount: loan.loanAmount || 0,
            outstandingAmount: loan.loanAmount || 0,
            disbursedAmount: loan.status === 'Approved' ? loan.loanAmount : 0,
            emiAmount: loan.monthlyEmi || Math.round((loan.loanAmount || 0) / 6),
            interestRate: loan.interestRate || 15,
            tenure: loan.loanTenure || 6,
            completedTenure: 0,
            status: loan.status || 'Pending',
            applicationDate: loan.createdAt || new Date().toISOString(),
            approvalDate: null,
            disbursementDate: null,
            nextEmiDate: null,
            submittedAt: loan.createdAt,
            lastUpdated: loan.createdAt,
            // Document fields
            aadharCard: loan.aadhar || '',
            panCard: loan.pan || '',
            photograph: loan.photo || '',
            incomeProof: loan.salarySlip || '',
            addressProof: loan.address || '',
            bankStatements: loan.bankStatement || '',
            aadharCardFileName: `${loan.id}_aadhar.pdf`,
            panCardFileName: `${loan.id}_pan.png`,
            photographFileName: `${loan.id}_photo.png`,
            incomeProofFileName: `${loan.id}_income.pdf`,
            addressProofFileName: `${loan.id}_address.pdf`,
            bankStatementsFileName: `${loan.id}_bank.pdf`,
            icon: Clock,
            color: 'from-orange-500 to-orange-600'
          });
        });
      }

      console.log('✅ Total loans combined:', allLoans.length);
      console.log('📋 Loan breakdown:', {
        personal: allLoans.filter(l => l.type === 'Personal Loan').length,
        home: allLoans.filter(l => l.type === 'Home Loan').length,
        business: allLoans.filter(l => l.type === 'Business Loan').length,
        shortTerm: allLoans.filter(l => l.type === 'Short-Term Loan').length
      });
      console.log('📝 All Loans:', allLoans);
      setLoans(allLoans);
    } catch (error) {
      console.error('❌ Error fetching loans:', error);
      setLoans([]);
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
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Under Review': 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredLoans = loans
    .filter(loan => {
      // Status filter
      const statusMatch = statusFilter === 'all' || loan.status === statusFilter;
      
      // Service type filter
      let serviceMatch = true;
      if (serviceFilter === 'all') serviceMatch = true;
      else if (serviceFilter === 'short-term') serviceMatch = loan.type === 'Short-Term Loan';
      else if (serviceFilter === 'personal') serviceMatch = loan.type === 'Personal Loan';
      else if (serviceFilter === 'home') serviceMatch = loan.type === 'Home Loan';
      else if (serviceFilter === 'business') serviceMatch = loan.type === 'Business Loan';
      
      // Search filter
      const searchMatch = loan.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.status.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && serviceMatch && searchMatch;
    });

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const loanStats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'Active').length,
    closed: loans.filter(l => l.status === 'Closed').length,
    totalOutstanding: loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0),
    totalDisbursed: loans.reduce((sum, l) => sum + (l.disbursedAmount || 0), 0)
  };

  const handleViewDetails = async (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const handlePayEMI = (loan) => {
    alert(`Redirecting to payment gateway for EMI payment of ${formatCurrency(loan.emiAmount)} for Loan ID: ${loan.id}`);
    // In production: navigate to payment gateway or open payment modal
    // window.location.href = '/payment?loanId=' + loan.id;
  };

  const handleDownloadStatement = (loan) => {
    // Generate and download loan statement
    const statementContent = `
      Loan Statement Report
      ====================
      
      Loan ID: ${loan.id}
      Type: ${loan.type}
      Customer: ${loan.customer}
      Loan Amount: ${formatCurrency(loan.amount)}
      Outstanding Amount: ${formatCurrency(loan.outstandingAmount)}
      EMI Amount: ${formatCurrency(loan.emiAmount)}
      Interest Rate: ${loan.interestRate}% p.a.
      Tenure: ${loan.tenure} months
      Completed Tenure: ${loan.completedTenure} months
      Remaining Tenure: ${loan.tenure - loan.completedTenure} months
      Application Date: ${formatDate(loan.applicationDate)}
      Next EMI Date: ${formatDate(loan.nextEmiDate)}
      Status: ${loan.status}
      
      Progress: ${((loan.completedTenure / loan.tenure) * 100).toFixed(1)}% Complete
    `;
    
    const blob = new Blob([statementContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Loan_${loan.id}_Statement.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDocuments = (loan) => {
    // Open documents in new window
    const documentsHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loan Documents - ${loan.id}</title>
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
          <h1>📄 Loan Documents</h1>
          <p><strong>Loan ID:</strong> ${loan.id}</p>
          <p><strong>Type:</strong> ${loan.type}</p>
          <p><strong>Amount:</strong> ${formatCurrency(loan.amount)}</p>
          <hr style="margin: 20px 0;">
          
          <div class="doc-item">
            <h3>🆔 Identity Proof (Aadhaar)</h3>
            <p><span class="badge">✓ Verified</span></p>
            <p>Government issued Aadhaar card</p>
          </div>
          
          <div class="doc-item">
            <h3>🆔 PAN Card</h3>
            <p><span class="badge">✓ Verified</span></p>
            <p>Permanent Account Number card</p>
          </div>
          
          <div class="doc-item">
            <h3>💰 Income Proof</h3>
            <p><span class="badge">✓ Uploaded</span></p>
            <p>Salary slips / Bank statements</p>
          </div>
          
          <div class="doc-item">
            <h3>🏡 Address Proof</h3>
            <p><span class="badge">✓ Verified</span></p>
            <p>Utility bill / Rental agreement</p>
          </div>
          
          <div class="doc-item">
            <h3>📸 Photograph</h3>
            <p><span class="badge">✓ Uploaded</span></p>
            <p>Passport size photograph</p>
          </div>
          
          <div class="doc-item">
            <h3>📝 Loan Agreement</h3>
            <p><span class="badge">✓ Signed</span></p>
            <p>Signed loan agreement document</p>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Note:</strong> All documents have been verified and approved.
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
    alert('Exporting all loans data to PDF...');
    // In production: Generate PDF report of all loans
  };
  const LoanDetailsModal = ({ loan, onClose }) => {
    if (!loan) return null;
    const LoanIcon = loan.icon;
    const progressPercentage = ((loan.completedTenure / loan.tenure) * 100).toFixed(1);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 " onClick={onClose}>
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${loan.color} p-6 text-white relative`}>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <LoanIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{loan.type}</h2>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center px-6 py-2 rounded-full text-base font-bold ${getStatusBadge(loan.status)}`}>
                {loan.status}
              </span>
            </div>
            {/* Application Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">APPLICATION NUMBER</p>
                  <p className="font-semibold text-gray-800">{loan.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">APPLICANT NAME</p>
                  <p className="font-semibold text-gray-800">{loan.customer}</p>
                </div>
                {loan.email && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">EMAIL</p>
                    <p className="font-semibold text-gray-800 text-sm">{loan.email}</p>
                  </div>
                )}
                {(loan.phone || loan.mobileNumber) && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">PHONE</p>
                    <p className="font-semibold text-gray-800">{loan.phone || loan.mobileNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">LOAN TYPE</p>
                  <p className="font-semibold text-gray-800">{loan.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">LOAN AMOUNT</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(loan.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">MONTHLY EMI</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(loan.emiAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">INTEREST RATE</p>
                  <p className="font-semibold text-gray-800">{loan.interestRate}% p.a.</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">LOAN TENURE</p>
                  <p className="font-semibold text-gray-800">{loan.tenure} months</p>
                </div>
                {loan.employmentType && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">EMPLOYMENT TYPE</p>
                    <p className="font-semibold text-gray-800">{loan.employmentType}</p>
                  </div>
                )}
                {loan.monthlyIncome && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">MONTHLY INCOME</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(loan.monthlyIncome)}</p>
                  </div>
                )}
                {loan.loanPurpose && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">LOAN PURPOSE</p>
                    <p className="font-semibold text-gray-800">{loan.loanPurpose}</p>
                  </div>
                )}
                {loan.companyName && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">COMPANY NAME</p>
                    <p className="font-semibold text-gray-800">{loan.companyName}</p>
                  </div>
                )}
                {loan.workExperience && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">WORK EXPERIENCE</p>
                    <p className="font-semibold text-gray-800">{loan.workExperience} years</p>
                  </div>
                )}
                {loan.creditScore && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">CREDIT SCORE</p>
                    <p className="font-semibold text-gray-800">{loan.creditScore}</p>
                  </div>
                )}
                {loan.panNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">PAN NUMBER</p>
                    <p className="font-semibold text-gray-800">{loan.panNumber}</p>
                  </div>
                )}
                {loan.aadharNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">AADHAR NUMBER</p>
                    <p className="font-semibold text-gray-800">{loan.aadharNumber}</p>
                  </div>
                )}
                {loan.businessName && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">BUSINESS NAME</p>
                    <p className="font-semibold text-gray-800">{loan.businessName}</p>
                  </div>
                )}
                {loan.businessType && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">BUSINESS TYPE</p>
                    <p className="font-semibold text-gray-800">{loan.businessType}</p>
                  </div>
                )}
                {loan.address && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase mb-1">ADDRESS</p>
                    <p className="font-semibold text-gray-800">{loan.address}</p>
                  </div>
                )}
                {loan.city && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">CITY</p>
                    <p className="font-semibold text-gray-800">{loan.city}</p>
                  </div>
                )}
                {loan.state && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">STATE</p>
                    <p className="font-semibold text-gray-800">{loan.state}</p>
                  </div>
                )}
                {loan.pincode && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">PINCODE</p>
                    <p className="font-semibold text-gray-800">{loan.pincode}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">APPLICATION DATE</p>
                  <p className="font-semibold text-gray-800">{formatDate(loan.applicationDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">STATUS</p>
                  <p className="font-semibold text-gray-800">{loan.status}</p>
                </div>
              </div>
            </div>

            {/* Uploaded Documents Section */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  Uploaded Documents
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Aadhar', field: 'aadharCard', fileName: loan.aadharCardFileName },
                  { label: 'Pan', field: 'panCard', fileName: loan.panCardFileName },
                  { label: 'Photo', field: 'photograph', fileName: loan.photographFileName },
                  { label: 'Income Proof', field: 'incomeProof', fileName: loan.incomeProofFileName },
                  { label: 'Address Proof', field: 'addressProof', fileName: loan.addressProofFileName },
                  { label: 'Bank Statements', field: 'bankStatements', fileName: loan.bankStatementsFileName }
                ].map((doc, index) => {
                  const hasDocument = loan[doc.field];
                  const fileName = doc.fileName || `${loan.id}_${doc.field}.png`;
                  
                  if (!hasDocument) return null;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{doc.label}</p>
                          <p className="text-sm text-gray-500">{fileName}</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            // Download document - force download without opening
                            const documentUrl = loan[doc.field].startsWith('http') 
                              ? loan[doc.field] 
                              : `http://127.0.0.1:8000${loan[doc.field]}`;
                            
                            // Fetch the file as blob
                            const response = await fetch(documentUrl);
                            const blob = await response.blob();
                            
                            // Create blob URL and trigger download
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            // Cleanup blob URL
                            window.URL.revokeObjectURL(blobUrl);
                          } catch (error) {
                            console.error('Download failed:', error);
                            alert('Failed to download document');
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </button>
                    </div>
                  );
                })}
                {![loan.aadharCard, loan.panCard, loan.photograph, loan.incomeProof, loan.addressProof, loan.bankStatements].some(Boolean) && (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {loan.status === 'Active' && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                <h3 className="font-bold text-gray-800 mb-3">Repayment Progress</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">{loan.completedTenure} of {loan.tenure} months completed</span>
                  <span className="text-sm font-bold text-purple-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full bg-gradient-to-r ${loan.color} transition-all duration-500`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>₹{formatCurrency((loan.amount / loan.tenure) * loan.completedTenure)} paid</span>
                  <span>₹{formatCurrency((loan.amount / loan.tenure) * (loan.tenure - loan.completedTenure))} remaining</span>
                </div>
              </div>
            )}

            {loan.status === 'Active' && (
              <button 
                onClick={() => handlePayEMI(loan)}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-6 h-6" />
                Pay EMI - {formatCurrency(loan.emiAmount)}
              </button>
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
          <p className="text-gray-600">Loading your loans...</p>
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
            <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            My Loans
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track all your loans in one place</p>
        </div>
        <button 
          onClick={() => setShowLoanTypeModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Apply for New Loan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-blue-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Loans</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{loanStats.total}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-blue-100 rounded-lg sm:rounded-xl">
              <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-green-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Active Loans</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{loanStats.active}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-green-100 rounded-lg sm:rounded-xl">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
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
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white cursor-pointer"
          >
            <option value="all">All Services</option>
            <option value="short-term">Short-Term Loan</option>
            <option value="personal">Personal Loan</option>
            <option value="home">Home Loan</option>
            <option value="business">Business Loan</option>
          </select>
        </div>
      </div>

      {/* Loans Table/List */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          <div className="divide-y divide-gray-200">
            {currentLoans.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                <IndianRupee className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">No Loans Found</h3>
                <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              currentLoans.map((loan) => {
                const LoanIcon = loan.icon;
                const progressPercentage = ((loan.completedTenure / loan.tenure) * 100).toFixed(1);

                return (
                  <div key={loan.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${loan.color}`}>
                            <LoanIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{loan.type}</p>
                            <p className="text-xs text-gray-500">Rate: {loan.interestRate}%</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>

                      {/* Amounts */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-bold text-gray-700">{formatCurrency(loan.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Outstanding</p>
                          <p className="font-bold text-orange-600">{formatCurrency(loan.outstandingAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">EMI</p>
                          <p className="font-bold text-green-600">{formatCurrency(loan.emiAmount)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-bold text-green-600">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-green-600 to-green-400"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Next EMI: {loan.nextEmiDate ? formatDate(loan.nextEmiDate) : 'N/A'}
                        </p>
                        <button
                          onClick={() => handleViewDetails(loan)}
                          className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile Pagination */}
          {filteredLoans.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLoans.length)} of {filteredLoans.length} loans
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 text-xs sm:text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div className="bg-green-50 px-4 py-3 border-b border-green-100 min-w-[1200px]">
            <div className="grid grid-cols-[220px_180px_140px_130px_140px_120px_100px] gap-6 font-semibold text-gray-700 text-sm">
              <div>LOAN ID</div>
              <div>CUSTOMER</div>
              <div>TYPE</div>
              <div>AMOUNT</div>
              <div>APPLIED DATE</div>
              <div>STATUS</div>
              <div className="text-center">ACTIONS</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 min-w-[1200px]">
            {currentLoans.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <IndianRupee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Loans Found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              currentLoans.map((loan) => {
                const LoanIcon = loan.icon;

                return (
                  <div key={loan.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-[220px_180px_140px_130px_140px_120px_100px] gap-6 items-center text-sm">
                      {/* Loan ID */}
                      <div className="overflow-hidden">
                        <span className="font-mono text-gray-600 text-xs block" title={loan.id}>{loan.id}</span>
                      </div>

                      {/* Customer */}
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-800 truncate" title={loan.customer}>{loan.customer}</p>
                      </div>

                      {/* Type */}
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-800 truncate">{loan.type}</p>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="font-bold text-gray-800">{formatCurrency(loan.amount)}</p>
                      </div>

                      {/* Applied Date */}
                      <div>
                        <p className="text-gray-700 text-xs">{formatDate(loan.applicationDate)}</p>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleViewDetails(loan)}
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
          {filteredLoans.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLoans.length)} of {filteredLoans.length} loans
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
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
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

      {/* Loan Details Modal */}
      {showModal && selectedLoan && (
        <LoanDetailsModal loan={selectedLoan} onClose={() => setShowModal(false)} />
      )}

      {/* Loan Type Selection Modal */}
      {showLoanTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <button
              onClick={() => setShowLoanTypeModal(false)}
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
                { name: 'Short-Term Loan', icon: Clock, route: '/short-term-loan', color: 'from-orange-500 to-orange-600', desc: 'Quick cash loans' },
              ].map((loan, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedLoanType(loan.name);
                    setShowLoanTypeModal(false);
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

export default LoanManagement;
