import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileInvoice, FaCalculator, FaCheckCircle, FaChartLine, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { CheckCircle, FileText, X, Phone, Mail, Upload, AlertCircle, User, IdCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitTaxAudit } from '../../services/businessServicesApi';

const TaxAudit = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', panNumber: '',
    businessName: '', turnover: '', auditType: '', financialYear: '',
    address: '', city: '', state: '', pincode: '',
    balanceSheet: null, profitLoss: null, bankStatements: null, gstReturns: null, panCard: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    const savedFormData = sessionStorage.getItem('tax_audit_form_data');
    const savedStep = sessionStorage.getItem('tax_audit_pending_step');
    
    if (savedFormData && token) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setApplicationForm(parsedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        sessionStorage.removeItem('tax_audit_form_data');
        sessionStorage.removeItem('tax_audit_pending_step');
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
      const response = await fetch('http://localhost:8000/api/corporate-inquiry/tax-audit', {
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
        toast.success(data.message || 'Thank you! Our tax expert will contact you soon.');
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
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format (e.g., ABCDE1234F)';
        break;
      case 'businessName':
        if (!value.trim()) error = 'Business name is required';
        break;
      case 'turnover':
        if (!value) error = 'Turnover is required';
        else if (isNaN(value) || parseFloat(value) <= 0) error = 'Invalid turnover amount';
        break;
      case 'auditType':
        if (!value) error = 'Audit type is required';
        break;
      case 'financialYear':
        if (!value) error = 'Financial year is required';
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
      default:
        break;
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
      ['businessName', 'turnover', 'auditType', 'financialYear'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 4) {
      // Validate required documents for step 4
      const requiredDocs = ['balanceSheet', 'profitLoss', 'bankStatements', 'panCard'];
      requiredDocs.forEach(docField => {
        if (!applicationForm[docField]) {
          stepErrors[docField] = `${docField.replace(/([A-Z])/g, ' $1').trim()} is required`;
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
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('tax_audit_pending_step', '2');
      sessionStorage.setItem('tax_audit_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your tax audit application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login?redirect=/services/tax-audit&step=2', {
        state: { from: '/services/tax-audit', returnStep: 2 }
      });
      return;
    }

    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix all errors before proceeding');
      return;
    }
    
    // Only move to next step, don't submit
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      
      const formSection = document.getElementById('application-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
    
    // Only allow submission on step 4
    if (currentStep !== 4) {
      console.log('Form submission prevented - not on step 4');
      return;
    }
    
    if (!isAuthenticated) {
      sessionStorage.setItem('tax_audit_pending_step', '4');
      sessionStorage.setItem('tax_audit_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/tax-audit&step=4', {
        state: { from: '/services/tax-audit', returnStep: 4 }
      });
      return;
    }
    
    // Validate ALL steps before submission
    let allErrors = {};
    for (let step = 1; step <= 4; step++) {
      const stepErrors = validateStep(step);
      allErrors = { ...allErrors, ...stepErrors };
    }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please fill all required fields in all steps before submitting');
      console.log('Validation errors:', allErrors);
      
      // Navigate to first step with errors
      if (Object.keys(validateStep(1)).length > 0) {
        setCurrentStep(1);
      } else if (Object.keys(validateStep(2)).length > 0) {
        setCurrentStep(2);
      } else if (Object.keys(validateStep(3)).length > 0) {
        setCurrentStep(3);
      } else if (Object.keys(validateStep(4)).length > 0) {
        setCurrentStep(4);
      }
      
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Call API to submit tax audit application
      const response = await submitTaxAudit(applicationForm);
      
      if (response.success) {
        setShowSuccessModal(true);
        toast.success('Tax audit application submitted successfully!');
        setApplicationForm({
          fullName: '', email: '', phone: '', panNumber: '',
          businessName: '', turnover: '', auditType: '', financialYear: '',
          address: '', city: '', state: '', pincode: '',
          balanceSheet: null, profitLoss: null, bankStatements: null, gstReturns: null, panCard: null
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
        <section id="application-form-section" className="py-4 sm:py-6 bg-gradient-to-br from-white via-green-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">Tax Audit Application</h2>
                <p className="text-green-50 text-center mt-2">Complete the form to get started with our tax audit services</p>
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

                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (currentStep === 4) { 
                    handleApplicationSubmit(e); 
                  } else {
                    console.log('Submit blocked - Current step:', currentStep);
                  }
                }} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><div className="relative"><FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter your full name" /></div>{errors.fullName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.fullName}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="your.email@example.com" /></div>{errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.email}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit mobile number" /></div>{errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.phone}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label><div className="relative"><FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="ABCDE1234F" maxLength="10" /></div>{errors.panNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.panNumber}</p>}</div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Business Details</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label><input type="text" name="businessName" value={applicationForm.businessName} onChange={handleApplicationChange} onBlur={() => handleBlur('businessName')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.businessName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter business name" />{errors.businessName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.businessName}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Annual Turnover (₹) *</label><input type="number" name="turnover" value={applicationForm.turnover} onChange={handleApplicationChange} onBlur={() => handleBlur('turnover')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.turnover ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter turnover amount" />{errors.turnover && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.turnover}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Audit Type *</label><select name="auditType" value={applicationForm.auditType} onChange={handleApplicationChange} onBlur={() => handleBlur('auditType')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.auditType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Type</option><option value="Tax Audit (44AB)">Tax Audit (44AB)</option><option value="Transfer Pricing Audit">Transfer Pricing Audit</option><option value="Special Audit">Special Audit</option><option value="Statutory Audit">Statutory Audit</option></select>{errors.auditType && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.auditType}</p>}</div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Financial Year *</label><input type="text" name="financialYear" value={applicationForm.financialYear} onChange={handleApplicationChange} onBlur={() => handleBlur('financialYear')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.financialYear ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="e.g., 2023-24" />{errors.financialYear && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.financialYear}</p>}</div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Address Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" /><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="3" className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter complete address"></textarea></div>{errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.address}</p>}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="City" />{errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.city}</p>}</div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="State" />{errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.state}</p>}</div></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><div className="relative"><FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="6-digit pincode" maxLength="6" /></div>{errors.pincode && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.pincode}</p>}</div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Document Uploads</h3>
                      <p className="text-sm text-gray-600 mb-4">Upload required documents (Max 5MB each, JPG/PNG/PDF only)</p>
                      {[{name: 'balanceSheet', label: 'Balance Sheet *', required: true},{name: 'profitLoss', label: 'Profit & Loss Statement *', required: true},{name: 'bankStatements', label: 'Bank Statements *', required: true},{name: 'gstReturns', label: 'GST Returns', required: false},{name: 'panCard', label: 'PAN Card Copy *', required: true}].map(doc => (
                        <div key={doc.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{doc.label}</label>
                          <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-green-500 transition-colors ${errors[doc.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                            <input type="file" name={doc.name} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id={doc.name} />
                            <label htmlFor={doc.name} className="cursor-pointer flex flex-col items-center">
                              <Upload className={`w-8 h-8 mb-2 ${errors[doc.name] ? 'text-red-400' : 'text-gray-400'}`} />
                              <span className={`text-sm ${applicationForm[doc.name] ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                {applicationForm[doc.name] ? `✓ ${applicationForm[doc.name].name}` : 'Click to upload or drag and drop'}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 5MB)</span>
                            </label>
                          </div>
                          {errors[doc.name] && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors[doc.name]}</p>}
                        </div>
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
              <div className="text-center"><CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" /><h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3><p className="text-gray-600 mb-6">Your tax audit application has been received. Our CA will review and contact you within 1-2 business days.</p><button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all">Close</button></div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full page mode - render complete page
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
        style={{
          backgroundImage: "url('https://media.istockphoto.com/id/1805461591/photo/group-of-confident-business-people-point-to-graphs-and-charts-to-analyze-market-data-balance.jpg?s=612x612&w=0&k=20&c=w8o74MqrsmSZxZqzyviuL-uHvWQsiKye5uh232-1yGU='), linear-gradient(135deg, #065f46 0%, #047857 100%)",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundBlendMode: 'overlay'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-800/75 via-green-700/70 to-teal-800/75"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-600/20 via-transparent to-teal-900/30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center">
            <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                Tax Audit <span className="text-yellow-300">Services</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                Professional tax audit services under Section 44AB. Expert Chartered Accountants ensure complete compliance and identify tax optimization opportunities.
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

      <div className="pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-100">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Tax Audit under Section 44AB of the Income Tax Act is mandatory for businesses and professionals exceeding 
                specified turnover limits. Our Chartered Accountants conduct thorough tax audits to ensure compliance and 
                identify opportunities for tax optimization.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Who Requires Tax Audit?</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Businesses</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Total sales/turnover/gross receipts exceed ₹1 crore (for business)</li>
                    <li>• Total sales/turnover/gross receipts exceed ₹10 crore (if 95% receipts are digital and 95% payments are digital)</li>
                    <li>• Claiming presumptive taxation but profit is less than 8%/6%</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-green-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Professionals</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Gross receipts exceed ₹50 lakhs in a financial year</li>
                    <li>• Claiming presumptive taxation under Section 44ADA but profit is less than 50%</li>
                    <li>• Applies to doctors, lawyers, CAs, architects, engineers, consultants, etc.</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Cases</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Claiming deductions under Section 10A, 10AA, 10B, 80-IA to 80-IE</li>
                    <li>• Engaged in international transactions (transfer pricing)</li>
                    <li>• Directed by Assessing Officer for specific reasons</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Tax Audit Services</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Comprehensive review of books of accounts and financial statements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Verification of income, expenses, and tax deductions claimed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Preparation of Form 3CD (Tax Audit Report)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Form 3CA/3CB certification (if applicable)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Identification of tax-saving opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Compliance check with various provisions of Income Tax Act</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Digital signature and e-filing of tax audit report</span>
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Key Areas We Examine</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="font-semibold text-gray-900 mb-2">📊 Financial Accuracy</p>
                  <p className="text-gray-700 text-sm">Balance sheet, P&L account, and cash flow verification</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="font-semibold text-gray-900 mb-2">💰 Revenue Recognition</p>
                  <p className="text-gray-700 text-sm">Sales, turnover, and gross receipts validation</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="font-semibold text-gray-900 mb-2">📝 Expense Verification</p>
                  <p className="text-gray-700 text-sm">Allowability and genuineness of claimed expenses</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="font-semibold text-gray-900 mb-2">🔍 TDS Compliance</p>
                  <p className="text-gray-700 text-sm">TDS deducted and deposited correctly</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="font-semibold text-gray-900 mb-2">🏦 Loan & Advance</p>
                  <p className="text-gray-700 text-sm">Scrutiny of loans taken or given</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="font-semibold text-gray-900 mb-2">📈 Capital Gains</p>
                  <p className="text-gray-700 text-sm">Sale of assets and capital gain computation</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Documents Required</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Complete books of accounts (ledgers, journals, cash book)</li>
                  <li>• Bank statements for all accounts</li>
                  <li>• Purchase and sales invoices</li>
                  <li>• Stock register and inventory records</li>
                  <li>• Fixed asset register</li>
                  <li>• TDS certificates and payment challans</li>
                  <li>• GST returns filed</li>
                  <li>• Previous year's ITR and tax audit report</li>
                </ul>
              </div>

              <div className="mt-6 p-6 bg-red-50 rounded-xl border-l-4 border-red-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">⚠ Due Date</h3>
                <p className="text-gray-700">
                  <strong>30th September</strong> of the assessment year (along with ITR filing)
                  <br />
                  <strong>Penalty for late filing:</strong> 0.5% of total sales/turnover/gross receipts or ₹1.5 lakhs, whichever is lower
                </p>
              </div>
            </div>
          </div>

          {/* Application Form Section */}
          <section id="application-form-section" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-green-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">Tax Audit Application</h2>
                  <p className="text-green-50 text-center mt-2">Complete the form to get started with our tax audit services</p>
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

                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (currentStep === 4) { 
                      handleApplicationSubmit(e); 
                    } else {
                      console.log('Submit blocked - Current step:', currentStep);
                    }
                  }} className="space-y-6">
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><div className="relative"><FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter your full name" /></div>{errors.fullName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.fullName}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="your.email@example.com" /></div>{errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.email}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit mobile number" /></div>{errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.phone}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label><div className="relative"><FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="ABCDE1234F" maxLength="10" /></div>{errors.panNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.panNumber}</p>}</div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Business Details</h3>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label><input type="text" name="businessName" value={applicationForm.businessName} onChange={handleApplicationChange} onBlur={() => handleBlur('businessName')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.businessName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter business name" />{errors.businessName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.businessName}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Annual Turnover (₹) *</label><input type="number" name="turnover" value={applicationForm.turnover} onChange={handleApplicationChange} onBlur={() => handleBlur('turnover')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.turnover ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter turnover amount" />{errors.turnover && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.turnover}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Audit Type *</label><select name="auditType" value={applicationForm.auditType} onChange={handleApplicationChange} onBlur={() => handleBlur('auditType')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.auditType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Type</option><option value="Tax Audit (44AB)">Tax Audit (44AB)</option><option value="Transfer Pricing Audit">Transfer Pricing Audit</option><option value="Special Audit">Special Audit</option><option value="Statutory Audit">Statutory Audit</option></select>{errors.auditType && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.auditType}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Financial Year *</label><input type="text" name="financialYear" value={applicationForm.financialYear} onChange={handleApplicationChange} onBlur={() => handleBlur('financialYear')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.financialYear ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="e.g., 2023-24" />{errors.financialYear && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.financialYear}</p>}</div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Address Information</h3>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" /><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="3" className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter complete address"></textarea></div>{errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.address}</p>}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="City" />{errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.city}</p>}</div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="State" />{errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.state}</p>}</div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><div className="relative"><FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="6-digit pincode" maxLength="6" /></div>{errors.pincode && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.pincode}</p>}</div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Document Uploads</h3>
                        <p className="text-sm text-gray-600 mb-4">Upload required documents (Max 5MB each, JPG/PNG/PDF only)</p>
                        {[{name: 'balanceSheet', label: 'Balance Sheet *', required: true},{name: 'profitLoss', label: 'Profit & Loss Statement *', required: true},{name: 'bankStatements', label: 'Bank Statements *', required: true},{name: 'gstReturns', label: 'GST Returns', required: false},{name: 'panCard', label: 'PAN Card Copy *', required: true}].map(doc => (
                          <div key={doc.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{doc.label}</label>
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-green-500 transition-colors ${errors[doc.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                              <input type="file" name={doc.name} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id={`full-${doc.name}`} />
                              <label htmlFor={`full-${doc.name}`} className="cursor-pointer flex flex-col items-center">
                                <Upload className={`w-8 h-8 mb-2 ${errors[doc.name] ? 'text-red-400' : 'text-gray-400'}`} />
                                <span className={`text-sm ${applicationForm[doc.name] ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                  {applicationForm[doc.name] ? `✓ ${applicationForm[doc.name].name}` : 'Click to upload or drag and drop'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 5MB)</span>
                              </label>
                            </div>
                            {errors[doc.name] && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors[doc.name]}</p>}
                          </div>
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
                <div className="text-center"><CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" /><h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3><p className="text-gray-600 mb-6">Your tax audit application has been received. Our CA will review and contact you within 1-2 business days.</p><button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all">Close</button></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rest of the page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
            {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <FaFileInvoice className="text-4xl text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Comprehensive Audit</h3>
            <p className="text-gray-600">Detailed review of all financial records</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <FaCalculator className="text-4xl text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tax Optimization</h3>
            <p className="text-gray-600">Identify opportunities to reduce tax liability</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <FaCheckCircle className="text-4xl text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Compliance Ensured</h3>
            <p className="text-gray-600">Full adherence to Section 44AB requirements</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <FaChartLine className="text-4xl text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Expert CAs</h3>
            <p className="text-gray-600">Qualified Chartered Accountants handle your audit</p>
          </div>
        </div>

        {/* Who Needs Tax Audit Section */}
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-center text-gray-800">Who Needs Tax Audit?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
              <h3 className="text-xl font-bold text-green-700 mb-4">Business</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Turnover exceeds ₹1 crore (from FY 2016-17 onwards)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Turnover exceeds ₹10 crore (cash transactions ≤ 5%)</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
              <h3 className="text-xl font-bold text-green-700 mb-4">Profession</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Gross receipts exceed ₹50 lakhs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Applicable to doctors, lawyers, consultants, etc.</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Due Date Section */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
              Important: Tax Audit Due Date
            </h3>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-gray-700">
                <strong>30th September</strong> of the assessment year (along with ITR filing)
                <br />
                <strong>Penalty for late filing:</strong> 0.5% of total sales/turnover/gross receipts or ₹1.5 lakhs, whichever is lower
              </p>
            </div>
          </div>
        </div>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSuccessModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all" onClick={e => e.stopPropagation()}>
              <div className="text-center"><CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" /><h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3><p className="text-gray-600 mb-6">Your tax audit application has been received. Our CA will review and contact you within 1-2 business days.</p><button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all">Close</button></div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gray-800">Need Tax Audit Services?</h2>
            <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Get professional tax audit services from expert CAs. Ensure compliance and optimize your tax position.
            </p>
            <button
              onClick={handleContactClick}
              className="inline-block bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold px-8 md:px-12 py-4 md:py-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base md:text-lg"
            >
              Contact Us Now →
            </button>
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

export default TaxAudit;
