import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import motorInsuranceApi from '../services/motorInsuranceApi';
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
  Car,
  Home,
  MapPin,
  IdCard,
  CreditCard,
  Shield,
  Wrench,
  FileCheck
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const Moter_Insurance = ({ isPopupMode = false, onPopupClose }) => {
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
    vehicleType: '',
    vehicleModel: '',
    registrationNumber: ''
  });

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);
  const [heroFormErrors, setHeroFormErrors] = useState({});
  
  // Application form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    vehicleType: '',
    registrationNumber: '',
    makeModel: '',
    manufacturingYear: '',
    vehicleValue: '',
    policyType: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    applicationNumber: ''
  });

  const [documents, setDocuments] = useState({
    rc: null,
    dl: null,
    vehiclePhotos: null,
    previousPolicy: null,
    addressProof: null
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
    } else if (heroFormData.age < 18 || heroFormData.age > 100) {
      errors.age = true;
      toast.error('Age must be between 18 and 100 years');
    }
    
    if (!heroFormData.vehicleType) {
      errors.vehicleType = true;
      toast.error('Please select vehicle type');
    }
    
    if (!heroFormData.vehicleModel.trim()) {
      errors.vehicleModel = true;
      toast.error('Please enter vehicle model');
    }
    
    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      setHeroFormErrors(errors);
      return;
    }

    setIsSubmittingHero(true);
    try {
      const response = await motorInsuranceApi.submitContactInquiry({
        ...heroFormData,
        age: parseInt(heroFormData.age)
      });
      toast.success(response.message || 'Thank you! Our advisor will contact you soon.');
      
      // Reset form
      setHeroFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        vehicleType: '',
        vehicleModel: '',
        registrationNumber: ''
      });
      setHeroFormErrors({});
    } catch (error) {
      console.error('Motor insurance inquiry error:', error);
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
        if (!formData.vehicleType || formData.vehicleType === '') {
          toast.error('⚠️ Vehicle type is required');
          return false;
        }
        if (!formData.registrationNumber || !formData.registrationNumber.trim()) {
          toast.error('⚠️ Vehicle registration number is required');
          return false;
        }
        if (!formData.makeModel || !formData.makeModel.trim()) {
          toast.error('⚠️ Vehicle make and model is required');
          return false;
        }
        if (!formData.manufacturingYear) {
          toast.error('⚠️ Manufacturing year is required');
          return false;
        }
        if (formData.manufacturingYear < 1990 || formData.manufacturingYear > new Date().getFullYear()) {
          toast.error('⚠️ Please enter a valid manufacturing year');
          return false;
        }
        if (!formData.vehicleValue || formData.vehicleValue === '') {
          toast.error('⚠️ Vehicle value is required');
          return false;
        }
        return true;
      case 2:
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
        if (formData.age < 18 || formData.age > 75) {
          toast.error('⚠️ Age must be between 18 and 75 years');
          return false;
        }
        if (!formData.policyType || formData.policyType === '') {
          toast.error('⚠️ Policy type is required');
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
        const hasAnyDocumentMotor = documents.rc || documents.dl || documents.vehiclePhotos || documents.previousPolicy || documents.addressProof;
        if (!hasAnyDocumentMotor) {
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
        manufacturingYear: parseInt(formData.manufacturingYear),
        vehicleValue: parseFloat(formData.vehicleValue),
        policyType: formData.policyType
      };

      // Remove fields not needed
      delete applicationData.applicationNumber;

      // Submit application
      const response = await motorInsuranceApi.submitMotorInsuranceApplication(applicationData, documents);
      
      // Show success and move to step 5
      toast.success(response.message || 'Application submitted successfully!');
      setCompletedSteps([...completedSteps, 4]);
      setCurrentStep(5);
      
      // Store application number for display
      if (response.applicationNumber) {
        setFormData(prev => ({ ...prev, applicationNumber: response.applicationNumber }));
      }
    } catch (error) {
      console.error('Motor insurance application error:', error);
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
      question: "What is the difference between Third-Party and Comprehensive Motor Insurance?",
      answer: "Third-Party insurance covers damages to third-party property and injuries, which is mandatory by law. Comprehensive insurance covers both third-party liabilities and damages to your own vehicle due to accidents, theft, fire, natural calamities, and more. It provides complete protection for your vehicle."
    },
    {
      question: "Is motor insurance mandatory in India?",
      answer: "Yes, having at least Third-Party motor insurance is mandatory by law in India. Driving without valid insurance can lead to heavy fines of up to ₹2,000 and imprisonment for up to 3 months. It's recommended to opt for comprehensive coverage for complete vehicle protection."
    },
    {
      question: "What factors affect my motor insurance premium?",
      answer: "Several factors influence your premium: vehicle make and model (premium cars have higher premiums), age of the vehicle, engine capacity (higher CC means higher premium), city of registration (metro cities have higher rates), your age and driving experience, claim history (No Claim Bonus can reduce premium by up to 50%), add-on covers selected, and the IDV (Insured Declared Value) of your vehicle."
    },
    {
      question: "What is No Claim Bonus (NCB) and how does it work?",
      answer: "NCB is a discount reward given by insurers for not making any claims during the policy period. It starts at 20% for the first claim-free year and can go up to 50% after 5 consecutive claim-free years. NCB is associated with you (the policyholder), not the vehicle, so you can transfer it when you buy a new vehicle or switch insurers."
    },
    {
      question: "What is IDV and why is it important?",
      answer: "IDV (Insured Declared Value) is the maximum amount you'll receive in case of total loss or theft of your vehicle. It's calculated as the current market value of your vehicle minus depreciation. A higher IDV means higher premium but better coverage. Never undervalue your IDV to save on premium, as you'll receive less compensation during claims."
    },
    {
      question: "What add-on covers should I consider for my motor insurance?",
      answer: "Popular add-ons include: Zero Depreciation Cover (get full claim amount without depreciation deduction), Engine Protection Cover (covers engine damage due to water ingress), Road Side Assistance (24/7 emergency support), Return to Invoice Cover (full invoice value in case of total loss), Consumables Cover (fuel, oil, nuts, bolts), Personal Accident Cover for passengers, NCB Protection, and Key Replacement Cover."
    }
  ];

  const keyFactors = [
    {
      icon: "🚗",
      title: "Vehicle Make & Model",
      description: "Luxury and high-end vehicles have higher premiums due to expensive spare parts and repair costs."
    },
    {
      icon: "🛡️",
      title: "Coverage Type Selection",
      description: "Choose between Third-Party (mandatory, cheaper) and Comprehensive (complete protection, recommended for new vehicles)."
    },
    {
      icon: "💰",
      title: "IDV (Insured Declared Value)",
      description: "Always declare correct IDV. It determines your claim amount in case of total loss or theft of vehicle."
    },
    {
      icon: "🎁",
      title: "Add-on Covers",
      description: "Zero depreciation, engine protection, and roadside assistance add-ons provide enhanced protection worth the extra cost."
    },
    {
      icon: "✅",
      title: "Claim Settlement Ratio",
      description: "Choose insurers with CSR above 95% for smooth and fast claim processing. Check customer reviews."
    },
    {
      icon: "⭐",
      title: "No Claim Bonus (NCB)",
      description: "Earn 20-50% discount by not making claims. Protect your NCB with NCB Protection add-on cover."
    }
  ];

  const benefits = [
    {
      icon: "🎯",
      title: "Comprehensive Protection",
      description: "Coverage against accidents, theft, fire, natural disasters, and third-party liabilities"
    },
    {
      icon: "⚡",
      title: "Cashless Repairs",
      description: "Network of 5000+ cashless garages across India for hassle-free repairs"
    },
    {
      icon: "💵",
      title: "Financial Security",
      description: "Protect your savings from unexpected repair costs and legal liabilities"
    },
    {
      icon: "🔧",
      title: "24/7 Roadside Help",
      description: "Emergency towing, flat tire, fuel delivery, and battery jump-start services"
    }
  ];

  const whyChooseUs = [
    {
      icon: "🧮",
      title: "Compare 15+ Insurers",
      description: "Get quotes from HDFC Ergo, ICICI Lombard, Bajaj Allianz, and more at one place"
    },
    {
      icon: "📊",
      title: "Expert Motor Advisors",
      description: "Dedicated support to help choose the right coverage and add-ons for your vehicle"
    },
    {
      icon: "💸",
      title: "Claims Assistance",
      description: "Complete guidance from FIR filing to claim settlement - we're with you at every step"
    },
    {
      icon: "🎓",
      title: "Instant Policy",
      description: "Buy online in 2 minutes and get policy instantly via email and SMS"
    }
  ];

  const coverageTypes = [
    {
      title: "Third-Party Insurance",
      icon: "👥",
      features: [
        "Mandatory by law in India",
        "Covers third-party injury/death up to ₹15 Lakhs",
        "Property damage coverage up to ₹7.5 Lakhs",
        "Legal liability protection",
        "Starting from ₹2,094/year for cars"
      ],
      color: "from-blue-50 to-blue-100",
      borderColor: "border-blue-300"
    },
    {
      title: "Comprehensive Insurance",
      icon: "🛡️",
      features: [
        "Complete own damage coverage",
        "Theft and total loss protection",
        "Fire, explosion, natural calamity coverage",
        "Third-party liability included",
        "Personal accident cover for owner-driver (₹15 Lakhs)"
      ],
      color: "from-green-50 to-green-100",
      borderColor: "border-green-300"
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
          backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80')",
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
                Protect Your Vehicle with Comprehensive Motor Insurance
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-100">
                Get instant quotes from 15+ leading insurers. Compare, choose, and buy the best motor insurance for your car or bike online in 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center md:justify-start pt-2">
                <button 
                  onClick={scrollToApplyForm}
                  className="bg-white text-green-700 px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-xs sm:text-sm md:text-base">
                  Get Instant Quote
                </button>
                <button 
                  onClick={scrollToApplyForm}
                  className="border-2 border-white text-white px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-xs sm:text-sm md:text-base">
                  Renew Policy
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
                  placeholder="Age *"
                  value={heroFormData.age}
                  onChange={handleHeroFormChange}
                  min="18"
                  max="100"
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.age ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
                <select
                  name="vehicleType"
                  value={heroFormData.vehicleType}
                  onChange={handleHeroFormChange}
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.vehicleType ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                >
                  <option value="">Select Vehicle Type *</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike/Scooter</option>
                  <option value="commercial">Commercial Vehicle</option>
                </select>
                <input
                  type="text"
                  name="vehicleModel"
                  placeholder="Vehicle Model (e.g., Honda City) *"
                  value={heroFormData.vehicleModel}
                  onChange={handleHeroFormChange}
                  className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${heroFormErrors.vehicleModel ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm`}
                />
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="Registration No. (Optional)"
                  value={heroFormData.registrationNumber}
                  onChange={handleHeroFormChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
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

      {/* What is Motor Insurance */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-3 sm:space-y-4 text-center md:text-left order-2 md:order-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                What is Motor Insurance?
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Motor insurance is a contract between you and an insurance company that protects you against financial loss in case of accidents, theft, or damage to your vehicle. In exchange for premium payments, the insurance company agrees to compensate you for covered losses as per the policy terms.
              </p>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                In India, having at least third-party motor insurance is mandatory by law under the Motor Vehicles Act, 1988. However, comprehensive insurance provides complete protection for both your vehicle and third-party liabilities, ensuring peace of mind on the road.
              </p>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-4 sm:p-6 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600" 
                  alt="Motor Insurance Protection" 
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Types */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Types of Motor Insurance Coverage
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-3">
              Choose the right coverage for your vehicle based on your needs and budget
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {coverageTypes.map((coverage, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br ${coverage.color} rounded-xl p-4 sm:p-6 shadow-xl border-2 ${coverage.borderColor}`}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <span className="text-3xl sm:text-4xl mr-2 sm:mr-3">{coverage.icon}</span>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                    {coverage.title}
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {coverage.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-green-600 text-base sm:text-lg mr-2 flex-shrink-0 mt-0.5">✓</span>
                      <p className="text-xs sm:text-sm md:text-base text-gray-700">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Motor Insurance */}
      <section className="py-10 sm:py-12 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 px-2">
              Why Should You Have Motor Insurance?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-3">
              Motor insurance is not just a legal requirement but a financial safeguard that protects you from unexpected expenses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{benefit.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 px-2">
              Why Choose Us for Your Motor Insurance?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-3">
              We make buying and managing motor insurance simple, transparent, and hassle-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <button 
              onClick={scrollToApplyForm}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg text-sm sm:text-base">
              Compare & Buy Now
            </button>
          </div>
        </div>
      </section>

      {/* Key Factors */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 px-2">
              Key Factors to Consider When Buying Motor Insurance
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-3">
              Make an informed decision by evaluating these important factors before purchasing your policy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {keyFactors.map((factor, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{factor.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
                  {factor.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {factor.description}
                </p>
              </div>
            ))}
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
              Documents Needed for Motor Insurance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keep these documents ready for hassle-free vehicle insurance processing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Document 1 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white p-3 rounded-xl">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Vehicle Registration (RC)</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Valid registration certificate of your vehicle
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Original RC Copy (Mandatory)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Vehicle Details Clearly Visible
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      Valid Registration Status
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white p-3 rounded-xl">
                  <IdCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Driving License</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Valid driving license of the owner/driver
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      Valid DL (Mandatory)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      Matching Vehicle Category
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      Not Expired or Suspended
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white p-3 rounded-xl">
                  <Car className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Vehicle Photographs</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Clear photos of your vehicle from multiple angles
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      Front & Rear View
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      Both Side Views
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      Registration Number Visible
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white p-3 rounded-xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Previous Policy</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Copy of your existing insurance policy (renewal)
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                      Previous Policy Copy
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                      NCB Details (if applicable)
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                      Claim History
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 5 */}
            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
              <div className="flex items-start gap-4">
                <div className="bg-red-600 text-white p-3 rounded-xl">
                  <Home className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Address Proof</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Current residential address verification
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      Aadhar Card
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      Passport / Voter ID
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      Utility Bills (recent)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document 6 */}
            <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100">
              <div className="flex items-start gap-4">
                <div className="bg-teal-600 text-white p-3 rounded-xl">
                  <Wrench className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Inspection Report</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Vehicle condition assessment (if required)
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                      Required for Old Vehicles
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                      Fitness Certificate
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                      Vehicle Condition Photos
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
              Apply for Motor Insurance
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
                      {step === 1 && 'Vehicle'}
                      {step === 2 && 'Owner'}
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
              {/* Step 1: Vehicle Information */}
              {currentStep === 1 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Car className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Vehicle Information</h3>
                      <p className="text-gray-600 text-sm">Tell us about your vehicle</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4 text-green-600" />
                        Vehicle Type *
                      </label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select vehicle type</option>
                        <option value="two-wheeler">Two Wheeler (Bike/Scooter)</option>
                        <option value="car">Car</option>
                        <option value="commercial">Commercial Vehicle</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-green-600" />
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="XX00XX0000"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4 text-green-600" />
                        Make & Model *
                      </label>
                      <input
                        type="text"
                        name="makeModel"
                        value={formData.makeModel}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="E.g., Maruti Suzuki Swift, Honda Activa"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        Manufacturing Year *
                      </label>
                      <input
                        type="number"
                        name="manufacturingYear"
                        value={formData.manufacturingYear}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="YYYY"
                        required
                        min="1990"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        Vehicle Value *
                      </label>
                      <select
                        name="vehicleValue"
                        value={formData.vehicleValue}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select approximate value</option>
                        <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                        <option value="100000-300000">₹1,00,000 - ₹3,00,000</option>
                        <option value="300000-500000">₹3,00,000 - ₹5,00,000</option>
                        <option value="500000-1000000">₹5,00,000 - ₹10,00,000</option>
                        <option value="1000000+">₹10,00,000+</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Owner Information */}
              {currentStep === 2 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <User className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Owner Information</h3>
                      <p className="text-gray-600 text-sm">Your personal details</p>
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="Your age"
                        required
                        min="18"
                        max="75"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        Policy Type *
                      </label>
                      <select
                        name="policyType"
                        value={formData.policyType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select policy type</option>
                        <option value="comprehensive">Comprehensive (Full Coverage)</option>
                        <option value="third-party">Third Party (Mandatory)</option>
                        <option value="own-damage">Own Damage Only</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 bg-green-50 border-2 border-green-200 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="text-green-600" />
                        Key Benefits of Comprehensive Motor Insurance:
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Coverage Against Theft & Accidents</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Natural Calamities Protection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Third Party Liability Coverage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Cashless Garage Network</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">No Claim Bonus (NCB) up to 50%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">24/7 Roadside Assistance</span>
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                      { key: 'rc', label: 'Vehicle RC (Registration)', icon: <FileCheck className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB' },
                      { key: 'dl', label: 'Driving License', icon: <IdCard className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB' },
                      { key: 'vehiclePhotos', label: 'Vehicle Photos', icon: <Car className="w-12 h-12" />, accept: '.jpg,.jpeg,.png', size: '10MB', note: '4 angles' },
                      { key: 'previousPolicy', label: 'Previous Policy', icon: <Shield className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB', note: 'If renewal' },
                      { key: 'addressProof', label: 'Address Proof', icon: <Home className="w-12 h-12" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB' }
                    ].map((doc) => (
                      <div key={doc.key} className="relative">
                        <label className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300 block ${
                          documents[doc.key] 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-green-400 bg-white'
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
                              <div className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold">
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

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <strong>Important:</strong> All documents should be clear and readable. Vehicle photos should show 
                        all angles (front, rear, both sides) with registration number visible. For renewals, previous policy 
                        and NCB details are mandatory. Inspection may be required for vehicles older than 5 years.
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
                    Thank you for applying! Your application reference number is <strong className="text-green-600">#MI{Date.now().toString().slice(-8)}</strong>
                  </p>
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">What happens next?</h4>
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                        <div>
                          <div className="font-semibold text-gray-900">Document Verification</div>
                          <div className="text-gray-600 text-sm">Our team will verify your documents within 24 hours</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                        <div>
                          <div className="font-semibold text-gray-900">Vehicle Inspection</div>
                          <div className="text-gray-600 text-sm">Physical inspection may be scheduled if required (for old vehicles)</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                        <div>
                          <div className="font-semibold text-gray-900">Premium Quotation</div>
                          <div className="text-gray-600 text-sm">Receive customized premium quote based on your vehicle and coverage</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                        <div>
                          <div className="font-semibold text-gray-900">Policy Issuance</div>
                          <div className="text-gray-600 text-sm">Instant policy issuance after premium payment confirmation</div>
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
                          name: '', email: '', phone: '', age: '', vehicleType: '',
                          registrationNumber: '', makeModel: '', manufacturingYear: '',
                          vehicleValue: '', policyType: '', address: '', city: '', state: '', pincode: ''
                        });
                        setDocuments({ rc: null, dl: null, vehiclePhotos: null, previousPolicy: null, addressProof: null });
                      }}
                      className="bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 font-semibold px-8 py-4 rounded-full shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2"
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
                      disabled={isSubmittingApplication}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {isSubmittingApplication ? 'Submitting...' : 'Submit Application'}
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
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 px-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 px-3">
              Get answers to common questions about motor insurance
            </p>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 pr-3 sm:pr-4 md:pr-6">
                    {faq.question}
                  </h3>
                  <span className="text-lg sm:text-xl text-green-600 flex-shrink-0">
                    {activeAccordion === index ? '−' : '+'}
                  </span>
                </button>
                {activeAccordion === index && (
                  <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
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
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
            Ready to Secure Your Vehicle?
          </h2>
          <p className="text-sm sm:text-base md:text-lg mb-5 sm:mb-6 text-blue-100 px-3">
            Get instant quotes from top insurers and buy the best motor insurance policy today
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            <button 
              onClick={scrollToApplyForm}
              className="bg-white text-green-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-sm sm:text-base">
              Get Instant Quote
            </button>
            <button 
              onClick={handleContactNavigation}
              className="border-2 border-white text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-sm sm:text-base">
              Talk to Expert
            </button>
          </div>
        </div>
      </section>

      {!isPopupMode && <Footer />}
    </div>
  );
};

export default Moter_Insurance;
