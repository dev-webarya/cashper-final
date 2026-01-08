import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileInvoice, FaCalculator, FaUserShield, FaCheckCircle, FaClock, FaChartLine, FaHandHoldingUsd, FaLaptop, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { Upload, X, CheckCircle, FileText, AlertCircle, User, Phone, Mail, IdCard, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitITRFilingApplication } from '../../services/retailServicesApi';

const FileITR = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    
    // Step 2 - Income Details
    employmentType: '',
    annualIncome: '',
    itrType: '',
    hasBusinessIncome: false,
    hasCapitalGains: false,
    hasHouseProperty: false,
    
    // Step 3 - Address
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Step 4 - Documents
    form16: null,
    panCard: null,
    aadhaarCard: null,
    bankStatement: null,
    investmentProofs: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect for authentication check and form restoration
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    
    // Check if returning from login with pending step
    const pendingStep = sessionStorage.getItem('itr_pending_step');
    const savedFormData = sessionStorage.getItem('itr_form_data');
    
    console.log('ITR Form - Checking restoration:', { token: !!token, pendingStep, hasFormData: !!savedFormData });
    
    if (token && pendingStep && savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        const step = parseInt(pendingStep);
        
        console.log('ITR Form - Restoring:', { step, formData });
        
        setApplicationForm(formData);
        setCurrentStep(step);
        
        // Use setTimeout to ensure state is set before showing toast
        setTimeout(() => {
          toast.success('Welcome back! Continuing your ITR application...', {
            position: 'top-center',
            autoClose: 2000
          });
        }, 100);
        
        // Clear session storage after restoration
        sessionStorage.removeItem('itr_pending_step');
        sessionStorage.removeItem('itr_form_data');
      } catch (error) {
        console.error('Error restoring form data:', error);
        toast.error('Failed to restore your form. Please start again.');
        // Clear corrupted data
        sessionStorage.removeItem('itr_pending_step');
        sessionStorage.removeItem('itr_form_data');
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
      const response = await fetch('http://127.0.0.1:8000/api/applications/file-itr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heroFormData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Thank you! Your inquiry (${data.inquiryId}) has been submitted. Our tax expert will contact you soon.`);
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
      case 'employmentType':
        if (!value) error = 'Employment type is required';
        break;
      case 'annualIncome':
        if (!value) error = 'Annual income is required';
        else if (isNaN(value) || parseFloat(value) <= 0) error = 'Invalid income amount';
        break;
      case 'itrType':
        if (!value) error = 'ITR type is required';
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
      default:
        break;
    }
    
    return error;
  };

  const handleApplicationChange = (e) => {
    const { name, value, type, checked } = e.target;
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
      ['employmentType', 'annualIncome', 'itrType'].forEach(field => {
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

  const nextStep = () => {
    // Check authentication FIRST - before any validation
    // User must be logged in to proceed from Step 1 (Personal Details)
    if (currentStep === 1 && !isAuthenticated) {
      // Store current form data and intended step in sessionStorage
      sessionStorage.setItem('itr_pending_step', '2');
      sessionStorage.setItem('itr_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your ITR application', {
        position: 'top-center',
        autoClose: 3000
      });
      // Redirect to login with query parameters
      navigate(`/login?redirect=/services/file-itr&step=2`, { 
        state: { from: '/services/file-itr', returnStep: 2 } 
      });
      return;
    }
    
    // Then validate the current step
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      Object.keys(stepErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
      toast.error('Please fix all errors before proceeding');
      return;
    }
    
    // Proceed to next step
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!isAuthenticated) {
      sessionStorage.setItem('itr_pending_step', '4');
      sessionStorage.setItem('itr_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      // Use query parameter for better redirect handling
      navigate('/login?redirect=/services/file-itr&step=4', { 
        state: { from: '/services/file-itr', returnStep: 4 } 
      });
      return;
    }
    
    // Validate all required documents
    const requiredDocs = ['form16', 'panCard', 'aadhaarCard', 'bankStatement'];
    const missingDocs = requiredDocs.filter(doc => !applicationForm[doc]);
    
    if (missingDocs.length > 0) {
      toast.error('Please upload all required documents');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare form data for API
      const formDataToSubmit = {
        // Personal Info
        fullName: applicationForm.fullName,
        email: applicationForm.email,
        phone: applicationForm.phone,
        panNumber: applicationForm.panNumber,
        aadhaarNumber: applicationForm.aadhaarNumber,
        dateOfBirth: applicationForm.dateOfBirth,
        
        // Income Details
        employmentType: applicationForm.employmentType,
        annualIncome: applicationForm.annualIncome,
        itrType: applicationForm.itrType,
        hasBusinessIncome: applicationForm.hasBusinessIncome,
        hasCapitalGains: applicationForm.hasCapitalGains,
        hasHouseProperty: applicationForm.hasHouseProperty,
        
        // Address
        address: applicationForm.address,
        city: applicationForm.city,
        state: applicationForm.state,
        pincode: applicationForm.pincode,
        
        // Documents
        form16: applicationForm.form16,
        panCard: applicationForm.panCard,
        aadhaarCard: applicationForm.aadhaarCard,
        bankStatement: applicationForm.bankStatement,
        investmentProofs: applicationForm.investmentProofs,
      };
      
      // Submit to API
      const response = await submitITRFilingApplication(formDataToSubmit);
      
      toast.success('ITR Filing Application submitted successfully!', {
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
        employmentType: '',
        annualIncome: '',
        itrType: '',
        hasBusinessIncome: false,
        hasCapitalGains: false,
        hasHouseProperty: false,
        address: '',
        city: '',
        state: '',
        pincode: '',
        form16: null,
        panCard: null,
        aadhaarCard: null,
        bankStatement: null,
        investmentProofs: null,
      });
      setErrors({});
      setTouched({});
      setCurrentStep(1);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/retail-services');
      }, 2000);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: FaFileInvoice, title: "All ITR Forms", desc: "ITR-1, ITR-2, ITR-3, ITR-4 filing support" },
    { icon: FaCalculator, title: "Tax Calculation", desc: "Accurate tax computation & optimization" },
    { icon: FaUserShield, title: "Data Security", desc: "100% secure document handling" },
    { icon: FaCheckCircle, title: "Quick Filing", desc: "File within 24-48 hours" },
  ];

  const benefits = [
    "Maximum tax refunds with expert deduction planning",
    "All income sources: Salary, Business, Capital Gains, House Property",
    "Digital signature & e-verification support",
    "Complete documentation & ITR-V acknowledgement",
    "Post-filing support & query resolution",
    "Carry forward losses & set-off guidance"
  ];

  const process = [
    { step: "1", title: "Share Documents", desc: "Upload Form-16, bank statements, investment proofs" },
    { step: "2", title: "Expert Review", desc: "Our CA reviews and prepares your return" },
    { step: "3", title: "File & Verify", desc: "E-file with digital signature or Aadhaar OTP" },
    { step: "4", title: "Get ITR-V", desc: "Receive acknowledgement & refund tracking" }
  ];

  return (
    <>
      {!isPopupMode && <Navbar />}
      <div className="w-full overflow-x-hidden bg-white">
        
        {/* Hero Section */}
        {!isPopupMode && <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
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
                  Expert ITR Filing Services
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                  Complete Income Tax Return filing assistance with maximum refunds. Our expert CAs handle all types of income sources and ensure 100% compliance. File within 24-48 hours with complete documentation support.
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
        </section>}

        {/* What is ITR Filing Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  What is ITR Filing?
                </h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  Income Tax Return (ITR) filing is a mandatory process where you report your annual income, deductions, and tax paid to the Income Tax Department. It's essential for all individuals, businesses, and entities earning above the basic exemption limit.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Our certified Chartered Accountants ensure accurate ITR filing with maximum tax refunds. We handle all ITR forms (ITR-1 to ITR-7), calculate optimal deductions, and ensure 100% compliance with Income Tax regulations.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80" 
                  alt="ITR Filing" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>}

        {/* Features Grid */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-900">
              Why Choose Our ITR Filing Service?
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                    <feature.icon className="text-2xl sm:text-3xl md:text-4xl text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {/* Benefits Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80" 
                  alt="Tax Benefits" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  Benefits of Professional ITR Filing
                </h2>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  Our experienced Chartered Accountants ensure your Income Tax Return is filed accurately and on time, maximizing your refunds while maintaining complete compliance with IT laws.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-3 md:gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:translate-x-2 border-l-4 border-green-600">
                      <FaCheckCircle className="text-2xl md:text-3xl text-green-600 flex-shrink-0" />
                      <span className="text-base md:text-lg font-semibold text-gray-900">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>}

        {/* Process Section */}
        {!isPopupMode && <section id="process" className="py-8 md:py-10 lg:py-12 bg-gradient-to-br from-green-700 to-green-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 md:mb-6">
              Simple 4-Step ITR Filing Process
            </h2>
            <p className="text-base md:text-lg text-center max-w-4xl mx-auto mb-8 md:mb-12 text-white/95 leading-relaxed">
              Get your ITR filed in just 24-48 hours with complete documentation support
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {process.map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700">{item.step}</span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 md:mb-3">{item.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-white/90">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6 md:mt-8">
              <button 
                onClick={() => {
                  const formSection = document.getElementById('application-form-section');
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="bg-white text-green-700 hover:bg-gray-100 font-bold px-8 md:px-12 py-3 md:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-base md:text-lg">
                File Your ITR Now
              </button>
            </div>
          </div>
        </section>}

        {/* Documents Required Section */}
        {!isPopupMode && <section className="py-6 sm:py-6 lg:py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <FileText className="w-5 h-5 text-green-700" />
                <span className="text-green-700 font-semibold">Documents Required</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Documents Needed for ITR Filing
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Keep these documents ready for hassle-free ITR filing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <IdCard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Identity Proof</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        PAN Card (Mandatory)
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Aadhar Card for e-verification
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Income Documents</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Form 16 / Salary slips
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Bank interest certificates
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Capital gains statements
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Investment Proofs</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        80C investment receipts
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Home loan interest certificate
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Medical insurance premiums
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}

        {/* ITR Filing Application Form Section */}
        <section id="application-form-section" className="py-8 sm:py-10 md:py-12 bg-white scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Apply for ITR Filing Service
              </h2>
              <p className="text-lg text-gray-600">
                Fill in your details and upload required documents to get started
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200">
              <form onSubmit={handleApplicationSubmit}>
                {/* Step Indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          currentStep === step 
                            ? 'bg-green-600 text-white' 
                            : currentStep > step 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                        </div>
                        {step < 4 && (
                          <div className={`flex-1 h-1 mx-2 ${
                            currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span className={currentStep === 1 ? 'font-bold text-green-600' : ''}>Personal</span>
                    <span className={currentStep === 2 ? 'font-bold text-green-600' : ''}>Income</span>
                    <span className={currentStep === 3 ? 'font-bold text-green-600' : ''}>Address</span>
                    <span className={currentStep === 4 ? 'font-bold text-green-600' : ''}>Documents</span>
                  </div>
                </div>

                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaUser className="inline mr-2 text-green-600" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={applicationForm.fullName}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('fullName')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaEnvelope className="inline mr-2 text-green-600" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={applicationForm.email}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('email')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaPhone className="inline mr-2 text-green-600" />
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={applicationForm.phone}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('phone')}
                          maxLength="10"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="10-digit mobile number"
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaIdCard className="inline mr-2 text-green-600" />
                          PAN Number *
                        </label>
                        <input
                          type="text"
                          name="panNumber"
                          value={applicationForm.panNumber}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('panNumber')}
                          maxLength="10"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all uppercase ${
                            errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="ABCDE1234F"
                        />
                        {errors.panNumber && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.panNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaIdCard className="inline mr-2 text-green-600" />
                          Aadhaar Number *
                        </label>
                        <input
                          type="text"
                          name="aadhaarNumber"
                          value={applicationForm.aadhaarNumber}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('aadhaarNumber')}
                          maxLength="12"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.aadhaarNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="12-digit Aadhaar number"
                        />
                        {errors.aadhaarNumber && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.aadhaarNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={applicationForm.dateOfBirth}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('dateOfBirth')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.dateOfBirth ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                        />
                        {errors.dateOfBirth && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.dateOfBirth}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Income Details */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Income Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Employment Type *
                        </label>
                        <select
                          name="employmentType"
                          value={applicationForm.employmentType}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('employmentType')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.employmentType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select employment type</option>
                          <option value="salaried">Salaried</option>
                          <option value="self-employed">Self-Employed</option>
                          <option value="business">Business</option>
                          <option value="professional">Professional</option>
                        </select>
                        {errors.employmentType && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.employmentType}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Annual Income (₹) *
                        </label>
                        <input
                          type="number"
                          name="annualIncome"
                          value={applicationForm.annualIncome}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('annualIncome')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.annualIncome ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter annual income"
                        />
                        {errors.annualIncome && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.annualIncome}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ITR Type *
                        </label>
                        <select
                          name="itrType"
                          value={applicationForm.itrType}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('itrType')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.itrType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select ITR type</option>
                          <option value="ITR-1">ITR-1 (Sahaj) - Salaried individuals</option>
                          <option value="ITR-2">ITR-2 - Capital gains, multiple properties</option>
                          <option value="ITR-3">ITR-3 - Business/Professional income</option>
                          <option value="ITR-4">ITR-4 (Sugam) - Presumptive taxation</option>
                        </select>
                        {errors.itrType && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.itrType}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mt-6 bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-700 mb-3">Additional Income Sources:</p>
                      
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-all border border-gray-200">
                        <input
                          type="checkbox"
                          name="hasBusinessIncome"
                          checked={applicationForm.hasBusinessIncome}
                          onChange={handleApplicationChange}
                          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-700 font-medium">Business Income</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-all border border-gray-200">
                        <input
                          type="checkbox"
                          name="hasCapitalGains"
                          checked={applicationForm.hasCapitalGains}
                          onChange={handleApplicationChange}
                          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-700 font-medium">Capital Gains (Shares, Property)</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-all border border-gray-200">
                        <input
                          type="checkbox"
                          name="hasHouseProperty"
                          checked={applicationForm.hasHouseProperty}
                          onChange={handleApplicationChange}
                          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-700 font-medium">House Property Income</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 3: Address Information */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Address Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaHome className="inline mr-2 text-green-600" />
                        Complete Address *
                      </label>
                      <textarea
                        name="address"
                        value={applicationForm.address}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('address')}
                        rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none ${
                          errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="House/Flat No., Street, Area"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaMapMarkerAlt className="inline mr-2 text-green-600" />
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={applicationForm.city}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('city')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State *
                        </label>
                        <select
                          name="state"
                          value={applicationForm.state}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('state')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select state</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.state}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={applicationForm.pincode}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('pincode')}
                          maxLength="6"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all ${
                            errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="6-digit pincode"
                        />
                        {errors.pincode && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Document Upload */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Upload Required Documents
                    </h3>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <strong>Note:</strong> Please upload clear copies of all documents. Accepted formats: JPG, PNG, PDF (Max 5MB each)
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Form 16 */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-green-500 transition-all bg-gray-50 hover:bg-white">
                        <label className="cursor-pointer block">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Form 16 / Salary Slips</p>
                              <p className="text-xs text-red-600">* Required</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            name="form16"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                          />
                          <div className="text-sm">
                            {applicationForm.form16 ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{applicationForm.form16.name}</span>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-2">
                                <p>Click to upload</p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* PAN Card */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-green-500 transition-all bg-gray-50 hover:bg-white">
                        <label className="cursor-pointer block">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">PAN Card</p>
                              <p className="text-xs text-red-600">* Required</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            name="panCard"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                          />
                          <div className="text-sm">
                            {applicationForm.panCard ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{applicationForm.panCard.name}</span>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-2">
                                <p>Click to upload</p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Aadhaar Card */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-green-500 transition-all bg-gray-50 hover:bg-white">
                        <label className="cursor-pointer block">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Aadhaar Card</p>
                              <p className="text-xs text-red-600">* Required</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            name="aadhaarCard"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                          />
                          <div className="text-sm">
                            {applicationForm.aadhaarCard ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{applicationForm.aadhaarCard.name}</span>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-2">
                                <p>Click to upload</p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Bank Statement */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-green-500 transition-all bg-gray-50 hover:bg-white">
                        <label className="cursor-pointer block">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Bank Statement</p>
                              <p className="text-xs text-red-600">* Required</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            name="bankStatement"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                          />
                          <div className="text-sm">
                            {applicationForm.bankStatement ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{applicationForm.bankStatement.name}</span>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-2">
                                <p>Click to upload</p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Investment Proofs (Optional) */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-green-500 transition-all bg-gray-50 hover:bg-white md:col-span-2">
                        <label className="cursor-pointer block">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Investment Proofs</p>
                              <p className="text-xs text-blue-600">Optional - 80C, 80D, HRA proofs etc.</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            name="investmentProofs"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                          />
                          <div className="text-sm">
                            {applicationForm.investmentProofs ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{applicationForm.investmentProofs.name}</span>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-2">
                                <p>Click to upload (Optional)</p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                    >
                      ← Previous
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        {!isPopupMode && <section className="py-6 sm:py-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to File Your ITR?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Have questions? Our tax experts are here to help you with any queries.
            </p>
            <button 
              onClick={handleContactClick}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Contact Us Now →
            </button>
          </div>
        </section>}

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



      </div>
      {!isPopupMode && <Footer />}
    </>
  );
};

export default FileITR;
