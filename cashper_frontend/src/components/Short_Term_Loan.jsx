import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Footer from './Footer';
import { submitLoanApplication } from '../utils/api';
import { 
  submitGetInTouch, 
  submitShortTermLoanApplication, 
  trackApplicationById,
  getEligibilityCriteria 
} from '../services/shortTermLoanApi';
import { 
  Calculator, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Upload, 
  Users, 
  Shield,
  IndianRupee,
  Zap,
  Award,
  ArrowRight,
  Phone,
  Mail,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CreditCard,
  Home,
  Briefcase,
  Percent,
  PieChart,
  Star,
  ThumbsUp,
  TrendingDown,
  Wallet,
  X,
  CheckCircle2,
  Heart,
  Book,
  Plane,
  ShoppingBag,
  GraduationCap,
  Car,
  Stethoscope,
  Smile,
  Target,
  BarChart3,
  RefreshCw,
  UserCheck,
  FileCheck,
  Headphones
} from 'lucide-react';

const Short_Term_Loan = ({ isPopupMode = false, onPopupClose }) => {
  // Add Navbar
  <Navbar />
  
  // Scroll to top on mount OR to hash target if present
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Wait for the component to render
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  // Load eligibility criteria from API
  useEffect(() => {
    const loadEligibilityCriteria = async () => {
      setIsLoadingEligibility(true);
      try {
        const result = await getEligibilityCriteria();
        if (result.success && result.data) {
          // Sort by order field
          const sortedData = result.data.sort((a, b) => a.order - b.order);
          setEligibilityData(sortedData);
        }
      } catch (error) {
        console.error('Error loading eligibility criteria:', error);
      } finally {
        setIsLoadingEligibility(false);
      }
    };

    loadEligibilityCriteria();
  }, []);
  
  // Multi-Step Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTenure, setLoanTenure] = useState(12);
  const [interestRate, setInterestRate] = useState(12);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    relativeName: '',
    relativeRelation: '',
    relativePhone: '',
    loanAmount: '',
    purpose: '',
    employment: '',
    monthlyIncome: '',
    panNumber: '',
    aadharNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    companyName: '',
    workExperience: '',
    creditScore: ''
  });

  // Document Upload State
  const [documents, setDocuments] = useState({
    aadhar: null,
    pan: null,
    bankStatement: null,
    salarySlip: null,
    photo: null
  });

  // Upload loading state
  const [uploadingFile, setUploadingFile] = useState(null);

  // FAQ State
  const [openFaq, setOpenFaq] = useState(null);
  
  // Testimonial Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // API States
  const [eligibilityData, setEligibilityData] = useState([]);
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(true);
  const [applicationId, setApplicationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Slide one card at a time
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= successStories.length - itemsPerPage ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? successStories.length - itemsPerPage : prev - 1));
  };

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentSlide, itemsPerPage]);
  
  // Scroll to form section on step change (but not on initial mount)
  useEffect(() => {
    if (currentStep !== 1) {
      const formSection = document.getElementById('apply-form');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentStep]);

  // Smooth scroll handler
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate EMI
  const calculateEMI = () => {
    const principal = loanAmount;
    const rate = interestRate / 12 / 100;
    const time = loanTenure;
    
    const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    const totalPayment = emi * time;
    const totalInterest = totalPayment - principal;
    
    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest)
    };
  };

  const { emi, totalPayment, totalInterest } = calculateEMI();

  // Handle Form Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Special handling for specific fields
    if (name === 'panNumber') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (name === 'aadharNumber') {
      processedValue = value.replace(/\D/g, '');
    } else if (name === 'phone') {
      processedValue = value.replace(/\D/g, '');
    } else if (name === 'pincode') {
      processedValue = value.replace(/\D/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Handle File Upload with async upload and timeout
  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      try {
        setUploadingFile(docType);
        const uploadToastId = toast.loading(`Uploading ${file.name}...`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Create abort controller with 30-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch('http://localhost:8000/api/short-term-loan/upload-document', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        setDocuments(prev => ({
          ...prev,
          [docType]: {
            name: file.name,
            path: data.filePath,
            file: file
          }
        }));
        
        toast.dismiss(uploadToastId);
        toast.success(`${file.name} uploaded successfully!`);
        setUploadingFile(null);
        
      } catch (error) {
        console.error('File upload error:', error);
        if (error.name === 'AbortError') {
          toast.error('Upload timeout - server took too long to respond');
        } else {
          toast.error('Failed to upload document. Please check your connection and try again.');
        }
        setUploadingFile(null);
      }
    }
  };

  // Validate Step with detailed validation
  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.fullName.trim()) {
          toast.error('Please enter your full name');
          return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          toast.error('Please enter a valid 10-digit phone number');
          return false;
        }
        if (!formData.relativeName.trim()) {
          toast.error('Please enter relative/reference name');
          return false;
        }
        if (!formData.relativeRelation.trim()) {
          toast.error('Please select relationship');
          return false;
        }
        if (!formData.relativePhone.trim() || !/^[0-9]{10}$/.test(formData.relativePhone.replace(/\D/g, ''))) {
          toast.error('Please enter a valid 10-digit relative/reference phone number');
          return false;
        }
        return true;
      case 2:
        if (!formData.loanAmount || formData.loanAmount < 10000 || formData.loanAmount > 500000) {
          toast.error('Please enter a valid loan amount between ?10,000 and ?5,00,000');
          return false;
        }
        if (!formData.purpose) {
          toast.error('Please select the loan purpose');
          return false;
        }
        if (!formData.employment) {
          toast.error('Please select your employment type');
          return false;
        }
        if (!formData.monthlyIncome || formData.monthlyIncome < 15000) {
          toast.error('Please enter a valid monthly income (minimum ?15,000)');
          return false;
        }
        return true;
      case 3:
        if (!formData.panNumber.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
          toast.error('Please enter a valid PAN number (e.g., ABCDE1234F)');
          return false;
        }
        if (!formData.aadharNumber.trim() || !/^[0-9]{12}$/.test(formData.aadharNumber.replace(/\D/g, ''))) {
          toast.error('Please enter a valid 12-digit Aadhar number');
          return false;
        }
        if (!formData.address.trim()) {
          toast.error('Please enter your full address');
          return false;
        }
        if (!formData.city.trim()) {
          toast.error('Please enter your city');
          return false;
        }
        if (!formData.state.trim()) {
          toast.error('Please enter your state');
          return false;
        }
        if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode)) {
          toast.error('Please enter a valid 6-digit PIN code');
          return false;
        }
        return true;
      case 4:
        // Documents are REQUIRED - all 5 documents must be uploaded
        const shortTermRequiredDocs = ['aadhar', 'pan', 'bankStatement', 'salarySlip', 'photo'];
        const shortTermMissingDocs = shortTermRequiredDocs.filter(doc => !documents[doc]);
        
        if (shortTermMissingDocs.length > 0) {
          const docNames = {
            aadhar: 'Aadhar Card',
            pan: 'PAN Card',
            bankStatement: 'Bank Statement',
            salarySlip: 'Salary Slip',
            photo: 'Photo'
          };
          const missing = shortTermMissingDocs.map(doc => docNames[doc]).join(', ');
          toast.error(`Please upload all required documents: ${missing}`);
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  // Next Step with smooth transition
  const handleNextStep = (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (validateStep(currentStep) && !isTransitioning) {
      setIsTransitioning(true);
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      // Smooth scroll to top before changing step
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // Previous Step with smooth transition
  const handlePreviousStep = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(4) && !isTransitioning) {
      setIsTransitioning(true);
      setIsSubmitting(true);
      
      try {
        // Prepare data for Short Term Loan API - using camelCase to match backend
        const applicationData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          relativeName: formData.relativeName,
          relativeRelation: formData.relativeRelation,
          relativePhone: formData.relativePhone,
          loanAmount: formData.loanAmount,  // Keep as string
          purpose: formData.purpose,
          employment: formData.employment,
          monthlyIncome: formData.monthlyIncome,  // Keep as string
          companyName: formData.companyName || null,
          workExperience: formData.workExperience || null,
          creditScore: formData.creditScore || null,
          panNumber: formData.panNumber,
          aadharNumber: formData.aadharNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          // Map uploaded documents to their field names with paths
          aadhar: documents.aadhar?.path || '',
          pan: documents.pan?.path || '',
          bankStatement: documents.bankStatement?.path || '',
          salarySlip: documents.salarySlip?.path || '',
          photo: documents.photo?.path || ''
        };

        // Submit to Short Term Loan API
        const result = await submitShortTermLoanApplication(applicationData);
        
        if (result.success) {
          console.log('Application submitted successfully:', result.data);
          toast.success('Application submitted successfully!');
          
          // Store application ID for success screen
          if (result.data && result.data.applicationId) {
            setApplicationId(result.data.applicationId);
            setFormData(prev => ({
              ...prev,
              referenceNumber: result.data.applicationId
            }));
          }
          
          // Smooth transition to success step
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          setTimeout(() => {
            setCurrentStep(5); // Success step
            setIsTransitioning(false);
            setIsSubmitting(false);
          }, 300);
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error) {
        console.error('Error submitting application:', error);
        toast.error(`Failed to submit application: ${error.message}. Please try again.`);
        setIsTransitioning(false);
        setIsSubmitting(false);
      }
    }
  };

  // FAQ Data
  const faqs = [
    {
      question: "What is a Short Term Loan?",
      answer: "A short-term loan is a type of loan that is obtained to support temporary personal or business capital needs. It typically has a repayment period of 3 to 24 months and is ideal for meeting urgent financial requirements."
    },
    {
      question: "What is the maximum loan amount available?",
      answer: "You can avail short-term loans ranging from ?10,000 to ?5,00,000 depending on your income, credit score, and repayment capacity. Higher amounts may be available for salaried professionals and business owners."
    },
    {
      question: "What documents are required?",
      answer: "Basic documents include: Aadhar Card, PAN Card, Bank Statements (last 3-6 months), Salary Slips (last 3 months) for salaried or Business proof for self-employed, Address Proof, and a recent passport-size photograph."
    },
    {
      question: "How quickly can I get the loan approved?",
      answer: "With our fast-track approval process, you can get approval within 24-48 hours. Once approved, the loan amount is disbursed to your bank account within 1-3 business days."
    },
    {
      question: "What is the interest rate?",
      answer: "Interest rates typically range from 10% to 24% per annum, depending on your credit profile, loan amount, and tenure. Better credit scores qualify for lower interest rates."
    },
    {
      question: "Can I prepay my loan?",
      answer: "Yes, you can prepay your short-term loan partially or fully at any time. Some lenders may charge a nominal prepayment fee, typically 2-4% of the outstanding amount."
    }
  ];

  // Features Data
  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Quick Approval",
      description: "Get loan approval within 30 minutes"
    },
    {
      icon: <IndianRupee className="w-8 h-8" />,
      title: "Flexible Amount",
      description: "Loans from ?10K to ?5L"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Disbursal",
      description: "Funds in your account within a day"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Process",
      description: "100% safe and secure documentation"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Low Interest",
      description: "Competitive rates starting from 1% per day"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "No Hidden Charges",
      description: "Transparent pricing with no surprises"
    }
  ];

  // Benefits Data
  const benefits = [
    "No collateral required for loans up to ?2 lakhs",
    "Flexible repayment tenure from 3 to 24 months",
    "Minimal documentation with online application",
    "Special rates for salaried professionals",
    "Quick processing with instant approval",
    "Prepayment facility without heavy penalties",
    "Dedicated relationship manager",
    "24/7 customer support"
  ];

  // Eligibility Criteria
  const eligibility = [
    { label: "Age", value: "21 to 65 years" },
    { label: "Employment", value: "Salaried/Self-employed/Business" },
    { label: "Minimum Income", value: "?15,000 per month" },
    { label: "Credit Score", value: "650 and above (preferred)" },
    { label: "Work Experience", value: "Minimum 6 months in current job" },
    { label: "Nationality", value: "Indian Resident" }
  ];

  // Loan Purpose Data with Icons
  const loanPurposes = [
    { icon: <Stethoscope className="w-8 h-8" />, title: "Medical Emergency", color: "from-red-500 to-red-600" },
    { icon: <GraduationCap className="w-8 h-8" />, title: "Education", color: "from-blue-500 to-blue-600" },
    { icon: <Heart className="w-8 h-8" />, title: "Wedding", color: "from-pink-500 to-pink-600" },
    { icon: <Home className="w-8 h-8" />, title: "Home Renovation", color: "from-green-500 to-green-600" },
    { icon: <Briefcase className="w-8 h-8" />, title: "Business Needs", color: "from-purple-500 to-purple-600" },
    { icon: <CreditCard className="w-8 h-8" />, title: "Debt Consolidation", color: "from-orange-500 to-orange-600" },
    { icon: <Plane className="w-8 h-8" />, title: "Travel", color: "from-teal-500 to-teal-600" },
    { icon: <ShoppingBag className="w-8 h-8" />, title: "Shopping", color: "from-indigo-500 to-indigo-600" }
  ];

  // Success Stories
  const successStories = [
    {
      name: "Rajesh Kumar",
      location: "Mumbai",
      amount: "?2,00,000",
      purpose: "Medical Emergency",
      rating: 5,
      review: "Got loan approved within 24 hours for my father's surgery. The process was smooth and hassle-free. Highly recommended!",
      image: "/testimonial/image copy 2.png"
    },
    {
      name: "Prem Sharma",
      location: "Delhi",
      amount: "?1,50,000",
      purpose: "Home Renovation",
      rating: 5,
      review: "Excellent service! The interest rates were competitive and the documentation was minimal. Very satisfied with the entire process.",
      image: "/testimonial/image copy 18.png"
    },
    {
      name: "Amit Patel",
      location: "Bangalore",
      amount: "?3,00,000",
      purpose: "Business Expansion",
      rating: 5,
      review: "Best decision ever! Quick approval, transparent process, and great customer support. Helped me grow my business significantly.",
      image: "/testimonial/image copy 4.png"
    },
    {
      name: "Surya Reddy",
      location: "Hyderabad",
      amount: "?1,00,000",
      purpose: "Wedding Expenses",
      rating: 5,
      review: "Amazing experience! Got my loan in just 2 days. The team was very supportive and guided me through every step. Thank you!",
      image: "/testimonial/image copy 19.png"
    },
    {
      name: "Vinita Singh",
      location: "Pune",
      amount: "?2,50,000",
      purpose: "Education",
      rating: 5,
      review: "Perfect solution for my daughter's education fees. Low interest rates and flexible repayment options made it stress-free!",
      image: "/testimonial/image copy 6.png"
    }
  ];

  // Helper functions for testimonials
  const getVisibleTestimonials = () => {
    return successStories.slice(currentSlide, currentSlide + itemsPerPage);
  };

  const maxSlide = successStories.length - itemsPerPage;

  // Comparison with other loan types
  const loanComparison = [
    { 
      feature: "Processing Time", 
      shortTerm: "24-48 hours", 
      personal: "3-5 days", 
      home: "15-30 days" 
    },
    { 
      feature: "Documentation", 
      shortTerm: "Minimal", 
      personal: "Moderate", 
      home: "Extensive" 
    },
    { 
      feature: "Loan Amount", 
      shortTerm: "?10K - ?5L", 
      personal: "?50K - ?25L", 
      home: "?5L - ?5Cr" 
    },
    { 
      feature: "Tenure", 
      shortTerm: "3-24 months", 
      personal: "1-5 years", 
      home: "5-30 years" 
    },
    { 
      feature: "Collateral", 
      shortTerm: "Not required", 
      personal: "Not required", 
      home: "Property" 
    },
    { 
      feature: "Interest Rate", 
      shortTerm: "10-24% p.a.", 
      personal: "10-20% p.a.", 
      home: "6-9% p.a." 
    }
  ];

  // Additional Services
  const additionalServices = [
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Loan Top-up Facility",
      description: "Existing customers can avail additional loan amount with minimal documentation"
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Dedicated Relationship Manager",
      description: "Personal point of contact for all your loan-related queries and assistance"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Easy Balance Transfer",
      description: "Transfer your existing loan from other banks at competitive interest rates"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Customer Support",
      description: "Round-the-clock assistance via phone, email, and chat support"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPopupMode && <Navbar />}
      {!isPopupMode && (
      <>
      {/* Hero Section with Get In Touch Form */}
      <section 
        className="relative w-full bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "scroll",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-700/85"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left order-1 lg:order-1">
              <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-2xl">
                Quick Short Term Loans
                <span className="block text-yellow-300 mt-2 text-2xl lg:text-4xl">?10K to ?5 Lakh in Minutes</span>
              </h1>
              
              <p className="text-base lg:text-lg text-white/95 mb-5 leading-relaxed font-medium drop-shadow-lg">
                Minimal documentation � Competitive rates starting from 10% � Flexible repayment � No collateral required
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a 
                  href="#calculator"
                  onClick={(e) => handleSmoothScroll(e, 'calculator')}
                  className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/30 font-semibold px-6 py-3 rounded-full shadow-xl transition-all duration-300 text-base transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate EMI
                </a>
                
                <a 
                  href="#apply-form"
                  onClick={(e) => handleSmoothScroll(e, 'apply-form')}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-full shadow-xl transition-all duration-300 text-base transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Apply Now
                </a>
              </div>
            </div>

            {/* Right Side - Get In Touch Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 order-2 lg:order-2">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">GET IN TOUCH</h3>
                <p className="text-sm text-gray-600">We'll get back to you shortly</p>
              </div>

              <form className="space-y-3" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  full_name: formData.get('fullName'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  loan_amount: parseFloat(formData.get('loanAmount'))
                };
                
                try {
                  const result = await submitGetInTouch(data);
                  
                  if (result.success) {
                    alert('Thank you for your interest! Our team will contact you within 24 hours.');
                    e.target.reset();
                  } else {
                    alert(`Error: ${result.error}. Please try again.`);
                  }
                } catch (error) {
                  console.error('Error submitting GET IN TOUCH form:', error);
                  alert('Failed to submit. Please try again later.');
                }
              }}>
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    pattern="[0-9]{10}"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    name="loanAmount"
                    placeholder="Loan Amount"
                    min="10000"
                    max="500000"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* About Short Term Loan Section */}
      <section className="py-6 lg:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left Side - Text Content */}
            <div className="order-2 lg:order-1">             
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                What is a Short Term Loan?
              </h2>
              
              <p className="text-base text-gray-600 mb-3 leading-relaxed">
                A <strong>short term loan</strong> is a quick financing solution designed to help you meet immediate financial needs without long-term commitment. These loans typically range from <strong>?10,000 to ?5,00,000</strong> and can be repaid within <strong>3 to 24 months</strong>.
              </p>
              
              <p className="text-base text-gray-600 mb-5 leading-relaxed">
                Unlike traditional loans, short term loans offer <strong>faster approval (24-48 hours)</strong>, minimal documentation, and flexible repayment options. They're perfect for handling unexpected expenses, bridging financial gaps, or seizing time-sensitive opportunities without depleting your savings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
                  <div className="bg-green-600 text-white p-2 rounded-lg mt-1 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Quick Approval</h4>
                    <p className="text-sm text-gray-600">Get approved in 24-48 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
                  <div className="bg-green-600 text-white p-2 rounded-lg mt-1 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Minimal Docs</h4>
                    <p className="text-sm text-gray-600">Less paperwork, more convenience</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
                  <div className="bg-green-600 text-white p-2 rounded-lg mt-1 flex-shrink-0">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Low Interest</h4>
                    <p className="text-sm text-gray-600">Rates starting from 10% p.a.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
                  <div className="bg-green-600 text-white p-2 rounded-lg mt-1 flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">No Collateral</h4>
                    <p className="text-sm text-gray-600">Unsecured loan option</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Side - Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80" 
                  alt="Short Term Loan - Quick Financial Solution" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent"></div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-2xl p-4 max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-xl flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">50,000+</div>
                    <div className="text-xs text-gray-600">Loans Approved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section with Images */}
      <section className="py-6 lg:py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Our Short Term Loans?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience hassle-free borrowing with our customer-centric approach
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 transform hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-green-600 to-green-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators with Icons */}
          <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <ThumbsUp className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl sm:text-4xl font-bold mb-2">98%</div>
                <div className="text-green-100">Customer Satisfaction</div>
              </div>
              <div>
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
                <div className="text-green-100">Loans Disbursed</div>
              </div>
              <div>
                <BadgeCheck className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl sm:text-4xl font-bold mb-2">15+</div>
                <div className="text-green-100">Years Experience</div>
              </div>
              <div>
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl sm:text-4xl font-bold mb-2">100%</div>
                <div className="text-green-100">Secure Process</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Loan Process Timeline */}
      <section className="py-6 lg:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
              <TrendingUp className="w-5 h-5 text-blue-700" />
              <span className="text-blue-700 font-semibold text-sm">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get Your Loan in 4 Easy Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our streamlined process ensures quick approval and disbursal
            </p>
          </div>

          <div className="relative">

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <FileText className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fill Application</h3>
                <p className="text-gray-600">Complete our simple online form with your details</p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Submit Documents</h3>
                <p className="text-gray-600">Upload required documents securely online</p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <BadgeCheck className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Get Approved</h3>
                <p className="text-gray-600">Receive instant approval within 24-48 hours</p>
              </div>

              {/* Step 4 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <IndianRupee className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    4
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Receive Funds</h3>
                <p className="text-gray-600">Money transferred directly to your bank account</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility & Benefits Section - Enhanced */}
      <section className="py-6 lg:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Eligibility Criteria */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-4 rounded-2xl shadow-lg">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Eligibility Criteria
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Check if you qualify</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {isLoadingEligibility ? (
                  // Loading state
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-600 mt-2">Loading eligibility criteria...</p>
                  </div>
                ) : eligibilityData.length > 0 ? (
                  // Show data from API
                  eligibilityData.map((item, index) => (
                    <div 
                      key={item.id || index}
                      className="group bg-gradient-to-r from-green-50 to-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-green-100 hover:border-green-300"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                            {index === 0 && <Users className="w-5 h-5 text-green-700" />}
                            {index === 1 && <Briefcase className="w-5 h-5 text-green-700" />}
                            {index === 2 && <IndianRupee className="w-5 h-5 text-green-700" />}
                            {index === 3 && <TrendingUp className="w-5 h-5 text-green-700" />}
                            {index === 4 && <Clock className="w-5 h-5 text-green-700" />}
                            {index === 5 && <Shield className="w-5 h-5 text-green-700" />}
                          </div>
                          <span className="font-bold text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-green-700 font-bold text-lg">{item.value}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to static data if API fails
                  eligibility.map((item, index) => (
                    <div 
                      key={index}
                      className="group bg-gradient-to-r from-green-50 to-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-green-100 hover:border-green-300"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                            {index === 0 && <Users className="w-5 h-5 text-green-700" />}
                            {index === 1 && <Briefcase className="w-5 h-5 text-green-700" />}
                            {index === 2 && <IndianRupee className="w-5 h-5 text-green-700" />}
                            {index === 3 && <TrendingUp className="w-5 h-5 text-green-700" />}
                            {index === 4 && <Clock className="w-5 h-5 text-green-700" />}
                            {index === 5 && <Shield className="w-5 h-5 text-green-700" />}
                          </div>
                          <span className="font-bold text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-green-700 font-bold text-lg">{item.value}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 p-5 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border border-green-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-800">
                    <strong className="text-green-800">Note:</strong> Meeting these criteria increases your chances of approval. 
                    Final eligibility is subject to credit assessment and verification.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <a 
                  href="#apply-form"
                  onClick={(e) => handleSmoothScroll(e, 'apply-form')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Check Eligibility
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      Key Benefits
                    </h2>
                    <p className="text-green-100 text-sm mt-1">Why choose us</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 group-hover:bg-green-400 rounded-lg flex items-center justify-center transition-colors">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <span className="text-green-50 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <Star className="w-8 h-8 text-yellow-300" />
                    <div>
                      <div className="text-2xl font-bold">4.8/5</div>
                      <div className="text-green-100 text-sm">Customer Rating</div>
                    </div>
                  </div>
                  <p className="text-sm text-green-100">
                    Rated by 10,000+ satisfied customers across India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {/* Multi-Step Application Form Section */}
      <section id="apply-form" className="py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <FileText className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-semibold">Application Form</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Apply for Short Term Loan
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
                      {step === 2 && 'Loan Info'}
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

          <form onSubmit={(e) => {
            e.preventDefault();
            if (currentStep < 4) {
              handleNextStep(e);
            } else {
              handleSubmit(e);
            }
          }} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Users className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                      <p className="text-gray-600 text-sm">Tell us about yourself</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name as per documents"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg"
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
                        required
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
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
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        Relative/Reference Name *
                      </label>
                      <input
                        type="text"
                        name="relativeName"
                        value={formData.relativeName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter relative/reference name"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        Relationship *
                      </label>
                      <select
                        name="relativeRelation"
                        value={formData.relativeRelation}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select Relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="brother">Brother</option>
                        <option value="sister">Sister</option>
                        <option value="friend">Friend</option>
                        <option value="colleague">Colleague</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        Relative/Reference Phone *
                      </label>
                      <input
                        type="tel"
                        name="relativePhone"
                        value={formData.relativePhone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Loan Information */}
              {currentStep === 2 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <IndianRupee className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Loan Details</h3>
                      <p className="text-gray-600 text-sm">Specify your loan requirements</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-green-600" />
                        Loan Amount Required *
                      </label>
                      <input
                        type="number"
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={handleInputChange}
                        required
                        placeholder="? 50,000"
                        min="10000"
                        max="500000"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Min: ?10,000 | Max: ?5,00,000</p>
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        Loan Purpose *
                      </label>
                      <select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select Loan Purpose</option>
                        <option value="medical">Medical Emergency</option>
                        <option value="education">Education</option>
                        <option value="wedding">Wedding Expenses</option>
                        <option value="home-renovation">Home Renovation</option>
                        <option value="business">Business Needs</option>
                        <option value="debt-consolidation">Debt Consolidation</option>
                        <option value="travel">Travel</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-green-600" />
                        Employment Type *
                      </label>
                      <select
                        name="employment"
                        value={formData.employment}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select Employment Type</option>
                        <option value="salaried">Salaried</option>
                        <option value="individuals">Individuals</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        Monthly Income *
                      </label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={handleInputChange}
                        required
                        placeholder="? 25,000"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Your company name"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Work Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="workExperience"
                        value={formData.workExperience}
                        onChange={handleInputChange}
                        placeholder="5"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address & KYC */}
              {currentStep === 3 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Home className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Address & KYC Details</h3>
                      <p className="text-gray-600 text-sm">Provide your contact and identity information</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        PAN Number *
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="ABCDE1234F"
                        maxLength="10"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        Aadhar Number *
                      </label>
                      <input
                        type="text"
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="XXXX XXXX XXXX"
                        maxLength="12"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4 text-green-600" />
                        Full Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        placeholder="Enter your complete residential address"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter city"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter state"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        placeholder="400001"
                        maxLength="6"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Document Upload */}
              {currentStep === 4 && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Upload className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Upload Documents</h3>
                      <p className="text-gray-600 text-sm">Please upload clear copies of required documents</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Document Upload Cards */}
                    {[
                      { key: 'aadhar', label: 'Aadhar Card', icon: <CreditCard className="w-8 h-8" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB' },
                      { key: 'pan', label: 'PAN Card', icon: <CreditCard className="w-8 h-8" />, accept: '.pdf,.jpg,.jpeg,.png', size: '5MB' },
                      { key: 'bankStatement', label: 'Bank Statement', icon: <FileText className="w-8 h-8" />, accept: '.pdf', size: '10MB', note: 'Last 3 months' },
                      { key: 'salarySlip', label: 'Salary Slip/Income Proof', icon: <IndianRupee className="w-8 h-8" />, accept: '.pdf', size: '10MB', note: 'Last 3 months' },
                      { key: 'photo', label: 'Passport Size Photo', icon: <Users className="w-8 h-8" />, accept: '.jpg,.jpeg,.png', size: '2MB' },
                    ].map((doc) => (
                      <div key={doc.key} className={doc.key === 'photo' ? 'sm:col-span-2' : ''}>
                        <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                          documents[doc.key] 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-green-400 bg-white'
                        }`}>
                          <label className="cursor-pointer block">
                            <div className="text-center">
                              <div className={`mx-auto mb-4 ${documents[doc.key] ? 'text-green-600' : 'text-gray-400'}`}>
                                {doc.icon}
                              </div>
                              <div className="text-gray-900 font-bold mb-1 text-lg">{doc.label} *</div>
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
                            <input
                              type="file"
                              accept={doc.accept}
                              onChange={(e) => handleFileUpload(e, doc.key)}
                              className="hidden"
                              required
                            />
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
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Important:</strong> Make sure all documents are clear and readable. Blurred or unclear documents may delay processing.
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
                    Thank you for applying! Your application reference number is <strong className="text-green-600">{applicationId || formData.referenceNumber || `#ST${Date.now().toString().slice(-8)}`}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">
                    Please save this reference number for tracking your application status
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
                          <div className="font-semibold text-gray-900">Approval & Disbursal</div>
                          <div className="text-gray-600 text-sm">Once approved, loan will be disbursed to your account in 1-3 days</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                        <div>
                          <div className="font-semibold text-gray-900">Confirmation</div>
                          <div className="text-gray-600 text-sm">You'll receive email and SMS updates at every step</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => {
                        setCurrentStep(1);
                        setCompletedSteps([]);
                        setApplicationId('');
                        setFormData({
                          fullName: '', email: '', phone: '', relativeName: '', relativeRelation: '', 
                          relativePhone: '', loanAmount: '', purpose: '', employment: '', monthlyIncome: '', 
                          panNumber: '', aadharNumber: '', address: '', city: '', state: '', pincode: '', 
                          companyName: '', workExperience: '', creditScore: '', referenceNumber: ''
                        });
                        setDocuments({ aadhar: null, pan: null, bankStatement: null, salarySlip: null, photo: null });
                      }}
                      className="bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 font-semibold px-8 py-4 rounded-full shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2"
                    >
                      Apply for Another Loan
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
                    disabled={currentStep === 1 || isTransitioning}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentStep === 1 || isTransitioning
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="submit"
                      disabled={isTransitioning}
                      className={`inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                        isTransitioning ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isTransitioning ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Next Step
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isTransitioning || isSubmitting}
                      className={`inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                        (isTransitioning || isSubmitting) ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {(isTransitioning || isSubmitting) ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Submit Application
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Terms for Step 4 */}
              {currentStep === 4 && (
                <div className="mt-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-gray-600 text-sm cursor-pointer">
                      I agree to the <a href="#" className="text-green-600 hover:underline font-semibold">Terms & Conditions</a> and 
                      <a href="#" className="text-green-600 hover:underline font-semibold"> Privacy Policy</a>. 
                      I authorize  Cashper to contact me and understand that my information will be used for loan processing.
                    </label>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
      
      {!isPopupMode && (
      <>
      {/* Loan Purposes Section */}
      <section className="py-6 lg:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Target className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-semibold">Flexible Purpose</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Use Your Loan for Any Purpose
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our short term loans can be used for various personal and professional needs
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loanPurposes.map((purpose, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center group border border-gray-100 hover:border-green-300"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${purpose.color} rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {purpose.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                  {purpose.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="py-6 lg:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Smile className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-semibold">Success Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real experiences from customers who got their short term loans approved
            </p>
          </div>

          {/* Slider Container */}
          <div className="relative px-4 sm:px-8 md:px-12">
            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
              {getVisibleTestimonials().map((story, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full"
                >
                  <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-green-300 shadow-lg mb-2 sm:mb-3">
                      <img 
                        src={story.image} 
                        alt={`${story.name}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">{story.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{story.location}</p>
                      <div className="flex items-center justify-center gap-1 mt-1.5 sm:mt-2">
                        {[...Array(story.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg mb-2 sm:mb-3 text-center">
                    <p className="text-xs font-semibold text-green-800">{story.purpose} - {story.amount}</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic text-xs sm:text-sm">"{story.review}"</p>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-green-600 text-green-600 hover:text-white p-2 sm:p-3 rounded-full shadow-xl transition-all duration-300 z-10 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-green-600 text-green-600 hover:text-white p-2 sm:p-3 rounded-full shadow-xl transition-all duration-300 z-10 hover:scale-110"
              aria-label="Next testimonial"
            >
              <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {successStories.map((_, index) => {
                if (index > maxSlide) return null;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'bg-green-600 w-6 sm:w-8' 
                        : 'bg-gray-300 hover:bg-green-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Additional Services */}
      <section className="py-6 lg:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Award className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-semibold">Premium Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Additional Benefits for Our Customers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Exclusive services designed to make your borrowing experience exceptional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-purple-200"
              >
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
       {/* FAQ Section */}
      <section className="py-6 lg:py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Get answers to common questions about short term loans
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg overflow-hidden border border-green-100"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-green-50 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-green-600 flex-shrink-0" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Your Loan Approved?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-green-50 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of satisfied customers who got their loans approved quickly and easily
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <a 
              href="#apply-form"
              onClick={(e) => handleSmoothScroll(e, 'apply-form')}
              className="w-full sm:w-auto bg-white text-green-700 hover:bg-green-50 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
            >
              Apply Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a 
              href="tel:+911234567890" 
              className="w-full sm:w-auto bg-green-800/50 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-green-800/70 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Call Us Now
            </a>
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-2 sm:mb-3" />
              <div className="text-white font-semibold mb-1 text-sm sm:text-base">Call Us</div>
              <div className="text-green-100 text-xs sm:text-base">6200755759<br/>7393080847</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-2 sm:mb-3" />
              <div className="text-white font-semibold mb-1 text-sm sm:text-base">Email Us</div>
              <div className="text-green-100 text-xs sm:text-base">info@cashper.ai</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-2 sm:mb-3" />
              <div className="text-white font-semibold mb-1 text-sm sm:text-base">Working Hours</div>
              <div className="text-green-100 text-xs sm:text-base">Mon-Sun: 9 AM - 6 PM</div>
            </div>
          </div>
        </div>
      </section>
      </>
      )}
      
      {!isPopupMode && <Footer />}
    </div>
  );
};

export default Short_Term_Loan;
