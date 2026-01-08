import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaShieldAlt, FaCalendarCheck, FaFileAlt, FaClock, FaHandsHelping, FaCalculator, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { CheckCircle, FileText, Building, Target, Award, X, Phone, Mail, Upload, AlertCircle, User, IdCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitCompanyCompliance } from '../../services/businessServicesApi';

const ComplianceNewCompany = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', panNumber: '',
    companyName: '', cin: '', complianceType: '', registrationDate: '',
    address: '', city: '', state: '', pincode: '',
    cinCertificate: null, moa: null, aoa: null, directorPan: null, addressProof: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check authentication
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    // Restore form data from sessionStorage after login redirect
    const savedFormData = sessionStorage.getItem('compliance_company_form_data');
    const savedStep = sessionStorage.getItem('compliance_company_pending_step');
    
    if (savedFormData && token) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setApplicationForm(parsedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        sessionStorage.removeItem('compliance_company_form_data');
        sessionStorage.removeItem('compliance_company_pending_step');
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
      const response = await fetch('http://localhost:8000/api/corporate-inquiry/compliance-new-company', {
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
        toast.success(data.message || 'Thank you! Our compliance expert will contact you soon.');
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
      case 'companyName':
        if (!value.trim()) error = 'Company name is required';
        break;
      case 'cin':
        if (!value.trim()) error = 'CIN is required';
        else if (!/^[LUu]{1}[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/.test(value)) error = 'Invalid CIN format';
        break;
      case 'complianceType':
        if (!value) error = 'Compliance type is required';
        break;
      case 'registrationDate':
        if (!value) error = 'Registration date is required';
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
      ['companyName', 'cin', 'complianceType', 'registrationDate'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 4) {
      // Validate required documents
      const requiredDocs = ['cinCertificate', 'moa', 'aoa', 'directorPan', 'addressProof'];
      requiredDocs.forEach(docName => {
        if (!applicationForm[docName]) {
          stepErrors[docName] = `${docName.replace(/([A-Z])/g, ' $1').trim()} is required`;
        }
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
    // Check authentication before proceeding from step 1
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('compliance_company_pending_step', '2');
      sessionStorage.setItem('compliance_company_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your compliance application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login?redirect=/services/compliance-new-company&step=2', {
        state: { from: '/services/compliance-new-company', returnStep: 2 }
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
      toast.warning('Please complete all steps before submitting');
      return;
    }
    
    // Validate step 4 documents
    const stepErrors = validateStep(4);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please upload all required documents before submitting');
      return;
    }
    
    if (!isAuthenticated) {
      sessionStorage.setItem('compliance_company_pending_step', '4');
      sessionStorage.setItem('compliance_company_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/compliance-new-company&step=4', {
        state: { from: '/services/compliance-new-company', returnStep: 4 }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call API to submit company compliance application
      const response = await submitCompanyCompliance(applicationForm);
      
      if (response.success) {
        setShowSuccessModal(true);
        toast.success('Company compliance application submitted successfully!');
        setApplicationForm({
          fullName: '', email: '', phone: '', panNumber: '',
          companyName: '', cin: '', complianceType: '', registrationDate: '',
          address: '', city: '', state: '', pincode: '',
          cinCertificate: null, moa: null, aoa: null, directorPan: null, addressProof: null
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

  // If in popup mode, only render the application form section
  if (isPopupMode) {
    return (
      <>
        <section id="application-form-section" className="py-4 sm:py-6 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-4 sm:py-6 rounded-t-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">Company Compliance Application</h2>
                <p className="text-blue-50 text-center mt-1 text-sm">Complete the form for compliance services</p>
              </div>

              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>
                      {step < 4 && <div className={`w-8 sm:w-12 md:w-16 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleApplicationSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }} className="space-y-5">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Your full name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="your@email.com" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="10-digit number" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label><input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="ABCDE1234F" maxLength="10" /></div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Company Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label><input type="text" name="companyName" value={applicationForm.companyName} onChange={handleApplicationChange} onBlur={() => handleBlur('companyName')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.companyName ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Company name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">CIN *</label><input type="text" name="cin" value={applicationForm.cin} onChange={handleApplicationChange} onBlur={() => handleBlur('cin')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm uppercase ${errors.cin ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Company Identification Number" maxLength="21" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Compliance Type *</label><select name="complianceType" value={applicationForm.complianceType} onChange={handleApplicationChange} onBlur={() => handleBlur('complianceType')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.complianceType ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}><option value="">Select Type</option><option value="Annual Compliance">Annual Compliance</option><option value="Quarterly Compliance">Quarterly Compliance</option><option value="Statutory Filing">Statutory Filing</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Registration Date *</label><input type="date" name="registrationDate" value={applicationForm.registrationDate} onChange={handleApplicationChange} onBlur={() => handleBlur('registrationDate')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.registrationDate ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} /></div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Address Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="2" className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Full address" /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="City" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="State" /></div></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="6-digit" maxLength="6" /></div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Upload Documents</h3>
                      {[{name: 'cinCertificate', label: 'CIN Certificate *'}, {name: 'moa', label: 'MOA *'}, {name: 'aoa', label: 'AOA *'}, {name: 'directorPan', label: 'Director PAN *'}, {name: 'addressProof', label: 'Address Proof *'}].map(doc => (
                        <div key={doc.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{doc.label}</label>
                          <div className={`border-2 border-dashed rounded-lg p-3 text-center hover:border-blue-500 transition-colors ${errors[doc.name] ? 'border-red-500' : 'border-gray-300'}`}>
                            <input type="file" name={doc.name} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id={doc.name} />
                            <label htmlFor={doc.name} className="cursor-pointer block text-xs text-gray-600">
                              {applicationForm[doc.name] ? applicationForm[doc.name].name : 'Click to upload'}
                            </label>
                          </div>
                          {errors[doc.name] && (
                            <p className="mt-1 text-xs text-red-600">{errors[doc.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between gap-3 pt-4">
                    {currentStep > 1 && (
                      <button 
                        type="button" 
                        onClick={prevStep} 
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                      >
                        ← Previous
                      </button>
                    )}
                    {currentStep < 4 ? (
                      <button 
                        type="button" 
                        onClick={nextStep} 
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium text-sm transition-all"
                      >
                        Next →
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium text-sm transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-blue-600" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 text-sm mb-4">Your compliance application has been submitted.</p>
              <button onClick={() => { setShowSuccessModal(false); if (onPopupClose) onPopupClose(); }} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full overflow-x-hidden bg-white">
        
        {/* Hero Section */}
        <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'scroll',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-700/60 to-teal-900/50"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center">
              <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center md:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                  Complete Compliance Services for New Companies
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                  Ensure your newly incorporated company stays compliant with all ROC, Income Tax, and GST regulations. Expert guidance from day one to avoid penalties and maintain good standing with authorities.
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

        {/* What is Company Compliance Section */}
        <section className="py-8 md:py-10 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  What is Company Compliance?
                </h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  Newly incorporated companies must comply with various regulatory requirements under the Companies Act, Income Tax Act, and other applicable laws. Company compliance includes timely filing of returns, maintaining statutory registers, conducting board meetings, and adhering to GST regulations.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  We ensure your company remains compliant from day one, avoiding penalties and maintaining good standing with ROC, Income Tax, and GST authorities. Our expert team handles all compliance activities so you can focus on growing your business.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80" 
                  alt="Company Compliance" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Requirements Section */}
        <section className="py-8 md:py-10 lg:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-900">
              Annual Compliance Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FaFileAlt className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">ROC Annual Filings</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Form AOC-4: Annual Financial Statements filing</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Form MGT-7: Annual Return filing</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Form DIR-3 KYC: Director KYC (annually before 30th September)</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Form ADT-1: Auditor appointment filing</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FaCalculator className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Income Tax Compliance</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Income Tax Return (ITR) filing for companies</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Advance tax payment (quarterly)</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">TDS returns filing (quarterly)</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Transfer Pricing documentation (if applicable)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FaShieldAlt className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">GST Compliance</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Monthly GSTR-1 and GSTR-3B filing</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Annual GSTR-9 and GSTR-9C filing</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">E-way bill generation for goods movement</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">GST audit and reconciliation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FaCalendarCheck className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Statutory Audit</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Appointment of statutory auditor</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Annual financial statements preparation</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Audit report and certification</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Tax audit (if turnover exceeds limits)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="py-8 md:py-10 lg:py-12 bg-gradient-to-br from-green-700 to-green-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 md:mb-6">
              How We Help Your Company Stay Compliant
            </h2>
            <p className="text-base md:text-lg text-center max-w-4xl mx-auto mb-8 md:mb-12 text-white/95 leading-relaxed">
              Our compliance experts maintain a calendar of all due dates and ensure your company never misses a deadline
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 md:p-8 text-center border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2">
                <FaClock className="text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Monthly Reminders</h3>
                <p className="text-white/90">Never miss a compliance deadline with our automated reminder system</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 md:p-8 text-center border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2">
                <FaFileAlt className="text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Complete Documentation</h3>
                <p className="text-white/90">All forms prepared and filed accurately with proper documentation</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 md:p-8 text-center border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2">
                <FaHandsHelping className="text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Expert Support</h3>
                <p className="text-white/90">Dedicated compliance team to handle all your regulatory requirements</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <button 
                onClick={handleContactNavigation}
                className="bg-white text-green-700 hover:bg-gray-100 font-bold px-8 md:px-12 py-3 md:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-base md:text-lg">
                Get Compliance Support
              </button>
            </div>
          </div>
        </section>

        {/* Penalties Warning Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 md:p-12 border-l-4 border-red-500">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">⚠ Penalties for Non-Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Late filing fees: ₹100 per day for private companies</span>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Additional penalties up to ₹5 lakhs for serious violations</span>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Directors may face prosecution in extreme cases</span>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Company may be struck off from register for persistent default</span>
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
                  Company Compliance Application
                </h2>
                <p className="text-green-50 text-center mt-2">Complete the form for compliance services</p>
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

                {/* Step 2: Company Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Company Details</h3>
                    
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaBuilding className="mr-2 text-green-600" /> Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={applicationForm.companyName}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('companyName')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.companyName ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="Enter company name"
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <IdCard className="mr-2 text-green-600" /> CIN Number *
                      </label>
                      <input
                        type="text"
                        name="cin"
                        value={applicationForm.cin}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('cin')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors uppercase ${
                          errors.cin ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="L12345MH2020PTC123456"
                        maxLength={21}
                      />
                      {errors.cin && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.cin}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">21-character Corporate Identification Number</p>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaCalculator className="mr-2 text-green-600" /> Compliance Type *
                      </label>
                      <select
                        name="complianceType"
                        value={applicationForm.complianceType}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('complianceType')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.complianceType ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                      >
                        <option value="">Select Compliance Type</option>
                        <option value="Annual Filing (AOC-4 & MGT-7)">Annual Filing (AOC-4 & MGT-7)</option>
                        <option value="DIN eKYC">DIN eKYC</option>
                        <option value="DIR-3 KYC">DIR-3 KYC</option>
                        <option value="Board Meeting Minutes">Board Meeting Minutes</option>
                        <option value="AGM Compliance">AGM Compliance</option>
                        <option value="Full Compliance Package">Full Compliance Package</option>
                      </select>
                      {errors.complianceType && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.complianceType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaCalendarAlt className="mr-2 text-green-600" /> Registration Date *
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={applicationForm.registrationDate}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('registrationDate')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.registrationDate ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                      />
                      {errors.registrationDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.registrationDate}
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
                        <Upload className="mr-2 text-green-600" /> CIN Certificate *
                      </label>
                      <input
                        type="file"
                        name="cinCertificate"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.cinCertificate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.cinCertificate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> MOA (Memorandum of Association) *
                      </label>
                      <input
                        type="file"
                        name="moa"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.moa && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.moa}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> AOA (Articles of Association) *
                      </label>
                      <input
                        type="file"
                        name="aoa"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.aoa && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.aoa}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> Director PAN Card *
                      </label>
                      <input
                        type="file"
                        name="directorPan"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.directorPan && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.directorPan}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> Address Proof *
                      </label>
                      <input
                        type="file"
                        name="addressProof"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.addressProof && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.addressProof}
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
                Your compliance application has been received. We'll contact you within 1-2 business days to discuss your requirements.
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

        {/* Call to Action Section */}
        <section className="py-8 sm:py-10 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Ensure Full Compliance?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Don't risk penalties. Let our experts handle all your company compliance requirements from day one!
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
    </>
  );
};

export default ComplianceNewCompany;
