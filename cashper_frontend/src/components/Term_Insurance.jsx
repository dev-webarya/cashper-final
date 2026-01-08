import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import termInsuranceApi from '../services/termInsuranceApi';
import { 
  Upload, 
  X, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Users,
  Home,
  MapPin,
  IdCard,
  CreditCard,
  Shield,
  Heart,
  IndianRupee,
  Briefcase
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const Term_Insurance = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  
  // Handle navigation to contact page with scroll to hero section
  const handleContactNavigation = () => {
    navigate('/contact');
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };
  
  // Hero form state (separate from application form)
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    coverage: '',
    term: ''
  });

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);
  const [heroFormErrors, setHeroFormErrors] = useState({});
  
  // Application form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    coverage: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    occupation: '',
    annualIncome: '',
    smokingHabits: '',
    nomineeRelation: '',
    applicationNumber: ''
  });

  const [documents, setDocuments] = useState({
    aadhar: null,
    pan: null,
    photo: null,
    incomeProof: null,
    medicalReports: null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  // Hero form change handler
  const handleHeroFormChange = (e) => {
    setHeroFormData({
      ...heroFormData,
      [e.target.name]: e.target.value
    });
  };

  // Hero form submit handler
  const handleHeroFormSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setHeroFormErrors({});
    
    // Validation
    const errors = {};
    
    if (!heroFormData.name.trim()) {
      errors.name = true;
      toast.error('Please enter your name');
    }
    
    if (!heroFormData.email.trim()) {
      errors.email = true;
      toast.error('Please enter your email address');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(heroFormData.email)) {
      errors.email = true;
      toast.error('Please enter a valid email address');
    }
    
    if (!heroFormData.phone.trim()) {
      errors.phone = true;
      toast.error('Please enter your phone number');
    } else if (!/^[0-9]{10}$/.test(heroFormData.phone.replace(/\D/g, ''))) {
      errors.phone = true;
      toast.error('Please enter a valid 10-digit phone number');
    }
    
    if (!heroFormData.age) {
      errors.age = true;
      toast.error('Please enter your age');
    } else if (heroFormData.age < 18 || heroFormData.age > 65) {
      errors.age = true;
      toast.error('Age must be between 18 and 65 years for term insurance');
    }
    
    if (!heroFormData.coverage) {
      errors.coverage = true;
      toast.error('Please enter coverage amount');
    }
    
    if (!heroFormData.term) {
      errors.term = true;
      toast.error('Please enter policy term');
    } else if (heroFormData.term < 5 || heroFormData.term > 40) {
      errors.term = true;
      toast.error('Policy term must be between 5 and 40 years');
    }
    
    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      setHeroFormErrors(errors);
      return;
    }

    setIsSubmittingHero(true);
    try {
      const response = await termInsuranceApi.submitContactInquiry({
        ...heroFormData,
        age: parseInt(heroFormData.age),
        term: parseInt(heroFormData.term)
      });
      toast.success(response.message || 'Thank you! Our advisor will contact you soon.');
      
      // Reset form
      setHeroFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        coverage: '',
        term: ''
      });
      setHeroFormErrors({});
    } catch (error) {
      console.error('Term insurance inquiry error:', error);
      toast.error(error.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmittingHero(false);
    }
  };

  // Application form handler
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }));
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.name.trim()) {
          toast.error('⚠️ Full name is required');
          return false;
        }
        if (formData.name.trim().length < 3) {
          toast.error('⚠️ Please enter a valid full name (minimum 3 characters)');
          return false;
        }
        if (!formData.email || !formData.email.trim()) {
          toast.error('⚠️ Email address is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('⚠️ Please enter a valid email address');
          return false;
        }
        if (!formData.phone || !formData.phone.trim()) {
          toast.error('⚠️ Phone number is required');
          return false;
        }
        if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          toast.error('⚠️ Please enter a valid 10-digit phone number');
          return false;
        }
        if (!formData.age) {
          toast.error('⚠️ Age is required');
          return false;
        }
        if (formData.age < 18 || formData.age > 65) {
          toast.error('⚠️ Age must be between 18 and 65 years');
          return false;
        }
        if (!formData.gender || formData.gender === '') {
          toast.error('⚠️ Gender selection is required');
          return false;
        }
        if (!formData.occupation || !formData.occupation.trim()) {
          toast.error('⚠️ Occupation is required');
          return false;
        }
        if (!formData.annualIncome || formData.annualIncome === '') {
          toast.error('⚠️ Annual income is required');
          return false;
        }
        if (!formData.smokingHabits || formData.smokingHabits === '') {
          toast.error('⚠️ Smoking habits is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.coverage || formData.coverage === '') {
          toast.error('⚠️ Life cover amount is required');
          return false;
        }
        if (!formData.nomineeRelation || formData.nomineeRelation === '') {
          toast.error('⚠️ Nominee relation is required');
          return false;
        }
        return true;
      case 3:
        if (!formData.address || !formData.address.trim()) {
          toast.error('⚠️ Address is required');
          return false;
        }
        if (!formData.city || !formData.city.trim()) {
          toast.error('⚠️ City is required');
          return false;
        }
        if (!formData.state || !formData.state.trim()) {
          toast.error('⚠️ State is required');
          return false;
        }
        if (!formData.pincode || !formData.pincode.trim()) {
          toast.error('⚠️ PIN code is required');
          return false;
        }
        if (!/^[0-9]{6}$/.test(formData.pincode)) {
          toast.error('⚠️ Please enter a valid 6-digit PIN code');
          return false;
        }
        return true;
      case 4:
        // At least one document must be uploaded
        const hasAnyDocument = documents.aadhar || documents.pan || documents.photo || documents.incomeProof || documents.medicalReports;
        if (!hasAnyDocument) {
          toast.error('⚠️ Please upload at least one document to proceed');
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      const newCompleted = [...completedSteps];
      if (!newCompleted.includes(currentStep)) {
        newCompleted.push(currentStep);
      }
      setCompletedSteps(newCompleted);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmittingApplication(true);
    try {
      // Prepare application data
      const applicationData = {
        ...formData,
        age: parseInt(formData.age),
        term: parseInt(formData.term) || 20, // default term if not set
        smokingStatus: formData.smokingHabits || 'no',
        existingConditions: formData.existingConditions || null
      };

      // Remove fields not needed
      delete applicationData.applicationNumber;
      delete applicationData.smokingHabits;

      // Submit application
      const response = await termInsuranceApi.submitTermInsuranceApplication(applicationData, documents);
      
      // Show success and move to step 5
      toast.success(response.message || 'Application submitted successfully!');
      setCompletedSteps([...completedSteps, 4]);
      setCurrentStep(5);
      
      // Store application number for display
      if (response.applicationNumber) {
        setFormData(prev => ({ ...prev, applicationNumber: response.applicationNumber }));
      }
    } catch (error) {
      console.error('Term insurance application error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };
  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };
  const scrollToApplyForm = () => {
    const element = document.getElementById('apply-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const faqs = [
    {
      question: "Who should consider buying a term insurance plan?",
      answer: "Anyone with financial dependents—such as a spouse, children, or aging parents—should strongly consider buying a term insurance policy. It ensures your family continues to meet essential expenses and long-term goals, even in your absence. Ideally, term insurance should be purchased before starting other investments."
    },
    {
      question: "Are term insurance claims actually settled?",
      answer: "Yes, term insurance claims are settled when all policy terms and conditions are met. Leading insurers have high claim settlement ratios, typically above 95%. It's important to choose a reputable insurer with a strong claim settlement track record and ensure all policy documentation is accurate and complete."
    },
    {
      question: "Why do some term insurance claims get rejected?",
      answer: "Claims may be rejected due to non-disclosure of pre-existing conditions, incorrect information in the application, policy lapse due to non-payment of premiums, or death during the waiting period. To avoid rejection, always provide accurate information and maintain your policy by paying premiums on time."
    },
    {
      question: "Should I buy a term insurance policy online or through an advisor?",
      answer: "Both options have merits. Online purchases offer convenience and competitive pricing, while advisors provide personalized guidance, help assess your exact coverage needs, and assist with claims. For complex financial situations or if you're unsure about coverage amounts, consulting an advisor is recommended."
    },
    {
      question: "How is term insurance different from other life insurance policies?",
      answer: "Term insurance provides pure protection with high coverage at low premiums without any investment component. Traditional life insurance policies combine insurance with investment, resulting in higher premiums and lower coverage. If your primary goal is protection, term insurance is the most cost-effective choice."
    }
  ];

  const keyFactors = [
    {
      icon: "💰",
      title: "Human Life Value",
      description: "Calculate the ideal coverage to ensure all future needs (like kids' education or household costs) are met."
    },
    {
      icon: "📅",
      title: "Policy Term Duration",
      description: "Do you want coverage until age 60, 65, or lifelong? The premium and policy term will differ accordingly."
    },
    {
      icon: "💳",
      title: "Premium Flexibility",
      description: "Look for options like limited-pay or single-pay that reduce the risk of policy lapse."
    },
    {
      icon: "🛡️",
      title: "Add-on Riders",
      description: "Choose relevant riders (critical illness, accidental death, waiver of premium) for extra safety."
    },
    {
      icon: "✅",
      title: "Claim Settlement Ratio",
      description: "Check the insurer's performance in settling claims over the last 5 years."
    },
    {
      icon: "⏱️",
      title: "Days to Claim Settlement",
      description: "Find out how long insurers take to process and release claim payouts."
    }
  ];

  const benefits = [
    {
      icon: "🎯",
      title: "Pure Protection Plan",
      description: "High sum assured at low premiums"
    },
    {
      icon: "🏥",
      title: "Critical Illness Rider",
      description: "Enhanced health-related coverage"
    },
    {
      icon: "💵",
      title: "Income Tax Benefits",
      description: "Under Section 80C and 10(10D)"
    },
    {
      icon: "🚑",
      title: "Accidental Death Benefit",
      description: "Additional security for your family"
    }
  ];

  const whyChooseUs = [
    {
      icon: "🧮",
      title: "Smart Tools",
      description: "Our term insurance calculator makes decision-making easy"
    },
    {
      icon: "📊",
      title: "Regular Review",
      description: "Tracking of your term insurance benefits"
    },
    {
      icon: "💸",
      title: "Multiple Payout Options",
      description: "Flexible death claim payout structures"
    },
    {
      icon: "🎓",
      title: "Unbiased Recommendations",
      description: "Objective advice based on your unique profile"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {!isPopupMode && <Navbar />}
      
      {!isPopupMode && (
      <>
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'scroll',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-700/60 to-blue-800/50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center">
            <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                Safeguard Your Family's Financial Future
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-100">
                Secure your loved ones with our trusted term insurance plans. Get expert guidance to find the perfect coverage for your needs.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center md:justify-start pt-2">
                <button 
                  onClick={handleContactNavigation}
                  className="bg-white text-green-700 px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-xs sm:text-sm md:text-base">
                  Get Expert Advice Now
                </button>
                <button 
                  onClick={scrollToApplyForm}
                  className="border-2 border-white text-white px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-xs sm:text-sm md:text-base">
                  Calculate Premium
                </button>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 md:p-5 mt-6 md:mt-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                GET IN TOUCH
              </h3>
              <form onSubmit={handleHeroFormSubmit} className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={heroFormData.name}
                  onChange={handleHeroFormChange}
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.name ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={heroFormData.email}
                  onChange={handleHeroFormChange}
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.email ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={heroFormData.phone}
                  onChange={handleHeroFormChange}
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Your Age (18-65) *"
                  value={heroFormData.age}
                  onChange={handleHeroFormChange}
                  min="18"
                  max="65"
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.age ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
                <input
                  type="text"
                  name="coverage"
                  placeholder="Coverage (e.g., 10000000 for 1 Cr) *"
                  value={heroFormData.coverage}
                  onChange={handleHeroFormChange}
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.coverage ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
                <input
                  type="number"
                  name="term"
                  placeholder="Policy Term (5-40 years) *"
                  value={heroFormData.term}
                  onChange={handleHeroFormChange}
                  min="5"
                  max="40"
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.term ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
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

      {/* What is Term Insurance */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left order-2 md:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                What is Term Insurance?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Think of term insurance as income replacement. You pay a small premium for a large coverage amount. In the unfortunate event of the policyholder's passing, the nominee receives the sum assured as a death benefit. This money acts as a financial cushion, supporting your family's daily expenses, loan EMIs, education costs, and more.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Whether you're considering term health insurance or a pure protection plan, the core objective remains—financial stability for your loved ones when you're not around.
              </p>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=600" 
                  alt="Family Protection" 
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Term Insurance */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Why Should You Choose Term Insurance?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              A term insurance plan is one of the most affordable and effective tools for risk management. It ensures financial protection without mixing investment goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{benefit.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12 px-3">
            <p className="text-base sm:text-lg md:text-xl text-gray-700 font-semibold">
              If you're looking for the best term insurance plan, opt for one that matches your life stage and risk coverage needs.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Why Choose Us as Your Term Insurance Advisor?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              At Cashper, we blend technology with personal advice to help you select the most suitable term health insurance or life protection plan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-green-50 to-green-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{item.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <button 
              onClick={handleContactNavigation}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base md:text-lg">
              Get Expert Advice Now
            </button>
          </div>
        </div>
      </section>

      {/* Key Factors */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-green-50 to-green-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Key Factors to Consider Before Buying a Term Insurance Cover
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Making the right choice in health insurance term plans or term insurance policies requires looking at more than just the premium. Here's what to assess:
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {keyFactors.map((factor, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{factor.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                  {factor.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Term vs Life Insurance */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-2">
              How is Term Insurance Different from Other Life Insurance Policies?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-3">
              When comparing term insurance vs life insurance, the key difference lies in cost and coverage:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-green-300">
              <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 sm:mb-6 flex items-center">
                <span className="text-3xl sm:text-4xl mr-2 sm:mr-3">✓</span>
                Term Insurance
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <span className="text-green-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">•</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    <span className="font-semibold">Lower premium, higher coverage</span> - Get ₹1 Crore coverage for around ₹8,000/year
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">•</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    Pure protection without investment component
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">•</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    Most cost-effective way to secure family's financial well-being
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-gray-300">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <span className="text-3xl sm:text-4xl mr-2 sm:mr-3">↓</span>
                Traditional Life Insurance
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <span className="text-gray-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">•</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    <span className="font-semibold">Higher premium, lower coverage</span> - ₹1 lakh premium may give only ₹10 lakh coverage
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">•</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    Combines insurance with investment
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">•</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    Lower coverage due to investment component
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12 px-3">
            <p className="text-base sm:text-lg md:text-xl text-gray-700 font-semibold max-w-3xl mx-auto">
              So, if your main goal is protection, not investment, go for a pure term insurance plan—the best way to secure your family's financial well-being.
            </p>
          </div>
        </div>
      </section>

      {/* Required Documents Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <FileText className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-semibold">Documents Required</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Documents Needed for Term Insurance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keep these documents ready for a smooth application process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Document 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white p-3 rounded-xl">
                  <IdCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Identity Proof</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Valid government-issued ID for verification
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Aadhar Card (Mandatory)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      PAN Card (Mandatory)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Passport / Driving License
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 2 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white p-3 rounded-xl">
                  <Home className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Address Proof</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Current residential address verification
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Aadhar Card
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Utility Bills (recent)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Passport / Bank Statement
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white p-3 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Age Proof</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Date of birth verification documents
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      Birth Certificate
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      PAN Card / Aadhar Card
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      School Leaving Certificate
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white p-3 rounded-xl">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Income Proof</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Financial status verification documents
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                      Salary Slips (last 3 months)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                      Bank Statements (6 months)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                      ITR / Form 16
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 5 */}
            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
              <div className="flex items-start gap-4">
                <div className="bg-red-600 text-white p-3 rounded-xl">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Reports</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Health assessment documents (if required)
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      Medical Test Reports
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      Health Check-up Reports
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      Medical History (if any)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 6 */}
            <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100">
              <div className="flex items-start gap-4">
                <div className="bg-teal-600 text-white p-3 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Photographs</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Recent passport-size photographs
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                      2-3 Passport Size Photos
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                      White Background
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                      Recent (within 6 months)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Step Application Form Section */}
      </>
      )}

      <section id="apply-form" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <FileText className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-semibold">Application Form</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Apply for Term Insurance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete your application in 4 simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      currentStep === step 
                        ? 'bg-green-600 text-white shadow-lg scale-110' 
                        : completedSteps.includes(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {completedSteps.includes(step) ? <CheckCircle className="w-6 h-6" /> : step}
                    </div>
                    <div className={`mt-2 text-xs sm:text-sm font-semibold text-center ${
                      currentStep === step ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step === 1 && 'Personal'}
                      {step === 2 && 'Coverage'}
                      {step === 3 && 'Address'}
                      {step === 4 && 'Documents'}
                    </div>
                  </div>
                  {step < 4 && (
                    <div className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                      completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <User className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                      <p className="text-gray-600 text-sm">Tell us about yourself</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-green-600" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-600" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Your age"
                        required
                        min="18"
                        max="65"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-green-600" />
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        Occupation *
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Your occupation"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        Annual Income *
                      </label>
                      <select
                        name="annualIncome"
                        value={formData.annualIncome}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select income range</option>
                        <option value="3-5">₹3-5 Lakhs</option>
                        <option value="5-10">₹5-10 Lakhs</option>
                        <option value="10-15">₹10-15 Lakhs</option>
                        <option value="15-25">₹15-25 Lakhs</option>
                        <option value="25+">₹25 Lakhs+</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-600" />
                        Smoking Habits *
                      </label>
                      <select
                        name="smokingHabits"
                        value={formData.smokingHabits}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select</option>
                        <option value="non-smoker">Non-Smoker</option>
                        <option value="smoker">Smoker</option>
                        <option value="occasional">Occasional Smoker</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Coverage Details */}
              {currentStep === 2 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Shield className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Coverage Details</h3>
                      <p className="text-gray-600 text-sm">Choose your life cover amount</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        Life Cover Amount *
                      </label>
                      <select
                        name="coverage"
                        value={formData.coverage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select coverage amount</option>
                        <option value="25">₹25 Lakhs</option>
                        <option value="50">₹50 Lakhs</option>
                        <option value="75">₹75 Lakhs</option>
                        <option value="100">₹1 Crore</option>
                        <option value="150">₹1.5 Crores</option>
                        <option value="200">₹2 Crores</option>
                        <option value="300">₹3 Crores</option>
                        <option value="500">₹5 Crores</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        Nominee Relation *
                      </label>
                      <select
                        name="nomineeRelation"
                        value={formData.nomineeRelation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select nominee relation</option>
                        <option value="spouse">Spouse</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="son">Son</option>
                        <option value="daughter">Daughter</option>
                        <option value="sibling">Brother/Sister</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="text-green-600" />
                        Key Benefits of Term Insurance:
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">100% Sum Assured on Death</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Tax Benefits under 80C & 10(10D)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Affordable Premium Rates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Financial Security for Family</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Optional Riders Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Online Policy Management</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address Information */}
              {currentStep === 3 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <MapPin className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Address Information</h3>
                      <p className="text-gray-600 text-sm">Your current residential address</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4 text-green-600" />
                        Full Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="House/Flat No., Street, Locality"
                        rows="3"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Your city"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Your state"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="6-digit PIN code"
                        required
                        maxLength="6"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents Upload */}
              {currentStep === 4 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <FileText className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Upload Documents</h3>
                      <p className="text-gray-600 text-sm">Please upload clear copies of required documents</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { key: 'aadhar', label: 'Aadhar Card', icon: <IdCard className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB' },
                      { key: 'pan', label: 'PAN Card', icon: <CreditCard className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB' },
                      { key: 'photo', label: 'Passport Size Photo', icon: <User className="w-12 h-12" />, accept: '.jpg,.jpeg,.png', size: '2MB' },
                      { key: 'incomeProof', label: 'Income Proof', icon: <IndianRupee className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '10MB' },
                      { key: 'medicalReports', label: 'Medical Reports', icon: <Heart className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '10MB', note: 'If required' }
                    ].map((doc) => (
                      <div key={doc.key} className="relative">
                        <label className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300 block ${
                          documents[doc.key] 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-blue-400 bg-white'
                        }`}>
                          <input
                            type="file"
                            accept={doc.accept}
                            onChange={(e) => handleFileUpload(e, doc.key)}
                            className="hidden"
                          />
                          <div className="text-center">
                            <div className={`mx-auto mb-4 ${documents[doc.key] ? 'text-green-600' : 'text-gray-400'}`}>
                              {doc.icon}
                            </div>
                            <div className="text-gray-900 font-bold mb-1 text-lg">{doc.label}</div>
                            <div className="text-sm text-gray-500 mb-1">
                              {doc.note && <div className="font-medium text-green-600">{doc.note}</div>}
                              Formats: {doc.accept.replace(/\./g, '').toUpperCase()} (Max {doc.size})
                            </div>
                            {documents[doc.key] ? (
                              <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold">
                                <CheckCircle className="w-5 h-5" />
                                {documents[doc.key].name}
                              </div>
                            ) : (
                              <div className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                <Upload className="w-4 h-4" />
                                Choose File
                              </div>
                            )}
                          </div>
                        </label>
                        {documents[doc.key] && (
                          <button
                            type="button"
                            onClick={() => setDocuments(prev => ({ ...prev, [doc.key]: null }))}
                            className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Important:</strong> All documents should be clear and readable. Medical tests will be 
                        scheduled based on your age and coverage amount. Smokers may require additional health assessments. 
                        Original documents may be verified by our representative.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Step */}
              {currentStep === 5 && (
                <div className="text-center py-12 animate-fadeInUp">
                  <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Thank you for applying! Your application reference number is <strong className="text-green-600">#TI{Date.now().toString().slice(-8)}</strong>
                  </p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">What happens next?</h4>
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                        <div>
                          <div className="font-semibold text-gray-900">Document Verification</div>
                          <div className="text-gray-600 text-sm">Our team will verify your documents within 24-48 hours</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                        <div>
                          <div className="font-semibold text-gray-900">Medical Examination</div>
                          <div className="text-gray-600 text-sm">Free medical tests will be scheduled at your convenient time and location</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                        <div>
                          <div className="font-semibold text-gray-900">Premium Quote</div>
                          <div className="text-gray-600 text-sm">Customized premium calculation based on your profile and medical report</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                        <div>
                          <div className="font-semibold text-gray-900">Policy Issuance</div>
                          <div className="text-gray-600 text-sm">Policy will be issued within 3-5 days after premium payment</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setCurrentStep(1);
                        setCompletedSteps([]);
                        setFormData({
                          name: '', email: '', phone: '', age: '', coverage: '',
                          gender: '', address: '', city: '', state: '', pincode: '',
                          occupation: '', annualIncome: '', smokingHabits: '', nomineeRelation: ''
                        });
                        setDocuments({ aadhar: null, pan: null, photo: null, incomeProof: null, medicalReports: null });
                      }}
                      className="bg-white text-green-600 border-2 border-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2"
                    >
                      Apply for Another Policy
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 5 && (
                <div className="flex items-center justify-between mt-10 pt-8 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentStep === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Submit Application
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-3">
              Get answers to common questions about term insurance
            </p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 pr-4 sm:pr-6 md:pr-8">
                    {faq.question}
                  </h3>
                  <span className="text-xl sm:text-2xl text-green-600 flex-shrink-0">
                    {activeAccordion === index ? '−' : '+'}
                  </span>
                </button>
                {activeAccordion === index && (
                  <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-r from-green-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            Ready to Protect Your Family's Future?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-blue-100 px-3">
            Get personalized term insurance recommendations from our expert advisors today
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <button 
              onClick={scrollToApplyForm}
              className="bg-white text-green-700 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base md:text-lg">
              Get Started Now
            </button>
            <button 
              onClick={handleContactNavigation}
              className="border-2 border-white text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-sm sm:text-base md:text-lg">
              Talk to Expert
            </button>
          </div>
        </div>
      </section>

      {!isPopupMode && <Footer />}
    </div>
  );
};

export default Term_Insurance;

