
// Cleaned: Only one set of imports and one BankAccount component below
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUniversity, FaMobileAlt, FaShieldAlt, FaGift, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaCheckCircle } from 'react-icons/fa';
import { Upload, X, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitBankAccountApplication } from '../../services/retailServicesApi';

const benefits = [
  'Zero balance account opening',
  'Free debit card & cheque book',
  'Mobile & net banking access',
  '24/7 customer support',
  'Secure transactions',
  'Quick approval process',
];
const process = [
  { step: 1, title: 'Fill Application', desc: 'Complete the online form with your details.' },
  { step: 2, title: 'Upload Documents', desc: 'Upload KYC and address proof.' },
  { step: 3, title: 'Verification', desc: 'Bank verifies your details.' },
  { step: 4, title: 'Account Opened', desc: 'Receive account details & start banking.' },
];
const features = [
  { icon: FaUniversity, title: 'Zero Balance', desc: 'Open savings account with zero balance' },
  { icon: FaMobileAlt, title: 'Mobile Banking', desc: '24/7 banking at your fingertips' },
  { icon: FaShieldAlt, title: 'Secure Banking', desc: 'Bank-grade security for all transactions' },
  { icon: FaGift, title: 'Attractive Benefits', desc: 'Get debit card, checkbook & more' },
];

const BankAccount = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', panNumber: '', aadhaarNumber: '', dateOfBirth: '',
    accountType: '', bankPreference: '', accountVariant: '', monthlyIncome: '', occupationType: '', nomineeRequired: false, nomineeName: '', nomineeRelation: '',
    address: '', city: '', state: '', pincode: '', residenceType: '',
    panCard: null, aadhaarCard: null, photo: null, signature: null, addressProof: null,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); const token = localStorage.getItem('access_token'); setIsAuthenticated(!!token); const pendingStep = sessionStorage.getItem('bank_account_pending_step'); const savedFormData = sessionStorage.getItem('bank_account_form_data'); if (token && pendingStep && savedFormData) { try { const formData = JSON.parse(savedFormData); const step = parseInt(pendingStep); setApplicationForm(formData); setCurrentStep(step); setTimeout(() => { toast.success('Welcome back! Continuing your bank account application...', { position: 'top-center', autoClose: 2000 }); }, 100); sessionStorage.removeItem('bank_account_pending_step'); sessionStorage.removeItem('bank_account_form_data'); } catch (error) { console.error('Error restoring form data:', error); toast.error('Failed to restore your form. Please start again.'); sessionStorage.removeItem('bank_account_pending_step'); sessionStorage.removeItem('bank_account_form_data'); } } }, []);

  // Validation logic
  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'fullName': if (!value || value.trim().length < 3) error = 'Full name must be at least 3 characters'; break;
      case 'email': if (!value) error = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format'; break;
      case 'phone': if (!value) error = 'Phone number is required'; else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) error = 'Phone must be 10 digits'; break;
      case 'panNumber': if (!value) error = 'PAN is required'; else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format (e.g., ABCDE1234F)'; break;
      case 'aadhaarNumber': if (!value) error = 'Aadhaar is required'; else if (!/^[0-9]{12}$/.test(value.replace(/\s/g, ''))) error = 'Aadhaar must be 12 digits'; break;
      case 'dateOfBirth': if (!value) error = 'Date of birth is required'; break;
      case 'accountType': if (!value) error = 'Account type is required'; break;
      case 'bankPreference': if (!value) error = 'Bank preference is required'; break;
      case 'accountVariant': if (!value) error = 'Account variant is required'; break;
      case 'monthlyIncome': if (!value) error = 'Monthly income is required'; break;
      case 'occupationType': if (!value) error = 'Occupation type is required'; break;
      case 'nomineeName': if (applicationForm.nomineeRequired && !value) error = 'Nominee name is required'; break;
      case 'nomineeRelation': if (applicationForm.nomineeRequired && !value) error = 'Nominee relation is required'; break;
      case 'address': if (!value) error = 'Address is required'; break;
      case 'city': if (!value) error = 'City is required'; break;
      case 'state': if (!value) error = 'State is required'; break;
      case 'pincode': if (!value || !/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits'; break;
      case 'residenceType': if (!value) error = 'Residence type is required'; break;
      case 'panCard': case 'aadhaarCard': case 'photo': case 'signature': case 'addressProof':
        if (!value) error = 'Required document missing';
        else if (value && value.size > 5 * 1024 * 1024) error = 'File size must be ≤ 5MB';
        else if (value && !['image/jpeg','image/png','application/pdf'].includes(value.type)) error = 'Allowed types: JPG, PNG, PDF';
        break;
      default: break;
    }
    return error;
  };
  const handleApplicationChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    setApplicationForm((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateField(name, val) }));
  };
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, applicationForm[fieldName]) }));
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setApplicationForm((prev) => ({ ...prev, [name]: file }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, file) }));
  };
  const validateStep = (step) => {
    const stepFields = [
      step === 1 ? ['fullName','email','phone','panNumber','aadhaarNumber','dateOfBirth'] :
      step === 2 ? ['accountType','bankPreference','accountVariant','monthlyIncome','occupationType','nomineeRequired','nomineeName','nomineeRelation'] :
      step === 3 ? ['address','city','state','pincode','residenceType'] :
      ['panCard','aadhaarCard','photo','signature','addressProof']
    ][0];
    let stepErrors = {};
    stepFields.forEach((field) => {
      const error = validateField(field, applicationForm[field]);
      if (error) stepErrors[field] = error;
    });
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return stepErrors;
  };
  const nextStep = () => {
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('bank_account_pending_step', '2');
      sessionStorage.setItem('bank_account_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your bank account application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate(`/login?redirect=/services/bank-account&step=2`, { 
        state: { from: '/services/bank-account', returnStep: 2 } 
      });
      return;
    }
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      toast.error('Please fix all errors before proceeding');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => setCurrentStep((prev) => prev - 1);
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      sessionStorage.setItem('bank_account_pending_step', '4');
      sessionStorage.setItem('bank_account_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/bank-account&step=4', { 
        state: { from: '/services/bank-account', returnStep: 4 } 
      });
      return;
    }
    const allErrors = [1,2,3,4].map(validateStep).reduce((acc, curr) => ({ ...acc, ...curr }), {});
    if (Object.keys(allErrors).length > 0) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitBankAccountApplication(applicationForm);
      toast.success('Bank Account Application submitted successfully!');
      setApplicationForm({
        fullName: '', email: '', phone: '', panNumber: '', aadhaarNumber: '', dateOfBirth: '',
        accountType: '', bankPreference: '', accountVariant: '', monthlyIncome: '', occupationType: '', nomineeRequired: false, nomineeName: '', nomineeRelation: '',
        address: '', city: '', state: '', pincode: '', residenceType: '',
        panCard: null, aadhaarCard: null, photo: null, signature: null, addressProof: null,
      });
      setCurrentStep(1);
      setTouched({});
      setErrors({});
      setTimeout(() => navigate('/dashboard/retail-services'), 2000);
    } catch (error) {
      toast.error(error.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hero form handlers
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  const handleHeroFormChange = (e) => {
    const { name, value } = e.target;
    setHeroFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHeroFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingHero(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/applications/bank-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heroFormData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Thank you! Your inquiry (${data.inquiryId}) has been submitted. We will contact you soon!`);
        setHeroFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmittingHero(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPopupMode && <Navbar />}
      
      {/* Hero Section */}
      {!isPopupMode && (<section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
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
                Open Your Bank Account with Zero Balance
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                Start your banking journey today with instant account opening, free debit card, mobile banking access, and 24/7 customer support. No minimum balance required!
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                  <FaCheckCircle className="text-yellow-400 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm font-semibold">Zero Balance</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                  <FaCheckCircle className="text-yellow-400 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm font-semibold">Instant Approval</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                  <FaCheckCircle className="text-yellow-400 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm font-semibold">Free Debit Card</span>
                </div>
              </div>
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
      </section>)}

      {/* Features Section */}
      {!isPopupMode && (<section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10">Why Choose Our Banking Services?</h2>
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
      </section>)}
      {/* Benefits Section */}
      {!isPopupMode && (<section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10">Account Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-gray-700 text-xs sm:text-sm md:text-base">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>)}
      {/* Process Section */}
      {!isPopupMode && (<section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10">Account Opening Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {process.map((item, index) => (
              <div key={index} className="relative bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">{item.step}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 mt-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>)}

      {/* Application Form Section */}
      <section id="apply-form" className="py-8 sm:py-10 md:py-12 lg:py-16 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Open Your Bank Account
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              Complete the form below to open your savings account with zero balance
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center relative">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <div className="text-xs sm:text-sm mt-1 sm:mt-2 text-center font-medium text-gray-700">
                    {step === 1 && 'Personal'}
                    {step === 2 && 'Account'}
                    {step === 3 && 'Address'}
                    {step === 4 && 'Documents'}
                  </div>
                </div>
              ))}
              <div className="absolute top-4 sm:top-5 left-0 right-0 h-1 bg-gray-200 -z-0">
                <div 
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleApplicationSubmit} className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8">
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-3 border-b-2 border-green-100">
                  Personal Information
                </h3>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={applicationForm.fullName}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('fullName')}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                        errors.fullName 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={applicationForm.email}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={applicationForm.phone}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                        errors.phone 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.phone}
                    </p>
                  )}
                </div>

                {/* PAN Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="panNumber"
                      value={applicationForm.panNumber}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('panNumber')}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base uppercase transition-all duration-200 ${
                        errors.panNumber 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      placeholder="ABCDE1234F"
                      maxLength="10"
                    />
                  </div>
                  {errors.panNumber && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.panNumber}
                    </p>
                  )}
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={applicationForm.aadhaarNumber}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('aadhaarNumber')}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                        errors.aadhaarNumber 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      placeholder="12-digit Aadhaar number"
                      maxLength="12"
                    />
                  </div>
                  {errors.aadhaarNumber && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.aadhaarNumber}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={applicationForm.dateOfBirth}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('dateOfBirth')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.dateOfBirth 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
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
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-3 border-b-2 border-green-100">
                  Account Details
                </h3>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accountType"
                    value={applicationForm.accountType}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('accountType')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.accountType 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select Account Type</option>
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                    <option value="salary">Salary Account</option>
                  </select>
                  {errors.accountType && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.accountType}
                    </p>
                  )}
                </div>

                {/* Bank Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Preference <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bankPreference"
                    value={applicationForm.bankPreference}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('bankPreference')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.bankPreference 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select Bank</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                  </select>
                  {errors.bankPreference && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.bankPreference}
                    </p>
                  )}
                </div>

                {/* Account Variant */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Variant <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accountVariant"
                    value={applicationForm.accountVariant}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('accountVariant')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.accountVariant 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select Variant</option>
                    <option value="regular">Regular Savings</option>
                    <option value="premium">Premium Savings</option>
                    <option value="senior">Senior Citizen Account</option>
                    <option value="minor">Minor Account</option>
                  </select>
                  {errors.accountVariant && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.accountVariant}
                    </p>
                  )}
                </div>

                {/* Monthly Income */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Income <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="monthlyIncome"
                    value={applicationForm.monthlyIncome}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('monthlyIncome')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.monthlyIncome 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select Income Range</option>
                    <option value="below-25k">Below ₹25,000</option>
                    <option value="25k-50k">₹25,000 - ₹50,000</option>
                    <option value="50k-1l">₹50,000 - ₹1,00,000</option>
                    <option value="1l-2l">₹1,00,000 - ₹2,00,000</option>
                    <option value="above-2l">Above ₹2,00,000</option>
                  </select>
                  {errors.monthlyIncome && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.monthlyIncome}
                    </p>
                  )}
                </div>

                {/* Occupation Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Occupation Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="occupationType"
                    value={applicationForm.occupationType}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('occupationType')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.occupationType 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select Occupation</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="professional">Professional</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                  </select>
                  {errors.occupationType && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.occupationType}
                    </p>
                  )}
                </div>

                {/* Nominee Required */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="nomineeRequired"
                      checked={applicationForm.nomineeRequired}
                      onChange={handleApplicationChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      I want to add a nominee
                    </span>
                  </label>
                </div>

                {/* Nominee Fields (conditional) */}
                {applicationForm.nomineeRequired && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nominee Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nomineeName"
                        value={applicationForm.nomineeName}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('nomineeName')}
                        className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                          errors.nomineeName 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-500'
                        } focus:outline-none`}
                        placeholder="Enter nominee name"
                      />
                      {errors.nomineeName && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.nomineeName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nominee Relation <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="nomineeRelation"
                        value={applicationForm.nomineeRelation}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('nomineeRelation')}
                        className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                          errors.nomineeRelation 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-green-500'
                        } focus:outline-none`}
                      >
                        <option value="">Select Relation</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                        <option value="sibling">Sibling</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.nomineeRelation && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span> {errors.nomineeRelation}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Address Details */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-3 border-b-2 border-green-100">
                  Address Details
                </h3>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaHome className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      name="address"
                      value={applicationForm.address}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('address')}
                      rows="3"
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                        errors.address 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      placeholder="Enter your complete address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.address}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={applicationForm.city}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('city')}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                        errors.city 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      placeholder="Enter your city"
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={applicationForm.state}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('state')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.state 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.state}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={applicationForm.pincode}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('pincode')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.pincode 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                    placeholder="6-digit pincode"
                    maxLength="6"
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.pincode}
                    </p>
                  )}
                </div>

                {/* Residence Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Residence Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="residenceType"
                    value={applicationForm.residenceType}
                    onChange={handleApplicationChange}
                    onBlur={() => handleBlur('residenceType')}
                    className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                      errors.residenceType 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 focus:border-green-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select Residence Type</option>
                    <option value="owned">Owned</option>
                    <option value="rented">Rented</option>
                    <option value="parental">Parental</option>
                    <option value="company">Company Provided</option>
                  </select>
                  {errors.residenceType && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.residenceType}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-3 border-b-2 border-green-100">
                  Document Upload
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Upload clear images or PDFs (max 5MB each). Accepted formats: JPG, PNG, PDF
                </p>

                {/* PAN Card */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PAN Card <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
                    errors.panCard ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-green-500'
                  }`}>
                    <input
                      type="file"
                      name="panCard"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      id="panCard"
                    />
                    <label htmlFor="panCard" className="cursor-pointer block">
                      <Upload className="mx-auto text-gray-400 mb-2 w-8 h-8 sm:w-10 sm:h-10" />
                      <p className="text-xs sm:text-sm text-gray-600">
                        {applicationForm.panCard ? applicationForm.panCard.name : 'Click to upload PAN Card'}
                      </p>
                    </label>
                  </div>
                  {errors.panCard && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.panCard}
                    </p>
                  )}
                </div>

                {/* Aadhaar Card */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Aadhaar Card <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
                    errors.aadhaarCard ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-green-500'
                  }`}>
                    <input
                      type="file"
                      name="aadhaarCard"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      id="aadhaarCard"
                    />
                    <label htmlFor="aadhaarCard" className="cursor-pointer block">
                      <Upload className="mx-auto text-gray-400 mb-2 w-8 h-8 sm:w-10 sm:h-10" />
                      <p className="text-xs sm:text-sm text-gray-600">
                        {applicationForm.aadhaarCard ? applicationForm.aadhaarCard.name : 'Click to upload Aadhaar Card'}
                      </p>
                    </label>
                  </div>
                  {errors.aadhaarCard && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.aadhaarCard}
                    </p>
                  )}
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passport Size Photo <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
                    errors.photo ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-green-500'
                  }`}>
                    <input
                      type="file"
                      name="photo"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      id="photo"
                    />
                    <label htmlFor="photo" className="cursor-pointer block">
                      <Upload className="mx-auto text-gray-400 mb-2 w-8 h-8 sm:w-10 sm:h-10" />
                      <p className="text-xs sm:text-sm text-gray-600">
                        {applicationForm.photo ? applicationForm.photo.name : 'Click to upload Photo'}
                      </p>
                    </label>
                  </div>
                  {errors.photo && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.photo}
                    </p>
                  )}
                </div>

                {/* Signature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Signature <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
                    errors.signature ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-green-500'
                  }`}>
                    <input
                      type="file"
                      name="signature"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      id="signature"
                    />
                    <label htmlFor="signature" className="cursor-pointer block">
                      <Upload className="mx-auto text-gray-400 mb-2 w-8 h-8 sm:w-10 sm:h-10" />
                      <p className="text-xs sm:text-sm text-gray-600">
                        {applicationForm.signature ? applicationForm.signature.name : 'Click to upload Signature'}
                      </p>
                    </label>
                  </div>
                  {errors.signature && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.signature}
                    </p>
                  )}
                </div>

                {/* Address Proof */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Proof <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
                    errors.addressProof ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-green-500'
                  }`}>
                    <input
                      type="file"
                      name="addressProof"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      id="addressProof"
                    />
                    <label htmlFor="addressProof" className="cursor-pointer block">
                      <Upload className="mx-auto text-gray-400 mb-2 w-8 h-8 sm:w-10 sm:h-10" />
                      <p className="text-xs sm:text-sm text-gray-600">
                        {applicationForm.addressProof ? applicationForm.addressProof.name : 'Click to upload Address Proof'}
                      </p>
                    </label>
                  </div>
                  {errors.addressProof && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.addressProof}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t-2 border-gray-100">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto sm:ml-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 text-sm sm:text-base"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:ml-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Contact/Support Info */}
      {!isPopupMode && (<section className="py-8 sm:py-10 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
            Need Help?
          </h2>
          <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 text-center max-w-3xl mx-auto">
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
              <div className="flex items-center space-x-2">
                <FaPhone className="text-green-600 text-lg sm:text-xl" />
                <span className="text-sm sm:text-base font-semibold text-gray-800">6200755759 , 7393080847</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-green-600 text-lg sm:text-xl" />
                <span className="text-sm sm:text-base font-semibold text-gray-800">info@cashper.ai</span>
              </div>
            </div>
          </div>
        </div>
      </section>)}

      {!isPopupMode && <Footer />}
    </div>
  );
};

export default BankAccount;
