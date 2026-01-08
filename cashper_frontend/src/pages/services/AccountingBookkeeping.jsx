import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalculator, FaChartLine, FaFileInvoice, FaDatabase, FaCheckCircle, FaClock, FaUsers, FaLaptop, FaMoneyBillWave, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaBuilding } from 'react-icons/fa';
import { CheckCircle, FileText, X, Phone, Mail, Upload, AlertCircle, User, IdCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitAccountingBookkeeping } from '../../services/businessServicesApi';

const AccountingBookkeeping = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', panNumber: '',
    businessName: '', businessType: '', serviceRequired: '', numberOfTransactions: '',
    address: '', city: '', state: '', pincode: '',
    bankStatements: null, invoices: null, receipts: null, previousReturns: null, panCard: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    const savedFormData = sessionStorage.getItem('accounting_bookkeeping_form_data');
    const savedStep = sessionStorage.getItem('accounting_bookkeeping_pending_step');
    
    if (savedFormData && token) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setApplicationForm(parsedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        sessionStorage.removeItem('accounting_bookkeeping_form_data');
        sessionStorage.removeItem('accounting_bookkeeping_pending_step');
        toast.success('Welcome back! Continue with your application', {
          position: 'top-center',
          autoClose: 2000
        });
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  const handleContactNavigation = () => {
    navigate('/contactus');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleContactClick = () => {
    setShowContactPopup(true);
  };

  // Hero form state
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  const handleHeroFormChange = (e) => {
    setHeroFormData({ ...heroFormData, [e.target.name]: e.target.value });
  };

  const handleHeroFormSubmit = async (e) => {
    e.preventDefault();
    if (!heroFormData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!heroFormData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(heroFormData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!heroFormData.phone.trim() || !/^[0-9]{10}$/.test(heroFormData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmittingHero(true);
    try {
      const response = await fetch('http://localhost:8000/api/corporate-inquiry/accounting-bookkeeping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: heroFormData.name,
          email: heroFormData.email,
          phone: heroFormData.phone,
          companyName: '',
          message: heroFormData.message || ''
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Thank you! Our team will contact you soon.');
        setHeroFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(data.detail || 'Failed to submit inquiry.');
      }
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmittingHero(false);
    }
  };

  // Application Form Validation
  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(value)) error = 'Phone must be 10 digits';
        break;
      case 'panNumber':
        if (!value.trim()) error = 'PAN number is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format';
        break;
      case 'businessName':
        if (!value.trim()) error = 'Business name is required';
        break;
      case 'businessType':
        if (!value) error = 'Business type is required';
        break;
      case 'serviceRequired':
        if (!value) error = 'Service required is required';
        break;
      case 'numberOfTransactions':
        if (!value) error = 'Number of transactions is required';
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        else if (value.trim().length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
      case 'state':
        if (!value.trim()) error = 'State is required';
        break;
      case 'pincode':
        if (!value.trim()) error = 'Pincode is required';
        else if (!/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits';
        break;
      default: break;
    }
    return error;
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) {
      ['fullName', 'email', 'phone', 'panNumber'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 2) {
      ['businessName', 'businessType', 'serviceRequired', 'numberOfTransactions'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    }
    return stepErrors;
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, applicationForm[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (file && !allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    setApplicationForm(prev => ({ ...prev, [name]: file }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('accounting_bookkeeping_pending_step', '2');
      sessionStorage.setItem('accounting_bookkeeping_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your accounting & bookkeeping application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login?redirect=/services/accounting-bookkeeping&step=2', {
        state: { from: '/services/accounting-bookkeeping', returnStep: 2 }
      });
      return;
    }

    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix all errors before proceeding');
      return;
    }
    setCurrentStep(prev => prev + 1);
    
    const formSection = document.getElementById('application-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    
    const formSection = document.getElementById('application-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if not on step 4
    if (currentStep < 4) {
      console.log('Form submission prevented - not on step 4');
      return;
    }
    
    if (!isAuthenticated) {
      sessionStorage.setItem('accounting_bookkeeping_pending_step', '4');
      sessionStorage.setItem('accounting_bookkeeping_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/accounting-bookkeeping&step=4', {
        state: { from: '/services/accounting-bookkeeping', returnStep: 4 }
      });
      return;
    }

    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix all errors before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      // Call API to submit accounting & bookkeeping application
      const response = await submitAccountingBookkeeping(applicationForm);
      
      if (response.success) {
        setShowSuccessModal(true);
        toast.success('Accounting & bookkeeping application submitted successfully!');
        setApplicationForm({
          fullName: '', email: '', phone: '', panNumber: '',
          businessName: '', businessType: '', serviceRequired: '', numberOfTransactions: '',
          address: '', city: '', state: '', pincode: '',
          bankStatements: null, invoices: null, receipts: null, previousReturns: null, panCard: null
        });
        setCurrentStep(1);
        setErrors({});
        setTouched({});
      } else {
        if (response.fieldErrors && Object.keys(response.fieldErrors).length > 0) {
          setErrors(response.fieldErrors);
          toast.error('Please fix validation errors and try again');
        } else {
          toast.error(response.error || 'Failed to submit application. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: FaCalculator, title: "Daily Bookkeeping", desc: "Accurate transaction recording" },
    { icon: FaFileInvoice, title: "Financial Statements", desc: "P&L, Balance Sheet, Cash Flow" },
    { icon: FaChartLine, title: "MIS Reports", desc: "Business insights & analysis" },
    { icon: FaDatabase, title: "Cloud-Based", desc: "Anytime, anywhere access" },
  ];

  const features = benefits; // Alias for compatibility

  const services = [
    { icon: FaMoneyBillWave, title: "Accounts Payable/Receivable", color: "green" },
    { icon: FaCalculator, title: "Bank Reconciliation", color: "blue" },
    { icon: FaFileInvoice, title: "Inventory Management", color: "green" },
    { icon: FaChartLine, title: "Tax Support", color: "blue" },
  ];

  const software = ["Tally Prime", "QuickBooks", "Zoho Books", "SAP", "MS Excel", "Busy Accounting"];

  // If in popup mode, only render the application form section
  if (isPopupMode) {
    return (
      <>
        <section id="application-form-section" className="py-4 sm:py-6 bg-gradient-to-br from-white via-green-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                  Accounting & Bookkeeping Application
                </h2>
                <p className="text-green-50 text-center mt-2">Complete the form to get professional accounting services</p>
              </div>

              <div className="px-6 sm:px-8 py-8">
                {/* Step Indicators */}
                <div className="flex justify-between items-center mb-8">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        currentStep === step ? 'bg-green-600 text-white' :
                        currentStep > step ? 'bg-green-200 text-green-700' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step}
                      </div>
                      {step < 4 && <div className={`h-1 w-full ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>

                {/* Form content rendered here */}
                <form onSubmit={handleApplicationSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaUser className="mr-2 text-green-600" /> Full Name *</label><input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter your full name" />{errors.fullName && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.fullName}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaEnvelope className="mr-2 text-green-600" /> Email Address *</label><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="your.email@example.com" />{errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.email}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaPhone className="mr-2 text-green-600" /> Phone Number *</label><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit mobile number" />{errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.phone}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaIdCard className="mr-2 text-green-600" /> PAN Number *</label><input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="ABCDE1234F" maxLength={10} />{errors.panNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.panNumber}</p>}</div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Business Details</h3>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaBuilding className="mr-2 text-green-600" /> Business Name *</label><input type="text" name="businessName" value={applicationForm.businessName} onChange={handleApplicationChange} onBlur={() => handleBlur('businessName')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.businessName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter business name" />{errors.businessName && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.businessName}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><IdCard className="mr-2 text-green-600" /> Business Type *</label><select name="businessType" value={applicationForm.businessType} onChange={handleApplicationChange} onBlur={() => handleBlur('businessType')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.businessType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Business Type</option><option value="Sole Proprietorship">Sole Proprietorship</option><option value="Partnership">Partnership</option><option value="Private Limited">Private Limited</option><option value="Public Limited">Public Limited</option><option value="LLP">LLP</option><option value="OPC">One Person Company (OPC)</option></select>{errors.businessType && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.businessType}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaCalculator className="mr-2 text-green-600" /> Service Required *</label><select name="serviceRequired" value={applicationForm.serviceRequired} onChange={handleApplicationChange} onBlur={() => handleBlur('serviceRequired')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.serviceRequired ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Service</option><option value="Basic Bookkeeping">Basic Bookkeeping</option><option value="Financial Statements">Financial Statements</option><option value="Tax Preparation">Tax Preparation</option><option value="Payroll Services">Payroll Services</option><option value="Full Accounting">Full Accounting</option><option value="CFO Services">CFO Services</option></select>{errors.serviceRequired && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.serviceRequired}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaCalculator className="mr-2 text-green-600" /> Number of Transactions (Monthly) *</label><input type="text" name="numberOfTransactions" value={applicationForm.numberOfTransactions} onChange={handleApplicationChange} onBlur={() => handleBlur('numberOfTransactions')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.numberOfTransactions ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Approximate monthly transaction count" />{errors.numberOfTransactions && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.numberOfTransactions}</p>}</div>
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Address Information</h3>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaHome className="mr-2 text-green-600" /> Complete Address *</label><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows={3} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter complete address" />{errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.address}</p>}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaMapMarkerAlt className="mr-2 text-green-600" /> City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter city" />{errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.city}</p>}</div><div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaMapMarkerAlt className="mr-2 text-green-600" /> State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter state" />{errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.state}</p>}</div></div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><FaMapMarkerAlt className="mr-2 text-green-600" /> Pincode *</label><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="6-digit pincode" maxLength={6} />{errors.pincode && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.pincode}</p>}</div>
                    </div>
                  )}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Documents</h3>
                      <p className="text-sm text-gray-600 mb-4">All documents must be in JPG, PNG, or PDF format (max 5MB each)</p>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><Upload className="mr-2 text-green-600" /> Bank Statements *</label><input type="file" name="bankStatements" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" />{errors.bankStatements && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.bankStatements}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><Upload className="mr-2 text-green-600" /> Invoices *</label><input type="file" name="invoices" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" />{errors.invoices && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.invoices}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><Upload className="mr-2 text-green-600" /> Receipts *</label><input type="file" name="receipts" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" />{errors.receipts && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.receipts}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><Upload className="mr-2 text-green-600" /> Previous Tax Returns (Optional)</label><input type="file" name="previousReturns" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" />{errors.previousReturns && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.previousReturns}</p>}</div>
                      <div><label className="flex items-center text-sm font-semibold text-gray-700 mb-2"><Upload className="mr-2 text-green-600" /> PAN Card *</label><input type="file" name="panCard" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" />{errors.panCard && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.panCard}</p>}</div>
                    </div>
                  )}
                  <div className="flex justify-between mt-8 pt-6 border-t">{currentStep > 1 && (<button type="button" onClick={prevStep} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold">← Previous</button>)}{currentStep < 4 ? (<button type="button" onClick={nextStep} className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold">Next →</button>) : (<button type="submit" disabled={isSubmitting} className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>)}</div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your accounting service application has been received. Our accountant will contact you within 1-2 business days.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full page mode - render complete page
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'scroll',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-700/60 to-green-900/50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center">
            <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                Accounting & <span className="text-yellow-300">Bookkeeping Services</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                Comprehensive accounting services for businesses of all sizes. Expert bookkeeping, financial statements, and MIS reports tailored to your business needs.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => {
                    const element = document.getElementById('application-form-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-4xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  Apply Now →
                </button>
              </div>
            </div>
            
            {/* Contact Form - Right Side */}
            <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 md:p-5 mt-6 md:mt-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                GET IN TOUCH
              </h3>
              <form onSubmit={handleHeroFormSubmit} className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={heroFormData.name}
                  onChange={handleHeroFormChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={heroFormData.email}
                  onChange={handleHeroFormChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile Number"
                  value={heroFormData.phone}
                  onChange={handleHeroFormChange}
                  maxLength="10"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                />
                <textarea
                  name="message"
                  placeholder="Type your message here..."
                  value={heroFormData.message}
                  onChange={handleHeroFormChange}
                  rows="4"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm resize-none"
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={isSubmittingHero}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingHero ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <div className="py-8 md:py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-2 border border-green-100">
                <feature.icon className="text-3xl md:text-4xl text-green-600 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="services" className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Services Grid */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-center text-gray-800">
            Our Comprehensive Services
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            {services.map((service, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${service.color === 'green' ? 'from-green-50 to-teal-50' : 'from-blue-50 to-green-50'} p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2`}>
                <service.icon className="text-4xl text-green-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
              </div>
            ))}
          </div>

          {/* Software Section */}
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-center">Accounting Software We Use</h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-6 gap-4">
              {software.map((sw, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center hover:bg-white/20 transition-all">
                  <p className="font-bold text-sm md:text-base">{sw}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">Why Outsource Accounting?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                { icon: FaMoneyBillWave, title: "Cost-Effective", desc: "Lower than full-time accountant" },
                { icon: FaUsers, title: "Expertise", desc: "Qualified professionals" },
                { icon: FaCheckCircle, title: "Accuracy", desc: "Error-free bookkeeping" },
                { icon: FaLaptop, title: "Real-Time Access", desc: "Cloud-based solutions" },
                { icon: FaChartLine, title: "Scalability", desc: "Grow with your business" },
                { icon: FaClock, title: "Focus", desc: "More time for core activities" }
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="bg-green-600 text-white p-3 rounded-lg">
                    <benefit.icon className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What is Accounting Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
              What is Accounting & Bookkeeping?
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
              Accounting and bookkeeping are essential functions that track and record all financial transactions of your business. While bookkeeping involves daily recording of transactions, accounting encompasses broader financial analysis, reporting, and strategic planning.
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Our professional accounting services ensure accurate financial records, timely reporting, tax compliance, and strategic insights to help you make informed business decisions. From daily bookkeeping to comprehensive financial statements, we handle all your accounting needs.
            </p>
          </div>

          {/* Documents Required Section */}
          <section className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                  <FileText className="w-5 h-5 text-green-700" />
                  <span className="text-green-700 font-semibold">Documents Required</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Documents Needed for Accounting Services
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Keep these documents ready for seamless accounting and bookkeeping
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-600 text-white p-3 rounded-xl">
                      <FaFileInvoice className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Sales Documents</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        All transaction records and invoices
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Sales invoices
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Purchase bills
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Payment receipts
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-600 text-white p-3 rounded-xl">
                      <FaDatabase className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Bank Statements</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Complete banking transaction records
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          All bank accounts
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Credit card statements
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Loan documents
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-600 text-white p-3 rounded-xl">
                      <FaCalculator className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Expense Records</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        All business expenditure documentation
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Utility bills
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Salary registers
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          Vendor invoices
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Application Form Section */}
          <section id="application-form-section" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-green-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                    Accounting & Bookkeeping Application
                  </h2>
                  <p className="text-green-50 text-center mt-2">Complete the form to get professional accounting services</p>
                </div>

                <div className="px-6 sm:px-8 py-8">
                  {/* Step Indicators */}
                  <div className="flex justify-between items-center mb-8">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          currentStep === step ? 'bg-green-600 text-white' :
                          currentStep > step ? 'bg-green-200 text-green-700' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {step}
                        </div>
                        {step < 4 && <div className={`h-1 w-full ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />}
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                      
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaUser className="mr-2 text-green-600" /> Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={applicationForm.fullName}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('fullName')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.fullName ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaEnvelope className="mr-2 text-green-600" /> Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={applicationForm.email}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('email')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.email ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaPhone className="mr-2 text-green-600" /> Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={applicationForm.phone}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('phone')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.phone ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="10-digit mobile number"
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaIdCard className="mr-2 text-green-600" /> PAN Number *
                        </label>
                        <input
                          type="text"
                          name="panNumber"
                          value={applicationForm.panNumber}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('panNumber')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors uppercase ${
                            errors.panNumber ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                        {errors.panNumber && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.panNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Business Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Business Details</h3>
                      
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaBuilding className="mr-2 text-green-600" /> Business Name *
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={applicationForm.businessName}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('businessName')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.businessName ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter business name"
                        />
                        {errors.businessName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.businessName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <IdCard className="mr-2 text-green-600" /> Business Type *
                        </label>
                        <select
                          name="businessType"
                          value={applicationForm.businessType}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('businessType')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.businessType ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select Business Type</option>
                          <option value="Sole Proprietorship">Sole Proprietorship</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Private Limited">Private Limited</option>
                          <option value="Public Limited">Public Limited</option>
                          <option value="LLP">LLP</option>
                          <option value="OPC">One Person Company (OPC)</option>
                        </select>
                        {errors.businessType && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.businessType}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaCalculator className="mr-2 text-green-600" /> Service Required *
                        </label>
                        <select
                          name="serviceRequired"
                          value={applicationForm.serviceRequired}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('serviceRequired')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.serviceRequired ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select Service</option>
                          <option value="Basic Bookkeeping">Basic Bookkeeping</option>
                          <option value="Financial Statements">Financial Statements</option>
                          <option value="Tax Preparation">Tax Preparation</option>
                          <option value="Payroll Services">Payroll Services</option>
                          <option value="Full Accounting">Full Accounting</option>
                          <option value="CFO Services">CFO Services</option>
                        </select>
                        {errors.serviceRequired && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.serviceRequired}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaCalculator className="mr-2 text-green-600" /> Number of Transactions (Monthly) *
                        </label>
                        <input
                          type="text"
                          name="numberOfTransactions"
                          value={applicationForm.numberOfTransactions}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('numberOfTransactions')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.numberOfTransactions ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Approximate monthly transaction count"
                        />
                        {errors.numberOfTransactions && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.numberOfTransactions}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Address Information */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Address Information</h3>
                      
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaHome className="mr-2 text-green-600" /> Complete Address *
                        </label>
                        <textarea
                          name="address"
                          value={applicationForm.address}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('address')}
                          rows={3}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.address ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter complete address"
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                            <FaMapMarkerAlt className="mr-2 text-green-600" /> City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={applicationForm.city}
                            onChange={handleApplicationChange}
                            onBlur={() => handleBlur('city')}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.city ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Enter city"
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" /> {errors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                            <FaMapMarkerAlt className="mr-2 text-green-600" /> State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={applicationForm.state}
                            onChange={handleApplicationChange}
                            onBlur={() => handleBlur('state')}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.state ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Enter state"
                          />
                          {errors.state && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" /> {errors.state}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaMapMarkerAlt className="mr-2 text-green-600" /> Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={applicationForm.pincode}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('pincode')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.pincode ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="6-digit pincode"
                          maxLength={6}
                        />
                        {errors.pincode && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Document Upload */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Documents</h3>
                      <p className="text-sm text-gray-600 mb-4">All documents must be in JPG, PNG, or PDF format (max 5MB each)</p>
                      
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> Bank Statements *
                        </label>
                        <input
                          type="file"
                          name="bankStatements"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.bankStatements && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.bankStatements}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> Invoices *
                        </label>
                        <input
                          type="file"
                          name="invoices"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.invoices && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.invoices}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> Receipts *
                        </label>
                        <input
                          type="file"
                          name="receipts"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.receipts && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.receipts}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> Previous Returns
                        </label>
                        <input
                          type="file"
                          name="previousReturns"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.previousReturns && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.previousReturns}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> PAN Card *
                        </label>
                        <input
                          type="file"
                          name="panCard"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.panCard && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.panCard}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                      >
                        ← Previous
                      </button>
                    )}
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplicationSubmit}
                        disabled={isSubmitting}
                        className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-6">
                  Your accounting service application has been received. Our accountant will contact you within 1-2 business days.
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gray-800">Ready to Streamline Your Accounting?</h2>
            <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Let us handle your books while you focus on growing your business. Professional, accurate, and cost-effective.
            </p>
            <button
              onClick={handleContactClick}
              className="inline-block bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all text-base md:text-lg font-bold shadow-lg transform hover:scale-105"
            >
              Contact Us Now →
            </button>
          </div>
        </div>
      </div>

      {/* Contact Popup */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowContactPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
              <button 
                onClick={() => setShowContactPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                <div className="bg-green-600 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Phone Numbers</p>
                  <a href="tel:6200755759" className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors block">6200755759</a>
                  <a href="tel:7393080847" className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors block">7393080847</a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                <div className="bg-green-600 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <a href="mailto:info@cashper.ai" className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors break-all">info@cashper.ai</a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContactPopup(false)}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AccountingBookkeeping;
