import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Target,
  Users,
  Award,
  TrendingUp,
  Heart,
  Globe,
  Zap,
  CheckCircle,
  Star,
  Building2,
  Clock,
  IndianRupee,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Home,
  CreditCard,
  Calculator,
  Lock,
  Handshake,
  Eye,
  Lightbulb,
  Smile,
  ThumbsUp,
  BookOpen,
  Headphones,
  Coffee,
  Rocket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getTestimonials, getAchievements, getStats, getMilestones } from '../services/api';

const Aboutus = () => {
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
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('mission');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentAchievement, setCurrentAchievement] = useState(0);
  const [testimonialsToShow] = useState(3); // Show 3 testimonials at once
  const [achievementsToShow] = useState(3); // Show 3 achievements at once
  const aboutRef = useRef(null);

  // API Data State
  const [testimonials, setTestimonials] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState([]);
  const [milestones, setMilestones] = useState([]);
  
  // Loading States
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(true);

  // Fallback Data arrays - used if API fails
  const fallbackTestimonials = [
    {
      name: "Rajesh Kumar",
      position: "Small Business Owner",
      location: "Mumbai, Maharashtra",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "The business loan process was incredibly smooth. Got approved within 2 hours and the funds were in my account the same day. Their AI-powered assessment made everything so fast and efficient. No paperwork hassles at all!",
      loanType: "Business Loan - ₹25 Lakhs",
      timeframe: "Approved in 2 hours"
    },
    {
      name: "Priya Sharma",
      position: "Software Engineer",
      location: "Bangalore, Karnataka",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "Needed a personal loan for my wedding expenses. The entire process was digital and hassle-free. No hidden charges, very competitive interest rates, and the customer support was exceptional throughout my loan journey.",
      loanType: "Personal Loan - ₹12 Lakhs",
      timeframe: "Disbursed in 4 hours"
    },
    {
      name: "Amit Patel",
      position: "Marketing Manager",
      location: "Pune, Maharashtra",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "Bought my dream home with their home loan. The documentation was minimal, rates were the best in the market, and the team guided me through every step. Their technology platform made tracking everything so easy!",
      loanType: "Home Loan - ₹95 Lakhs",
      timeframe: "Processed in 1 day"
    },
    {
      name: "Sunita Agarwal",
      position: "Boutique Owner",
      location: "Delhi, NCR",
      image: "https://images.unsplash.com/photo-1506629905607-d7322b3c5d14?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "As a woman entrepreneur, I was looking for a supportive lender for expanding my business. Their women-focused loan schemes and mentorship program helped me grow my boutique to 3 locations!",
      loanType: "Women Business Loan - ₹18 Lakhs",
      timeframe: "Same day approval"
    },
    {
      name: "Dr. Vikram Singh",
      position: "Medical Practitioner",
      location: "Jaipur, Rajasthan",
      image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "Needed funding for new medical equipment. Their professional loan scheme was perfect for my needs. Flexible EMIs, competitive rates, and they understood my profession's requirements perfectly.",
      loanType: "Professional Loan - ₹30 Lakhs",
      timeframe: "Approved in 3 hours"
    },
    {
      name: "Meera Krishnan",
      position: "Restaurant Owner",
      location: "Chennai, Tamil Nadu",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "During the pandemic, I needed urgent funds to keep my restaurant running. Their emergency business loan saved my business. Quick processing, reasonable rates, and excellent customer support throughout.",
      loanType: "Emergency Business Loan - ₹22 Lakhs",
      timeframe: "Same day disbursement"
    },
    {
      name: "Karan Malhotra",
      position: "IT Professional",
      location: "Gurgaon, Haryana",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "Wanted to upgrade to a bigger apartment. Their home loan transfer service was seamless with better interest rates than my previous bank. The digital documentation made everything so convenient.",
      loanType: "Home Loan Transfer - ₹1.2 Cr",
      timeframe: "Processed in 2 days"
    },
    {
      name: "Asha Reddy",
      position: "Textile Manufacturer",
      location: "Hyderabad, Telangana",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "As a woman in manufacturing, getting business loans was always challenging. Their dedicated women entrepreneur program not only provided funding but also business mentorship. Truly empowering!",
      loanType: "Women Entrepreneur Loan - ₹45 Lakhs",
      timeframe: "Approved in 4 hours"
    },
    {
      name: "Rohit Jain",
      position: "Education Consultant",
      location: "Indore, Madhya Pradesh",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "My daughter's overseas education dream came true with their education loan. Competitive rates, flexible repayment options, and they handled all the documentation with foreign universities.",
      loanType: "Education Loan - ₹40 Lakhs",
      timeframe: "Approved in 1 day"
    }
  ];

  const fallbackAchievements = [
    {
      title: "Best Fintech Company 2024",
      organization: "Indian Banking Awards",
      icon: <Award className="w-6 h-6" />,
      year: "2024",
      description: "Recognized for outstanding innovation in digital lending and customer service excellence."
    },
    {
      title: "Customer Choice Award 2023",
      organization: "Financial Services Excellence",
      icon: <ThumbsUp className="w-6 h-6" />,
      year: "2023",
      description: "Voted by over 50,000 customers as the most trusted lending platform."
    },
    {
      title: "Digital Innovation Award 2023",
      organization: "Fintech India Summit",
      icon: <Lightbulb className="w-6 h-6" />,
      year: "2023",
      description: "Honored for revolutionary AI-powered loan assessment technology."
    },
    {
      title: "Fastest Growing Fintech 2022",
      organization: "Business Today",
      icon: <Rocket className="w-6 h-6" />,
      year: "2022",
      description: "Achieved 300% growth rate and expanded to 100+ cities in just one year."
    },
    {
      title: "Excellence in Technology 2022",
      organization: "Banking Technology Awards",
      icon: <Zap className="w-6 h-6" />,
      year: "2022",
      description: "Recognized for implementing cutting-edge security and user experience."
    },
    {
      title: "Best MSME Lender 2021",
      organization: "Small Business Finance Awards",
      icon: <Briefcase className="w-6 h-6" />,
      year: "2021",
      description: "Outstanding contribution to MSME sector development and financial inclusion."
    },
    {
      title: "Startup of the Year 2020",
      organization: "Economic Times",
      icon: <Star className="w-6 h-6" />,
      year: "2020",
      description: "Emerged as the most promising fintech startup during challenging times."
    },
    {
      title: "Innovation Excellence 2019",
      organization: "NASSCOM Fintech Awards",
      icon: <Globe className="w-6 h-6" />,
      year: "2019",
      description: "First company to introduce 2-hour loan approval using AI technology."
    }
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials - one card at a time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => {
        const maxIndex = testimonials.length - testimonialsToShow;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, testimonialsToShow]);

  // Auto-rotate achievements - one card at a time
  useEffect(() => {
    const achievementInterval = setInterval(() => {
      setCurrentAchievement(prev => {
        const maxIndex = achievements.length - achievementsToShow;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);
    return () => clearInterval(achievementInterval);
  }, [achievements.length, achievementsToShow]);

  // Load Testimonials from API
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setIsLoadingTestimonials(true);
        const response = await getTestimonials();
        
        if (response && response.length > 0) {
          setTestimonials(response);
        } else {
          // Use fallback testimonials if no data
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.error("Error loading testimonials:", error);
        // Use fallback testimonials on error
        setTestimonials(fallbackTestimonials);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    loadTestimonials();
  }, []);

  // Load Achievements from API
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setIsLoadingAchievements(true);
        const response = await getAchievements();
        
        if (response && response.length > 0) {
          setAchievements(response);
        } else {
          setAchievements(fallbackAchievements);
        }
      } catch (error) {
        console.error("Error loading achievements:", error);
        setAchievements(fallbackAchievements);
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    loadAchievements();
  }, []);

  // Load Stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await getStats();
        
        if (response && response.length > 0) {
          setStats(response);
        } else {
          setStats(fallbackStats);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
        setStats(fallbackStats);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // Load Milestones from API
  useEffect(() => {
    const loadMilestones = async () => {
      try {
        setIsLoadingMilestones(true);
        const response = await getMilestones();
        
        if (response && response.length > 0) {
          setMilestones(response);
        } else {
          setMilestones(fallbackMilestones);
        }
      } catch (error) {
        console.error("Error loading milestones:", error);
        setMilestones(fallbackMilestones);
      } finally {
        setIsLoadingMilestones(false);
      }
    };

    loadMilestones();
  }, []);



  // Helper functions for slider navigation - scroll one card at a time
  const nextTestimonials = () => {
    const maxIndex = testimonials.length - testimonialsToShow;
    setCurrentTestimonial(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevTestimonials = () => {
    const maxIndex = testimonials.length - testimonialsToShow;
    setCurrentTestimonial(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const nextAchievements = () => {
    const maxIndex = achievements.length - achievementsToShow;
    setCurrentAchievement(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevAchievements = () => {
    const maxIndex = achievements.length - achievementsToShow;
    setCurrentAchievement(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const fallbackStats = [
    { icon: Users, value: "5000+", label: "Happy Customers", color: "text-green-600" },
    { icon: TrendingUp, value: "₹1000 Cr", label: "Loans Disbursed", color: "text-emerald-600" },
    { icon: Star, value: "4.9/5", label: "Customer Rating", color: "text-yellow-500" },
    { icon: Clock, value: "24 hrs", label: "Avg. Approval Time", color: "text-teal-600" },
    { icon: Building2, value: "20+", label: "Partner Banks & NBFCs", color: "text-green-700" },
    { icon: Globe, value: "20+", label: "Cities Served", color: "text-emerald-700" },
    { icon: CheckCircle, value: "98%", label: "Success Rate", color: "text-green-500" },
    { icon: Shield, value: "100%", label: "Data Security", color: "text-teal-700" }
  ];

  const fallbackMilestones = [
    {
      year: "2018",
      title: "Company Founded",
      description: "Started with a vision to democratize financial services",
      icon: <Rocket className="w-6 h-6" />
    },
    {
      year: "2019",
      title: "First 10K Customers",
      description: "Reached our first milestone of serving 10,000 customers",
      icon: <Users className="w-6 h-6" />
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Launched fully digital platform during pandemic",
      icon: <Zap className="w-6 h-6" />
    },
    {
      year: "2021",
      title: "₹1000 Cr Disbursed",
      description: "Crossed ₹1000 crore in total loan disbursements",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      year: "2022",
      title: "Award Recognition",
      description: "Received 'Best Fintech Company' award",
      icon: <Award className="w-6 h-6" />
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Introduced AI-powered loan assessment system",
      icon: <Lightbulb className="w-6 h-6" />
    }
  ];

  const services = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Short-Term Loan",
      description: "Quick cash for immediate needs with flexible repayment",
      amount: "₹10K - ₹5L",
      rate: "Starting 10.50% p.a.",
      color: "from-green-500 to-green-600",
      path: "/loans/short-term"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Personal Loan",
      description: "Unsecured loans for your personal needs",
      amount: "₹50K - ₹50L",
      rate: "Starting 8.75% p.a.",
      color: "from-emerald-500 to-emerald-600",
      path: "/loans/personal"
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Home Loan",
      description: "Make your dream home a reality",
      amount: "₹10L - ₹10Cr",
      rate: "Starting 7.25% p.a.",
      color: "from-teal-500 to-teal-600",
      path: "/loans/home"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Business Loan",
      description: "Fuel your business growth",
      amount: "₹1L - ₹5Cr",
      rate: "Starting 9.50% p.a.",
      color: "from-green-600 to-emerald-600",
      path: "/loans/business"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Health Insurance",
      description: "Comprehensive health coverage for you and your family",
      amount: "₹5L - ₹1Cr",
      rate: "Starting ₹500/month",
      color: "from-emerald-600 to-teal-600",
      path: "/insurance/health"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Motor Insurance",
      description: "Complete protection for your vehicle",
      amount: "Car & Bike",
      rate: "Starting ₹2,000/year",
      color: "from-teal-600 to-green-600",
      path: "/insurance/motor"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Term Insurance",
      description: "Secure your family's financial future",
      amount: "₹50L - ₹10Cr",
      rate: "Starting ₹800/month",
      color: "from-green-700 to-emerald-700",
      path: "/insurance/term"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Mutual Funds",
      description: "Grow your wealth with diversified investments",
      amount: "Start from ₹500",
      rate: "Expected 10-15% returns",
      color: "from-emerald-700 to-teal-700",
      path: "/investments/mutual-funds"
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "SIP",
      description: "Systematic Investment Plan for regular savings",
      amount: "Start from ₹500",
      rate: "Build wealth monthly",
      color: "from-teal-700 to-green-700",
      path: "/investments/sip"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Personal Tax Planning",
      description: "Expert tax planning and filing services",
      amount: "Save up to ₹1.5L",
      rate: "Starting ₹999",
      color: "from-green-800 to-emerald-800",
      path: "/tax-planning/personal"
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Business Tax Strategy",
      description: "Strategic tax planning for your business",
      amount: "All Business Types",
      rate: "Custom Solutions",
      color: "from-emerald-800 to-teal-800",
      path: "/tax-planning/business"
    }
  ];
  const coreValues = [
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Trust & Security",
      description: "We prioritize the security of your data and financial information with bank-grade encryption and compliance with all regulatory standards.",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600"
    },
    {
      icon: <Heart className="w-10 h-10" />,
      title: "Customer First",
      description: "Every decision we make is centered around providing the best possible experience and value to our customers.",
      color: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600"
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Innovation",
      description: "We continuously innovate to make financial services more accessible, faster, and more convenient for everyone.",
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600"
    },
    {
      icon: <Handshake className="w-10 h-10" />,
      title: "Transparency",
      description: "We believe in complete transparency with no hidden charges, clear terms, and honest communication.",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600"
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from product quality to customer service.",
      color: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600"
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: "Accessibility",
      description: "We make financial services accessible to everyone, regardless of their background or location.",
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600"
    }
  ];

  const fallbackLeadership = [
    {
      name: "Bhanu Anand Tripathi",
      position: "Founder at CASHPER",
      image: "/team/Bhanu Anand Tripathi .jpg",
      experience: "18+ years of experience",
      education: "Graduate"
    },
    {
      name: "Madhav Mishra",
      position: " Manager at CASHPER",
      image: "/team/madhav.jpg",
      experience: "4+ years of experience",
      education: "MBA, CMA from ICMAI"
    },
    {
      name: "Usha",
      position: "Founder at CASHPER",
      image: "/team/Usha.jpeg",
      experience: "13+ years of experience",
      education: "MCA",
    },
   
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
      ref={aboutRef}
    >
      {/* Hero Section - Fully Responsive */}
      <section className="relative h-[320px] xs:h-[350px] sm:h-[500px] md:h-[550px] lg:h-[550px] xl:h-[600px] flex items-center justify-center overflow-hidden pt-16 xs:pt-20 md:pt-30 lg:pt-30 xl:pt-30 sm:pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/business-people-meeting (1).jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundAttachment: "scroll",
            backgroundRepeat: "no-repeat"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-green-900/60 to-emerald-900/70"></div>
        <div className="relative z-10 text-center px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 max-w-5xl mx-auto w-full mt-0 sm:mt-0">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 xs:mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
              About{" "}
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Our Company
              </span>
            </h1>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light px-2">
              Empowering dreams through innovative financial solutions. We're more than just a lending company – we're your partners in financial success.
            </p>
            
            <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-7 lg:mt-8 flex flex-wrap justify-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 px-2">
              <div className="flex items-center gap-1.5 xs:gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-full">
                <CheckCircle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-green-400" />
                <span className="text-white font-medium text-xs xs:text-sm sm:text-base">RBI Registered</span>
              </div>
              <div className="flex items-center gap-1.5 xs:gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-full">
                <Shield className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-white font-medium text-xs xs:text-sm sm:text-base">Secure & Trusted</span>
              </div>
              <div className="flex items-center gap-1.5 xs:gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-full">
                <Award className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-teal-400" />
                <span className="text-white font-medium text-xs xs:text-sm sm:text-base">Award Winning</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Stats Section - Fully Responsive */}
      <section className="py-5 xs:py-6 sm:py-7 md:py-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5 xs:gap-3 sm:gap-3.5 md:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white rounded-lg sm:rounded-xl p-2.5 xs:p-3 sm:p-3.5 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-100 ${stat.color} mb-2 xs:mb-2.5 sm:mb-3 md:mb-4`}>
                  <stat.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-0.5 xs:mb-1">{stat.value}</div>
                <div className="text-[10px] xs:text-xs sm:text-sm text-gray-600 leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Mission, Vision & Values - Fully Responsive */}
      <section className="py-6 xs:py-7 sm:py-8 md:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8">
          {/* Navigation */}
          <div className="text-center items-center mb-6 xs:mb-7 sm:mb-8 md:mb-9 lg:mb-10">
            <div className="inline-flex bg-gray-100 p-1 rounded-lg xs:rounded-xl overflow-x-auto scrollbar-hide">
              {[
                { id: 'mission', label: 'Our Mission', icon: <Target className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" /> },
                { id: 'vision', label: 'Our Vision', icon: <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" /> },
                { id: 'values', label: 'Our Values', icon: <Heart className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 md:px-6 py-1.5 xs:py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 font-medium text-xs xs:text-sm sm:text-base whitespace-nowrap ${
                    activeSection === tab.id
                      ? 'bg-white text-green-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.label.replace('Our ', '')}</span>
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            {activeSection === 'mission' && (
              <motion.div
                key="mission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 border border-green-100">
                    <Target className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-green-600 mx-auto mb-4 xs:mb-5 sm:mb-6" />
                    <h2 className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 xs:mb-5 sm:mb-6">Our Mission</h2>
                    <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 xs:mb-7 sm:mb-8 px-2">
                      To democratize access to financial services by providing transparent, 
                      technology-driven lending solutions that empower individuals and businesses 
                      to achieve their financial goals with confidence and ease.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
                      <div className="text-center">
                        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-2.5 sm:mb-3">
                          <Zap className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 text-sm xs:text-base">Speed</h4>
                        <p className="text-xs xs:text-sm text-gray-600">Lightning-fast approvals</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-2.5 sm:mb-3">
                          <Shield className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 text-sm xs:text-base">Security</h4>
                        <p className="text-xs xs:text-sm text-gray-600">Bank-grade protection</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-2.5 sm:mb-3">
                          <Smile className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 text-sm xs:text-base">Service</h4>
                        <p className="text-xs xs:text-sm text-gray-600">Exceptional customer experience</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeSection === 'vision' && (
              <motion.div
                key="vision"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 border border-emerald-100">
                    <Eye className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-emerald-600 mx-auto mb-4 xs:mb-5 sm:mb-6" />
                    <h2 className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 xs:mb-5 sm:mb-6">Our Vision</h2>
                    <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 xs:mb-7 sm:mb-8 px-2">
                      To become India's most trusted and innovative financial services platform, 
                      creating a world where everyone has access to fair, fast, and flexible 
                      financial solutions that fuel their aspirations and drive economic growth.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xs:gap-6 sm:gap-7 md:gap-8">
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 xs:p-5 sm:p-6 border border-emerald-100">
                        <Globe className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 text-emerald-600 mb-3 xs:mb-3.5 sm:mb-4 mx-auto sm:mx-0" />
                        <h4 className="text-base xs:text-lg font-semibold text-gray-900 mb-1.5 xs:mb-2">National Reach</h4>
                        <p className="text-gray-600 text-sm xs:text-base">Serving customers across all Indian cities and towns</p>
                      </div>
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 xs:p-5 sm:p-6 border border-emerald-100">
                        <Lightbulb className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 text-emerald-600 mb-3 xs:mb-3.5 sm:mb-4 mx-auto sm:mx-0" />
                        <h4 className="text-base xs:text-lg font-semibold text-gray-900 mb-1.5 xs:mb-2">Innovation Leader</h4>
                        <p className="text-gray-600 text-sm xs:text-base">Pioneering next-generation fintech solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeSection === 'values' && (
              <motion.div
                key="values"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-8 xs:mb-9 sm:mb-10 md:mb-12">
                  <h2 className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 xs:mb-3.5 sm:mb-4 px-2">Our Core Values</h2>
                  <p className="text-sm xs:text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                    The principles that guide every decision we make and every service we provide
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                  {coreValues.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`p-4 xs:p-5 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl border-2 ${value.color} hover:shadow-lg transition-all duration-300`}
                    >
                      <div className={`${value.iconColor} mb-3 xs:mb-3.5 sm:mb-4`}>
                        {value.icon}
                      </div>
                      <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-2 xs:mb-2.5 sm:mb-3">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm xs:text-base">{value.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Our Services - Fully Responsive */}
      <section className="py-6 xs:py-7 sm:py-8 md:py-10 lg:py-12 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="text-center mb-6 xs:mb-7 sm:mb-8 md:mb-10">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2.5 xs:mb-3 sm:mb-3.5 md:mb-4 px-2">
              Our <span className="text-green-600">Financial Services</span>
            </h2>
            <p className="text-sm xs:text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Comprehensive financial solutions designed to meet all your borrowing needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => navigate(service.path)}
                className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 cursor-pointer"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-r ${service.color} text-white mb-4 xs:mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                
                <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-2 xs:mb-2.5 sm:mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-3 xs:mb-3.5 sm:mb-4 leading-relaxed text-sm xs:text-base">{service.description}</p>
                
                <div className="space-y-1.5 xs:space-y-2 mb-4 xs:mb-5 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs xs:text-sm text-gray-500">Loan Amount:</span>
                    <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">{service.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs xs:text-sm text-gray-500">Interest Rate:</span>
                    <span className="font-semibold text-green-600 text-xs xs:text-sm sm:text-base">{service.rate}</span>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 xs:py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 group text-sm xs:text-base">
                  Learn More
                  <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team Section - Fully Responsive */}
      <section className="py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 bg-gradient-to-br from-white via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="text-center mb-8 xs:mb-9 sm:mb-10 md:mb-12">
            <h2 className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 xs:mb-3.5 sm:mb-4 px-2">
              Our <span className="text-green-600">Leadership Team</span>
            </h2>
            <p className="text-sm xs:text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Experienced leaders driving innovation and excellence in financial services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 md:gap-10">
            {fallbackLeadership.map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 group hover:-translate-y-2 text-center p-6 xs:p-7 sm:p-8"
              >
                {/* Circular Avatar Image */}
                <div className="w-32 h-32 xs:w-40 xs:h-40 sm:w-44 sm:h-44 mx-auto mb-5 xs:mb-6 sm:mb-7 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.parentElement) {
                        const fallbackDiv = e.target.parentElement.querySelector('[data-fallback]');
                        if (fallbackDiv) fallbackDiv.style.display = 'flex';
                      }
                    }}
                  />
                  <div data-fallback className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 hidden">
                    <Users className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 text-white" />
                  </div>
                </div>

                {/* Content Container */}
                <div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-1 xs:mb-2">{leader.name}</h3>
                  <p className="text-green-600 font-semibold text-sm xs:text-base mb-4 xs:mb-5">{leader.position}</p>
                  
                  <div className="space-y-2 xs:space-y-2.5 text-gray-600 text-xs xs:text-sm sm:text-base border-t pt-4 xs:pt-5">
                    {leader.experience && (
                      <div className="flex items-center justify-center gap-2 xs:gap-2.5">
                        <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-green-600 flex-shrink-0" />
                        <span>{leader.experience}</span>
                      </div>
                    )}
                    {leader.education && (
                      <div className="flex items-center justify-center gap-2 xs:gap-2.5">
                        <GraduationCap className="w-4 h-4 xs:w-5 xs:h-5 text-green-600 flex-shrink-0" />
                        <span>{leader.education}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Bio Section - Rohit Gupta */}
      <section className="py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-7 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center md:justify-end"
            >
              <div className="w-64 h-96 xs:w-72 xs:h-full sm:w-80 sm:h-full md:w-full md:h-full lg:w-full lg:h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <img
                  src="/team/Rohit_sir.JPG"
                  alt="Rohit Gupta - Founder"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                  }}
                />
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col justify-center"
            >
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 xs:mb-3">
                  Rohit Gupta
                </h2>
                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
                  <div className="h-1 xs:h-1.5 sm:h-2 w-12 xs:w-14 sm:w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
                  <p className="text-green-600 font-semibold text-sm xs:text-base sm:text-lg">Founder & Visionary</p>
                </div>
              </div>

              <div className="space-y-3 xs:space-y-4 sm:space-y-5 text-gray-700 text-sm xs:text-base sm:text-lg leading-relaxed max-h-96 overflow-y-auto pr-2 xs:pr-3 sm:pr-4 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100">
                <p>
                  Rohit Gupta is an accomplished technologist, entrepreneur, and educator with over <span className="font-semibold text-green-600">19 years of diverse industry experience</span>. A graduate of <span className="font-semibold">IIT Kharagpur (Class of 2006)</span>, he has worked with leading global organizations such as Accenture, IBM, HP, Wipro, and Manhattan Associates, contributing to transformative projects across telecom, storage, and supply chain domains.
                </p>

                <p>
                  Over the years, Rohit has developed a deep interest in <span className="font-semibold text-green-600">finance, digital lending, and financial inclusion</span>, which has significantly shaped his entrepreneurial journey. His strong analytical mindset, paired with his passion for simplifying financial access, has driven him to build innovative solutions that bridge technology with real-world financial needs.
                </p>

                <p>
                  As the Founder of <span className="font-semibold">SRS Exponential, Ixpoe, and Cashper.ai</span>, he has created impactful ventures across education, technology, and financial services.
                </p>

                <p>
                  <span className="font-semibold text-green-600">Cashper.ai</span>, his AI-driven fintech venture, reflects his commitment to transforming the financial ecosystem. The platform offers a comprehensive suite of financial products—including Short-Term Loans, Home Loans, Business Loans, Insurance, and Investment solutions—powered by intelligent automation and data-driven decision systems.
                </p>

                <p>
                  His vision is to make <span className="font-semibold text-green-600">finance accessible, transparent, fast, and user-centric</span>, enabling individuals and businesses to make smarter and more confident financial decisions.
                </p>

                <p>
                  Rohit firmly believes that <span className="font-semibold">technology, when aligned with financial innovation</span>, has the power to uplift lives, create opportunities, and drive long-term economic growth. He continues to inspire teams to build solutions that combine purpose, simplicity, and trust.
                </p>
              </div>

              {/* Key Highlights */}
              <div className="mt-6 xs:mt-7 sm:mt-8 pt-6 xs:pt-7 sm:pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 xs:p-4 sm:p-5 rounded-lg sm:rounded-xl border border-green-200">
                    <div className="flex items-start gap-2 xs:gap-3">
                      <Award className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs xs:text-sm sm:text-base">IIT Kharagpur</h4>
                        <p className="text-gray-600 text-xs">Class of 2006</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 xs:p-4 sm:p-5 rounded-lg sm:rounded-xl border border-green-200">
                    <div className="flex items-start gap-2 xs:gap-3">
                      <Briefcase className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs xs:text-sm sm:text-base">19+ Years</h4>
                        <p className="text-gray-600 text-xs">Industry Experience</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 xs:p-4 sm:p-5 rounded-lg sm:rounded-xl border border-green-200">
                    <div className="flex items-start gap-2 xs:gap-3">
                      <Rocket className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs xs:text-sm sm:text-base">3 Ventures</h4>
                        <p className="text-gray-600 text-xs">Founded</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 xs:p-4 sm:p-5 rounded-lg sm:rounded-xl border border-green-200">
                    <div className="flex items-start gap-2 xs:gap-3">
                      <Lightbulb className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs xs:text-sm sm:text-base">AI-Driven</h4>
                        <p className="text-gray-600 text-xs">Fintech Innovation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Fully Responsive and Functional */}
      <section className="py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 xl:py-20 bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 xs:w-40 sm:w-48 md:w-64 lg:w-80 h-32 xs:h-40 sm:h-48 md:h-64 lg:h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 xs:w-48 sm:w-56 md:w-72 lg:w-96 h-40 xs:h-48 sm:h-56 md:h-72 lg:h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 xs:w-56 sm:w-64 md:w-80 lg:w-96 h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 bg-green-400/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Heading */}
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 xs:mb-5 sm:mb-6 md:mb-7 lg:mb-8 px-2 leading-tight">
              Ready to Start Your <span className="text-yellow-300 inline-block animate-pulse">Financial Journey?</span>
            </h2>
            {/* Description */}
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-green-50/90 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 max-w-3xl mx-auto px-2 leading-relaxed font-medium">
              Join over 1.5 lakh satisfied customers who have achieved their dreams with our financial solutions
            </p>
            {/* CTA Buttons - Fully Functional */}
            <div className="flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-4 sm:gap-5 md:gap-6 justify-center items-stretch sm:items-center max-w-2xl mx-auto px-2 mb-6 xs:mb-7 sm:mb-8 md:mb-10">
              {/* Get Started Now Button - Opens Contact Form */}
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleContactNavigation();
                }}
                className="flex-1 sm:flex-initial bg-white text-green-700 font-bold px-6 xs:px-7 sm:px-8 md:px-10 lg:px-12 py-3.5 xs:py-4 sm:py-4.5 md:py-5 lg:py-6 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-green-200 transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center justify-center gap-2 xs:gap-2.5 sm:gap-3 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl cursor-pointer group active:scale-95"
              >
                <Phone className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform duration-300" />
                <span className="whitespace-nowrap">Get Started Now</span>
              </a>
              {/* Talk to Expert Button - Opens Phone/WhatsApp */}
              <div className="flex-1 sm:flex-initial flex flex-col xs:flex-row gap-2 xs:gap-3">
                {/* Call Button */}
                <a
                  href="tel:6200755759<br/>7393080847"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 py-3.5 xs:py-4 sm:py-4.5 md:py-5 lg:py-6 rounded-xl sm:rounded-2xl border-2 border-white/30 hover:border-white/60 shadow-xl hover:shadow-2xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center justify-center gap-2 xs:gap-2.5 sm:gap-3 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl cursor-pointer group active:scale-95"
                >
                  <Headphones className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-300" />
                  <span className="whitespace-nowrap hidden sm:inline">Talk to Expert</span>
                  <span className="whitespace-nowrap sm:hidden">Call Us</span>
                </a>
                {/* WhatsApp Button - Mobile/Tablet Only */}
                <a
                  href="https://wa.me/916200755759<br/>7393080847?text=Hello%2C%20I%20would%20like%20to%20start%20my%20financial%20journey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 xs:flex-initial bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 xs:px-5 sm:px-6 md:px-8 py-3.5 xs:py-4 sm:py-4.5 md:py-5 rounded-xl sm:rounded-2xl border-2 border-white/30 hover:border-white/60 shadow-xl hover:shadow-2xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center justify-center gap-2 xs:gap-2.5 text-sm xs:text-base sm:text-lg md:text-xl cursor-pointer group active:scale-95 sm:hidden"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="whitespace-nowrap">WhatsApp</span>
                </a>
              </div>
            </div>
            {/* Features - Enhanced Responsive */}
            <div className="mt-6 xs:mt-7 sm:mt-8 md:mt-10 lg:mt-12 flex flex-wrap justify-center items-center gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10 text-white px-2">
              <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-sm px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg">
                <Clock className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold whitespace-nowrap">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-sm px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg">
                <Shield className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold whitespace-nowrap">100% Secure</span>
              </div>
              <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-sm px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg">
                <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold whitespace-nowrap">Quick Approval</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};
export default Aboutus;
