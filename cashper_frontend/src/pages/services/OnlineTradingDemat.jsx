import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChartLine, FaMobileAlt, FaShieldAlt, FaBolt, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaCheckCircle } from 'react-icons/fa';
import { Upload, X, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitTradingDematApplication } from '../../services/retailServicesApi';

const OnlineTradingDemat = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    const pendingStep = sessionStorage.getItem('trading_demat_pending_step');
    const savedFormData = sessionStorage.getItem('trading_demat_form_data');
    if (token && pendingStep && savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        const step = parseInt(pendingStep);
        setApplicationForm(formData);
        setCurrentStep(step);
        setTimeout(() => { toast.success('Welcome back! Continuing your trading account application...', { position: 'top-center', autoClose: 2000 }); }, 100);
        sessionStorage.removeItem('trading_demat_pending_step');
        sessionStorage.removeItem('trading_demat_form_data');
      } catch (error) {
        console.error('Error restoring form data:', error);
        toast.error('Failed to restore your form. Please start again.');
        sessionStorage.removeItem('trading_demat_pending_step');
        sessionStorage.removeItem('trading_demat_form_data');
      }
    }
  }, []);

  // Hero form state
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  // Multi-step Application Form State
  const [applicationForm, setApplicationForm] = useState({
    // Step 1 - Personal Info
    fullName: '',
    email: '',
    phone: '',
    panNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    
    // Step 2 - Account Details
    accountType: '',
    tradingSegments: [],
    annualIncome: '',
    occupationType: '',
    experienceLevel: '',
    
    // Step 3 - Address & Bank Details
    address: '',
    city: '',
    state: '',
    pincode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Step 4 - Documents
    panCard: null,
    aadhaarCard: null,
    photo: null,
    signature: null,
    bankProof: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch('http://127.0.0.1:8000/api/applications/online-trading-demat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heroFormData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Thank you! Your inquiry (${data.inquiryId}) has been submitted. Our trading expert will contact you soon.`);
        setHeroFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmittingHero(false);
    }
  };

  // Application Form Handlers
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'fullName':
        if (!value || value.trim().length < 3) error = 'Full name must be at least 3 characters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) error = 'Phone must be 10 digits';
        break;
      case 'panNumber':
        if (!value) error = 'PAN is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format (e.g., ABCDE1234F)';
        break;
      case 'aadhaarNumber':
        if (!value) error = 'Aadhaar is required';
        else if (!/^[0-9]{12}$/.test(value.replace(/\s/g, ''))) error = 'Aadhaar must be 12 digits';
        break;
      case 'dateOfBirth':
        if (!value) error = 'Date of birth is required';
        break;
      case 'accountType':
        if (!value) error = 'Account type is required';
        break;
      case 'annualIncome':
        if (!value) error = 'Annual income is required';
        break;
      case 'occupationType':
        if (!value) error = 'Occupation is required';
        break;
      case 'experienceLevel':
        if (!value) error = 'Experience level is required';
        break;
      case 'address':
        if (!value || value.trim().length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'city':
        if (!value || value.trim().length < 2) error = 'City is required';
        break;
      case 'state':
        if (!value) error = 'State is required';
        break;
      case 'pincode':
        if (!value) error = 'Pincode is required';
        else if (!/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits';
        break;
      case 'bankName':
        if (!value) error = 'Bank name is required';
        break;
      case 'accountNumber':
        if (!value) error = 'Account number is required';
        else if (!/^[0-9]{9,18}$/.test(value)) error = 'Invalid account number';
        break;
      case 'ifscCode':
        if (!value) error = 'IFSC code is required';
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) error = 'Invalid IFSC code format';
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleApplicationChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'tradingSegments') {
      const updatedSegments = checked
        ? [...applicationForm.tradingSegments, value]
        : applicationForm.tradingSegments.filter(seg => seg !== value);
      
      setApplicationForm(prev => ({
        ...prev,
        tradingSegments: updatedSegments
      }));
    } else {
      const fieldValue = type === 'checkbox' ? checked : value;
      
      setApplicationForm(prev => ({
        ...prev,
        [name]: fieldValue
      }));

      if (touched[name]) {
        const error = validateField(name, fieldValue);
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    const error = validateField(fieldName, applicationForm[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      
      setApplicationForm(prev => ({
        ...prev,
        [name]: file
      }));
      
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    
    if (step === 1) {
      ['fullName', 'email', 'phone', 'panNumber', 'aadhaarNumber', 'dateOfBirth'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 2) {
      ['accountType', 'annualIncome', 'occupationType', 'experienceLevel'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
      if (applicationForm.tradingSegments.length === 0) {
        stepErrors.tradingSegments = 'Please select at least one trading segment';
      }
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode', 'bankName', 'accountNumber', 'ifscCode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    }
    
    return stepErrors;
  };

  const nextStep = () => {
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('trading_demat_pending_step', '2');
      sessionStorage.setItem('trading_demat_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your trading account application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate(`/login?redirect=/services/online-trading-demat&step=2`, { 
        state: { from: '/services/online-trading-demat', returnStep: 2 } 
      });
      return;
    }
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      Object.keys(stepErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
      toast.error('Please fix all errors before proceeding');
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      sessionStorage.setItem('trading_demat_pending_step', '4');
      sessionStorage.setItem('trading_demat_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/online-trading-demat&step=4', { 
        state: { from: '/services/online-trading-demat', returnStep: 4 } 
      });
      return;
    }
    
    // Validate all required documents
    const requiredDocs = ['panCard', 'aadhaarCard', 'photo', 'signature', 'bankProof'];
    const missingDocs = requiredDocs.filter(doc => !applicationForm[doc]);
    
    if (missingDocs.length > 0) {
      toast.error('Please upload all required documents');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitTradingDematApplication(applicationForm);
      
      toast.success('Trading & Demat Application submitted successfully!', {
        position: "top-center",
        autoClose: 3000
      });
      
      // Reset form
      setApplicationForm({
        fullName: '',
        email: '',
        phone: '',
        panNumber: '',
        aadhaarNumber: '',
        dateOfBirth: '',
        accountType: '',
        tradingSegments: [],
        annualIncome: '',
        occupationType: '',
        experienceLevel: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        panCard: null,
        aadhaarCard: null,
        photo: null,
        signature: null,
        bankProof: null,
      });
      setErrors({});
      setTouched({});
      setCurrentStep(1);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: FaChartLine, title: "Zero Opening Fees", desc: "No account opening or AMC charges" },
    { icon: FaMobileAlt, title: "Mobile Trading", desc: "Trade on-the-go with mobile app" },
    { icon: FaShieldAlt, title: "Secure Platform", desc: "Bank-grade security for transactions" },
    { icon: FaBolt, title: "Instant Activation", desc: "Account activated within 24 hours" },
  ];

  const benefits = [
    "Trade in Equity, F&O, Currency, and Commodity segments",
    "Zero brokerage on equity delivery trades",
    "Advanced charting tools and market insights",
    "Instant fund transfer and withdrawal",
    "Dedicated relationship manager support",
    "Access to IPOs and Mutual Funds"
  ];

  const process = [
    { step: "1", title: "Fill Application", desc: "Complete online application with KYC details" },
    { step: "2", title: "Upload Documents", desc: "Submit PAN, Aadhaar, photo, and bank proof" },
    { step: "3", title: "E-Verification", desc: "Quick verification through Aadhaar OTP" },
    { step: "4", title: "Start Trading", desc: "Get login credentials and start trading" }
  ];

  return (
    <>
      {!isPopupMode && <Navbar />}
      <div className="w-full overflow-x-hidden bg-white">
        
        {/* Hero Section */}
        {!isPopupMode && <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80')",
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
                  Open Trading & Demat Account
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                  Start your investment journey with zero account opening charges. Trade in stocks, F&O, currency, and commodities with advanced tools and instant activation within 24 hours.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      const element = document.getElementById('apply-form');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  >
                    Open Account Now →
                  </button>
                </div>
              </div>
              
              {/* Contact Form - Right Side */}
              <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 md:p-5 mt-6 md:mt-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                  QUICK INQUIRY
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
                    placeholder="Phone Number"
                    value={heroFormData.phone}
                    onChange={handleHeroFormChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <textarea
                    name="message"
                    placeholder="Message (Optional)"
                    value={heroFormData.message}
                    onChange={handleHeroFormChange}
                    rows="2"
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingHero}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {isSubmittingHero ? 'Submitting...' : 'Get Callback'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>}
        {/* Features Section */}
        {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10">
              Why Choose Our Trading Platform?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <Icon className="text-green-600 text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>}

        {/* Benefits Section */}
        {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10">
              Platform Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-gray-700 text-xs sm:text-sm md:text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>}
        {/* Process Section */}
        {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gradient-to-br from-green-50 to-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10">
              Account Opening Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {process.map((item, index) => (
                <div key={index} className="relative bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 mt-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {/* Application Form Section */}
        <section id="apply-form" className="py-8 sm:py-10 md:py-12 lg:py-16 bg-white scroll-mt-20">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Open Your Trading & Demat Account
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                Complete the form below to get started with online trading
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex-1 flex flex-col items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                      currentStep >= step
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    <div className="text-xs sm:text-sm mt-1 sm:mt-2 text-center font-medium">
                      {step === 1 && 'Personal'}
                      {step === 2 && 'Account'}
                      {step === 3 && 'Bank & Address'}
                      {step === 4 && 'Documents'}
                    </div>
                    {step < 4 && (
                      <div className={`hidden sm:block absolute h-1 w-full top-5 left-1/2 -z-10 ${
                        currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                      }`} style={{ width: 'calc(100% - 2.5rem)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleApplicationSubmit} className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8">
              
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4 sm:space-y-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      <FaUser className="inline mr-1.5 sm:mr-2 text-green-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={applicationForm.fullName}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('fullName')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                        errors.fullName 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-600'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        <FaEnvelope className="inline mr-1.5 sm:mr-2 text-green-600" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={applicationForm.email}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('email')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.email 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        <FaPhone className="inline mr-1.5 sm:mr-2 text-green-600" />
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={applicationForm.phone}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('phone')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.phone 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                        placeholder="10-digit mobile number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        <FaIdCard className="inline mr-1.5 sm:mr-2 text-green-600" />
                        PAN Number *
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={applicationForm.panNumber}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('panNumber')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm uppercase ${
                          errors.panNumber 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                        placeholder="ABCDE1234F"
                        maxLength="10"
                      />
                      {errors.panNumber && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.panNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        <FaIdCard className="inline mr-1.5 sm:mr-2 text-green-600" />
                        Aadhaar Number *
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={applicationForm.aadhaarNumber}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('aadhaarNumber')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.aadhaarNumber 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                        placeholder="12-digit Aadhaar"
                        maxLength="12"
                      />
                      {errors.aadhaarNumber && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.aadhaarNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={applicationForm.dateOfBirth}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('dateOfBirth')}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                        errors.dateOfBirth 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-600'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Account Details */}
              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Account Details</h3>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Account Type *
                    </label>
                    <select
                      name="accountType"
                      value={applicationForm.accountType}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('accountType')}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                        errors.accountType 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-600'
                      }`}
                    >
                      <option value="">Select account type</option>
                      <option value="individual">Individual</option>
                      <option value="joint">Joint Account</option>
                      <option value="minor">Minor Account</option>
                    </select>
                    {errors.accountType && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {errors.accountType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Trading Segments * (Select at least one)
                    </label>
                    <div className="space-y-2">
                      {['Equity', 'Futures & Options', 'Currency', 'Commodity'].map((segment) => (
                        <label key={segment} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="tradingSegments"
                            value={segment}
                            checked={applicationForm.tradingSegments.includes(segment)}
                            onChange={handleApplicationChange}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">{segment}</span>
                        </label>
                      ))}
                    </div>
                    {errors.tradingSegments && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {errors.tradingSegments}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Annual Income *
                      </label>
                      <select
                        name="annualIncome"
                        value={applicationForm.annualIncome}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('annualIncome')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.annualIncome 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                      >
                        <option value="">Select income range</option>
                        <option value="below-1L">Below ₹1 Lakh</option>
                        <option value="1L-5L">₹1-5 Lakhs</option>
                        <option value="5L-10L">₹5-10 Lakhs</option>
                        <option value="10L-25L">₹10-25 Lakhs</option>
                        <option value="above-25L">Above ₹25 Lakhs</option>
                      </select>
                      {errors.annualIncome && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.annualIncome}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Occupation *
                      </label>
                      <select
                        name="occupationType"
                        value={applicationForm.occupationType}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('occupationType')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.occupationType 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                      >
                        <option value="">Select occupation</option>
                        <option value="salaried">Salaried</option>
                        <option value="self-employed">Self Employed</option>
                        <option value="business">Business</option>
                        <option value="student">Student</option>
                        <option value="homemaker">Homemaker</option>
                        <option value="retired">Retired</option>
                      </select>
                      {errors.occupationType && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.occupationType}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Trading Experience *
                    </label>
                    <select
                      name="experienceLevel"
                      value={applicationForm.experienceLevel}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('experienceLevel')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                        errors.experienceLevel 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-600'
                      }`}
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner (No experience)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="experienced">Experienced (3+ years)</option>
                    </select>
                    {errors.experienceLevel && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {errors.experienceLevel}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Bank & Address Details */}
              {currentStep === 3 && (
                <div className="space-y-4 sm:space-y-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Bank & Address Details</h3>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      <FaHome className="inline mr-1.5 sm:mr-2 text-green-600" />
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={applicationForm.address}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('address')}
                      rows="2"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm resize-none ${
                        errors.address 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-600'
                      }`}
                      placeholder="Enter full address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        <FaMapMarkerAlt className="inline mr-1.5 sm:mr-2 text-green-600" />
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={applicationForm.city}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('city')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.city 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={applicationForm.state}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('state')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.state 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={applicationForm.pincode}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('pincode')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.pincode 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-600'
                        }`}
                        placeholder="6-digit pincode"
                        maxLength="6"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Bank Details</h4>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={applicationForm.bankName}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('bankName')}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                          errors.bankName 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-pink-500'
                        }`}
                        placeholder="Enter bank name"
                      />
                      {errors.bankName && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.bankName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={applicationForm.accountNumber}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('accountNumber')}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm ${
                            errors.accountNumber 
                              ? 'border-red-500 focus:border-red-600' 
                              : 'border-gray-200 focus:border-pink-500'
                          }`}
                          placeholder="Bank account number"
                        />
                        {errors.accountNumber && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.accountNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          IFSC Code *
                        </label>
                        <input
                          type="text"
                          name="ifscCode"
                          value={applicationForm.ifscCode}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('ifscCode')}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg outline-none transition-all text-xs sm:text-sm uppercase ${
                            errors.ifscCode 
                              ? 'border-red-500 focus:border-red-600' 
                              : 'border-gray-200 focus:border-pink-500'
                          }`}
                          placeholder="IFSC code"
                          maxLength="11"
                        />
                        {errors.ifscCode && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.ifscCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-4 sm:space-y-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Upload Documents</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Please upload clear copies of all required documents (JPG, PNG, or PDF, max 5MB each)
                  </p>
                  
                  {[
                    { name: 'panCard', label: 'PAN Card', required: true },
                    { name: 'aadhaarCard', label: 'Aadhaar Card', required: true },
                    { name: 'photo', label: 'Passport Size Photo', required: true },
                    { name: 'signature', label: 'Signature', required: true },
                    { name: 'bankProof', label: 'Bank Proof (Cancelled Cheque/Statement)', required: true }
                  ].map((doc) => (
                    <div key={doc.name} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        {doc.label} {doc.required && '*'}
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Upload className="w-5 h-5 text-gray-600 mr-2" />
                            <span className="text-xs sm:text-sm text-gray-600">
                              {applicationForm[doc.name] ? applicationForm[doc.name].name : 'Choose file'}
                            </span>
                          </div>
                          <input
                            type="file"
                            name={doc.name}
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                          />
                        </label>
                        {applicationForm[doc.name] && (
                          <button
                            type="button"
                            onClick={() => setApplicationForm(prev => ({ ...prev, [doc.name]: null }))}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      {applicationForm[doc.name] && (
                        <p className="mt-2 text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          File uploaded successfully
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-xs sm:text-sm"
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition-all text-xs sm:text-sm"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Need Help Section */}
        {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-50 via-white to-green-50">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-green-100">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Need Help?
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                  Our support team is available 24/7 to assist you
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <a href="tel:6200755759 , 7393080847" className="group flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto justify-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                    <FaPhone className="text-white text-xl" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-600 font-medium">Call Us</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">6200755759 , 7393080847</p>
                  </div>
                </a>
                
                <a href="mailto:info@cashper.ai" className="group flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto justify-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-600 font-medium">Email Us</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">info@cashper.ai</p>
                  </div>
                </a>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-green-600 text-lg" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">Quick Response</p>
                    <p className="text-xs text-gray-600">Within 2 hours</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaShieldAlt className="text-green-600 text-lg" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">Secure Support</p>
                    <p className="text-xs text-gray-600">100% Confidential</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaMobileAlt className="text-green-600 text-lg" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">24/7 Available</p>
                    <p className="text-xs text-gray-600">Always here for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        }

      </div>
      {!isPopupMode && <Footer />}
    </>
  );
};
export default OnlineTradingDemat;
