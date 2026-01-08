import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FaCheckCircle, FaUsers, FaPiggyBank, FaFileAlt, FaShieldAlt, FaCalculator, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome as FaHomeIcon, FaCalendar } from 'react-icons/fa';
import { CheckCircle, FileText, IdCard, Home, TrendingUp, Target, X, Phone, Mail, Upload, AlertCircle, User } from 'lucide-react';
import { submitHUFPANApplication } from '../../services/retailServicesApi';

const ApplyHUFPAN = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    const pendingStep = sessionStorage.getItem('huf_pan_pending_step');
    const savedFormData = sessionStorage.getItem('huf_pan_form_data');
    if (token && pendingStep && savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        const step = parseInt(pendingStep);
        setApplicationForm(formData);
        setCurrentStep(step);
        setTimeout(() => { toast.success('Welcome back! Continuing your HUF PAN application...', { position: 'top-center', autoClose: 2000 }); }, 100);
        sessionStorage.removeItem('huf_pan_pending_step');
        sessionStorage.removeItem('huf_pan_form_data');
      } catch (error) {
        console.error('Error restoring form data:', error);
        toast.error('Failed to restore your form. Please start again.');
        sessionStorage.removeItem('huf_pan_pending_step');
        sessionStorage.removeItem('huf_pan_form_data');
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

  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  // Application Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    kartaName: '', email: '', phone: '', kartaPAN: '',
    hufName: '', familyMembers: '', formationDate: '', hufPurpose: '',
    address: '', city: '', state: '', pincode: '',
    kartaAadhaar: null, kartaPhoto: null, familyList: null, hufDeed: null, addressProof: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'kartaName': case 'hufName': if (!value || value.trim().length < 3) error = 'Must be at least 3 characters'; break;
      case 'email': if (!value) error = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format'; break;
      case 'phone': if (!value) error = 'Phone number is required'; else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) error = 'Phone must be 10 digits'; break;
      case 'kartaPAN': if (!value) error = 'Karta PAN is required'; else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format (e.g., ABCDE1234F)'; break;
      case 'familyMembers': if (!value) error = 'Number of family members is required'; break;
      case 'address': if (!value || value.trim().length < 10) error = 'Address must be at least 10 characters'; break;
      case 'city': if (!value) error = 'City is required'; break;
      case 'state': if (!value) error = 'State is required'; break;
      case 'pincode': if (!value) error = 'Pincode is required'; else if (!/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits'; break;
      default: break;
    }
    return error;
  };

  const handleApplicationChange = (e) => { const { name, value } = e.target; setApplicationForm(prev => ({ ...prev, [name]: value })); if (touched[name]) { const error = validateField(name, value); setErrors(prev => ({ ...prev, [name]: error })); } };
  const handleBlur = (fieldName) => { setTouched(prev => ({ ...prev, [fieldName]: true })); const error = validateField(fieldName, applicationForm[fieldName]); setErrors(prev => ({ ...prev, [fieldName]: error })); };

  const handleFileChange = (e) => {
    const { name, files } = e.target; const file = files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, and PDF files are allowed'); return; }
      setApplicationForm(prev => ({ ...prev, [name]: file }));
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) ['kartaName', 'email', 'phone', 'kartaPAN'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 2) ['hufName', 'familyMembers'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 3) ['address', 'city', 'state', 'pincode'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 4) {
      if (!applicationForm.kartaAadhaar) stepErrors.kartaAadhaar = 'Karta Aadhaar Card is required';
      if (!applicationForm.kartaPhoto) stepErrors.kartaPhoto = 'Karta Photograph is required';
      if (!applicationForm.familyList) stepErrors.familyList = 'Family Members List is required';
      if (!applicationForm.hufDeed) stepErrors.hufDeed = 'HUF Deed/Declaration is required';
      if (!applicationForm.addressProof) stepErrors.addressProof = 'Address Proof is required';
    }
    return stepErrors;
  };

  const nextStep = () => { if (currentStep === 1 && !isAuthenticated) { sessionStorage.setItem('huf_pan_pending_step', '2'); sessionStorage.setItem('huf_pan_form_data', JSON.stringify(applicationForm)); toast.warning('Please login to continue with your HUF PAN application', { position: 'top-center', autoClose: 3000 }); navigate(`/login?redirect=/services/apply-huf-pan&step=2`, { state: { from: '/services/apply-huf-pan', returnStep: 2 } }); return; } const stepErrors = validateStep(currentStep); if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); Object.keys(stepErrors).forEach(key => setTouched(prev => ({ ...prev, [key]: true }))); toast.error('Please fix all errors before proceeding'); return; } setCurrentStep(prev => prev + 1); window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' }); };
  const prevStep = () => { setCurrentStep(prev => prev - 1); window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' }); };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { sessionStorage.setItem('huf_pan_pending_step', '4'); sessionStorage.setItem('huf_pan_form_data', JSON.stringify(applicationForm)); toast.error('Please login to submit your application'); navigate('/login?redirect=/services/apply-huf-pan&step=4', { state: { from: '/services/apply-huf-pan', returnStep: 4 } }); return; }
    // Validate ALL 4 steps before submission
    const allErrors = {};
    for (let step = 1; step <= 4; step++) {
      const stepErrors = validateStep(step);
      Object.assign(allErrors, stepErrors);
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please complete all 4 steps with required information before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitHUFPANApplication(applicationForm);
      toast.success('HUF PAN Application submitted successfully!');
      setShowSuccessModal(true);
      setApplicationForm({ kartaName: '', email: '', phone: '', kartaPAN: '', hufName: '', familyMembers: '', formationDate: '', hufPurpose: '', address: '', city: '', state: '', pincode: '', kartaAadhaar: null, kartaPhoto: null, familyList: null, hufDeed: null, addressProof: null });
      setCurrentStep(1); setErrors({}); setTouched({});
      setTimeout(() => navigate('/dashboard/retail-services'), 2000);
    } catch (error) { toast.error(error.message || 'Failed to submit application'); } finally { setIsSubmitting(false); }
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
      const response = await fetch('http://127.0.0.1:8000/api/applications/apply-huf-pan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heroFormData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Thank you! Your inquiry (${data.inquiryId}) has been submitted. We will contact you soon regarding HUF PAN application.`);
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

  return (
    <>
      {!isPopupMode && <Navbar />}
      <div className="w-full overflow-x-hidden bg-white">
        
        {/* Hero Section */}
        {!isPopupMode && <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80')",
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
                  Apply for HUF PAN Card
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                  Hindu Undivided Family (HUF) is a separate legal entity for tax purposes. Get your HUF PAN card and enjoy tax benefits through income splitting, separate tax exemptions, and optimized wealth planning.
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

        {/* What is HUF PAN Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  What is HUF PAN?
                </h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  A Hindu Undivided Family (HUF) is recognized as a separate legal entity for tax purposes in India. Obtaining a PAN card for your HUF enables tax planning benefits and allows the family unit to file separate tax returns.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  HUF consists of all persons lineally descended from a common ancestor and includes their wives and unmarried daughters. The senior-most member is called the Karta, who manages the HUF's affairs and is responsible for tax filing.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
                  alt="HUF PAN" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>}

        {/* Benefits Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 md:mb-6 text-gray-900">
              Benefits of HUF PAN
            </h2>
            <p className="text-base md:text-lg text-gray-600 text-center max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed">
              Leverage tax benefits and optimize your family's wealth with HUF PAN
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <FaCalculator className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">Separate Taxation</h3>
                <p className="text-sm text-gray-600">Family income and assets taxed separately</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">Tax Exemptions</h3>
                <p className="text-sm text-gray-600">Additional deductions under 80C, 80D, etc.</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 sm:col-span-2 md:col-span-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">Lower Tax Liability</h3>
                <p className="text-sm text-gray-600">Income splitting reduces overall tax burden</p>
              </div>
            </div>
          </div>
        </section>}

        {/* How We Assist Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-900">
              How We Assist You
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  Our experts guide you through the HUF formation process, help prepare the HUF deed, and ensure all documentation is in order for PAN application. We handle the entire process from deed preparation to PAN card delivery.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 md:gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:translate-x-2 border-l-4 border-green-600">
                    <FaCheckCircle className="text-2xl md:text-3xl text-green-600 flex-shrink-0" />
                    <span className="text-base md:text-lg font-semibold text-gray-900">Complete HUF deed drafting and preparation</span>
                  </li>
                  <li className="flex items-center gap-3 md:gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:translate-x-2 border-l-4 border-green-600">
                    <FaCheckCircle className="text-2xl md:text-3xl text-green-600 flex-shrink-0" />
                    <span className="text-base md:text-lg font-semibold text-gray-900">PAN card application assistance</span>
                  </li>
                  <li className="flex items-center gap-3 md:gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:translate-x-2 border-l-4 border-green-600">
                    <FaCheckCircle className="text-2xl md:text-3xl text-green-600 flex-shrink-0" />
                    <span className="text-base md:text-lg font-semibold text-gray-900">Bank account opening support for HUF</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80" 
                  alt="HUF Support" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>}

        {/* Documents Required Section */}
        {!isPopupMode && <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <FileText className="w-5 h-5 text-green-700" />
                <span className="text-green-700 font-semibold">Documents Required</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Documents Needed for HUF PAN
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Keep these documents ready for smooth HUF PAN application
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Document 1 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">HUF Deed</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Deed of Declaration of HUF
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Notarized HUF declaration
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        List of HUF members
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document 2 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <IdCard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Karta's Documents</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Identity proof of HUF head
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        PAN Card (Mandatory)
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Aadhaar Card
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Passport/Voter ID
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document 3 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <Home className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Address Proof</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      HUF residential address proof
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Utility bill (electricity/gas)
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Property documents
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Bank statement in HUF name
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}

        {/* Important Note Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-gradient-to-br from-green-700 to-green-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-10 border-2 border-white/20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                Important Notes
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <FaCheckCircle className="text-2xl text-yellow-300 flex-shrink-0 mt-1" />
                  <p className="text-base md:text-lg">Before applying for HUF PAN, it's essential to create an HUF deed</p>
                </li>
                <li className="flex items-start gap-4">
                  <FaCheckCircle className="text-2xl text-yellow-300 flex-shrink-0 mt-1" />
                  <p className="text-base md:text-lg">The Karta must be a Hindu, Jain, Sikh, or Buddhist</p>
                </li>
                <li className="flex items-start gap-4">
                  <FaCheckCircle className="text-2xl text-yellow-300 flex-shrink-0 mt-1" />
                  <p className="text-base md:text-lg">We provide complete support in drafting the HUF deed and ensuring compliance</p>
                </li>
              </ul>
            </div>
          </div>
        </section>}

        {/* Application Form Section */}
        <section id="application-form-section" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-green-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">HUF PAN Application</h2>
                <p className="text-green-50 text-center mt-2">Complete the form to apply for HUF PAN card</p>
              </div>

              <div className="px-4 sm:px-6 md:px-8 py-6">
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>
                      {step < 4 && <div className={`w-12 sm:w-20 md:w-32 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`}></div>}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleApplicationSubmit} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Karta (Head of Family) Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Karta Name *</label><div className="relative"><FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="kartaName" value={applicationForm.kartaName} onChange={handleApplicationChange} onBlur={() => handleBlur('kartaName')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.kartaName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter karta's full name" /></div>{errors.kartaName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.kartaName}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="karta.email@example.com" /></div>{errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.email}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit mobile number" /></div>{errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.phone}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Karta PAN Number *</label><div className="relative"><FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="kartaPAN" value={applicationForm.kartaPAN} onChange={handleApplicationChange} onBlur={() => handleBlur('kartaPAN')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg uppercase ${errors.kartaPAN ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="ABCDE1234F" maxLength="10" /></div>{errors.kartaPAN && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.kartaPAN}</p>}</div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">HUF Details</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">HUF Name *</label><div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="hufName" value={applicationForm.hufName} onChange={handleApplicationChange} onBlur={() => handleBlur('hufName')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.hufName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter HUF name" /></div>{errors.hufName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.hufName}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Number of Family Members *</label><select name="familyMembers" value={applicationForm.familyMembers} onChange={handleApplicationChange} onBlur={() => handleBlur('familyMembers')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.familyMembers ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Number of Members</option><option value="2">2 Members</option><option value="3">3 Members</option><option value="4">4 Members</option><option value="5">5 Members</option><option value="6">6 Members</option><option value="7+">7+ Members</option></select>{errors.familyMembers && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.familyMembers}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">HUF Formation Date</label><div className="relative"><FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="date" name="formationDate" value={applicationForm.formationDate} onChange={handleApplicationChange} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg border-gray-200 focus:border-green-500`} /></div></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Purpose of HUF</label><textarea name="hufPurpose" value={applicationForm.hufPurpose} onChange={handleApplicationChange} rows="3" className={`w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:border-green-500`} placeholder="Describe the purpose of forming HUF (optional)"></textarea></div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Address Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" /><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="3" className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter complete HUF address"></textarea></div>{errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.address}</p>}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="City" />{errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.city}</p>}</div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="State" />{errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.state}</p>}</div></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><div className="relative"><FaHomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="6-digit pincode" maxLength="6" /></div>{errors.pincode && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.pincode}</p>}</div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Document Uploads</h3>
                      <p className="text-sm text-gray-600 mb-4">Upload required documents (Max 5MB each, JPG/PNG/PDF only)</p>
                      {[{name: 'kartaAadhaar', label: 'Karta Aadhaar Card *', required: true},{name: 'kartaPhoto', label: 'Karta Photograph *', required: true},{name: 'familyList', label: 'Family Members List *', required: true},{name: 'hufDeed', label: 'HUF Deed/Declaration *', required: true},{name: 'addressProof', label: 'Address Proof *', required: true}].map(doc => (
                        <div key={doc.name}><label className="block text-sm font-medium text-gray-700 mb-2">{doc.label}</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors"><input type="file" name={doc.name} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id={doc.name} /><label htmlFor={doc.name} className="cursor-pointer flex flex-col items-center"><Upload className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm text-gray-600">{applicationForm[doc.name] ? applicationForm[doc.name].name : 'Click to upload or drag and drop'}</span><span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 5MB)</span></label></div></div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (<button type="button" onClick={prevStep} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Previous</button>)}
                    {currentStep < 4 ? (<button type="button" onClick={nextStep} className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all transform hover:scale-105">Next Step</button>) : (<button type="submit" disabled={isSubmitting} className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>)}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSuccessModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all" onClick={e => e.stopPropagation()}>
              <div className="text-center"><CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" /><h3 className="text-2xl font-bold text-gray-900 mb-2">HUF PAN Application Submitted!</h3><p className="text-gray-600 mb-6">Thank you for your HUF PAN application. Our team will verify the documents and contact you within 2-3 business days with further instructions.</p><button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all">Close</button></div>
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <section className="py-8 sm:py-10 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Apply for HUF PAN?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Start your HUF journey today and unlock tax benefits for your family. Get expert assistance now!
            </p>
            <button 
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Contact Us Now →
            </button>
          </div>
        </section>

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
      {!isPopupMode && <Footer />}
    </>
  );
};

export default ApplyHUFPAN;
