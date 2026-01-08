import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";
import { submitContactForm, getFAQs } from "../services/api";

const Contactus = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number (10 digits required)";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");
    
    try {
      // Submit form to backend API
      const response = await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });

      // Show success message
      setSuccessMessage("Thank you! Your message has been received. Our team will get back to you within 24 hours.");
      
      // Reset form
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error("Contact form submission error:", error);
      setErrors({ 
        submit: error.message || "Failed to submit contact form. Please try again or call us directly at 6200755759 / 7393080847." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [faqs, setFaqs] = useState([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);

  const faqCategories = [
    { id: 'all', name: 'All Questions', icon: '🌟', color: 'from-green-600 to-emerald-600' },
    { id: 'loans', name: 'Loans', icon: '💰', color: 'from-green-500 to-green-700' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: 'from-emerald-500 to-green-600' },
    { id: 'investments', name: 'Investments', icon: '📈', color: 'from-green-600 to-teal-600' },
    { id: 'tax', name: 'Tax Planning', icon: '📊', color: 'from-teal-600 to-green-700' }
  ];

  // Fallback FAQs (in case API fails or no FAQs in database)
  const fallbackFaqs = [
    {
      category: 'loans',
      question: "What types of loans do you offer and what are the eligibility criteria?",
      answer: "We offer Short-Term Loans (3-12 months tenure), Personal Loans (up to ₹25 lakhs), Home Loans (up to ₹5 crores), and Business Loans (customized solutions). Eligibility: Age 21-65 years, minimum income ₹25,000/month for personal loans, credit score 650+, and stable employment/business for 2+ years.",
      highlight: "Quick approval in 24-48 hours"
    },
    {
      category: 'loans',
      question: "What are your interest rates and processing fees?",
      answer: "Interest rates start from 7.5% p.a. for home loans, 9.5% p.a. for business loans, and 10.5% p.a. for personal loans (rates vary based on credit score and loan amount). Processing fees: 0.5% to 2% of loan amount. Zero prepayment charges on floating rate loans. Special offers available for salaried professionals and government employees.",
      highlight: "Lowest rates in the market"
    },
    {
      category: 'loans',
      question: "How long does loan approval and disbursement take?",
      answer: "Our digital-first approach ensures rapid processing: Document verification (24 hours), Credit assessment (24-48 hours), Final approval (2-3 business days), Disbursement (within 24 hours post-approval). Total timeline: 3-7 working days from application to fund transfer. Emergency loans can be processed within 24 hours with premium service.",
      highlight: "Fastest disbursement guaranteed"
    },
    {
      category: 'insurance',
      question: "What insurance products are available and how do I choose the right one?",
      answer: "We provide comprehensive insurance solutions:\n\n🏥 Health Insurance: Individual plans (₹3L-₹50L coverage), Family floater plans, Critical illness cover, Top-up plans\n\n🚗 Motor Insurance: Car insurance (comprehensive & third-party), Two-wheeler insurance, Commercial vehicle insurance\n\n👨‍👩‍👧 Term Insurance: Life cover up to ₹2 crores, Income replacement plans, Loan protection plans\n\nOur advisors provide free consultation to assess your needs and recommend the best policy based on your family situation, budget, and risk profile.",
      highlight: "Free expert consultation"
    },
    {
      category: 'insurance',
      question: "How do insurance claims work and what's the settlement process?",
      answer: "Our streamlined claim process ensures quick settlements:\n\n1️⃣ Intimate claim (24/7 helpline available)\n2️⃣ Submit documents (online portal or app)\n3️⃣ Claim verification (48-72 hours)\n4️⃣ Settlement approval (3-7 working days)\n\nFor cashless hospitalization, no upfront payment needed at network hospitals. Motor insurance claims processed within 7 days. We provide dedicated claim assistance and handle all paperwork. Our claim settlement ratio: 98.5%.",
      highlight: "98.5% claim settlement ratio"
    },
    {
      category: 'investments',
      question: "What investment options do you offer and what are the expected returns?",
      answer: "We offer diversified investment solutions:\n\n📊 Mutual Funds:\n• Equity Funds (Expected: 12-15% p.a.)\n• Debt Funds (Expected: 7-9% p.a.)\n• Hybrid Funds (Expected: 9-12% p.a.)\n• Tax-saving ELSS (Expected: 12-18% p.a.)\n\n💹 SIP (Systematic Investment Plans):\n• Start with just ₹500/month\n• Rupee cost averaging benefits\n• Long-term wealth creation\n• Flexible increase options\n\nRisk profiling done free to match investments with your goals. All funds are SEBI-registered and tracked through our advanced portfolio management system.",
      highlight: "Start SIP with just ₹500"
    },
    {
      category: 'investments',
      question: "How safe are mutual fund investments and can I withdraw anytime?",
      answer: "Mutual funds are regulated by SEBI and monitored by professional fund managers. Your investments are held in a separate demat account for security. Risk levels vary:\n\n✅ Low Risk: Debt funds, liquid funds (suitable for short-term)\n⚠️ Moderate Risk: Hybrid funds, balanced advantage funds\n📈 High Risk: Equity funds (recommended for 5+ years)\n\nWithdrawal (Redemption) Process:\n• Liquid funds: Same day withdrawal\n• Debt funds: 1-3 business days\n• Equity funds: 3-5 business days\n• ELSS: 3-year lock-in period\n\nNo penalties for redemption (except ELSS). We provide real-time portfolio tracking via mobile app.",
      highlight: "100% safe & SEBI regulated"
    },
    {
      category: 'tax',
      question: "How can your tax planning services help me save taxes legally?",
      answer: "Our certified tax consultants help you maximize deductions and save taxes:\n\n💼 Personal Tax Planning:\n• Section 80C: Up to ₹1.5L (ELSS, PPF, Insurance)\n• Section 80D: Up to ₹25K-₹1L (Health insurance)\n• Section 24: Up to ₹2L (Home loan interest)\n• HRA & LTA optimization\n• Tax-efficient salary structuring\n\n🏢 Business Tax Strategy:\n• GST compliance & optimization\n• Corporate tax planning\n• Depreciation benefits\n• Capital gains tax planning\n• Expense optimization\n\nWe ensure 100% legal compliance while maximizing your tax savings. Free tax audit for business clients.",
      highlight: "Save up to ₹1.5L in taxes"
    },
    {
      category: 'tax',
      question: "When should I start tax planning and what documents do I need?",
      answer: "Best time to start: Beginning of financial year (April) for maximum optimization. But we can help anytime throughout the year.\n\n📄 Documents Required:\n\nFor Salaried Individuals:\n• Form 16 from employer\n• Salary slips (last 3 months)\n• Bank statements\n• Investment proofs (LIC, PPF, ELSS)\n• Home loan statement\n• Rent receipts (if claiming HRA)\n\nFor Business Owners:\n• GST returns\n• Balance sheet & P&L statement\n• TDS certificates\n• Business expense bills\n• Asset purchase invoices\n\nOur experts will guide you through the entire process and help collect necessary documents. Free initial consultation available.",
      highlight: "Free consultation available"
    },
    {
      category: 'loans',
      question: "Can I get a loan with a low credit score or no credit history?",
      answer: "Yes! We understand that everyone's financial journey is unique. For low credit scores (550-649) or no credit history:\n\n✅ Options available:\n• Secured loans (against FD, property, gold)\n• Co-applicant or guarantor-based loans\n• Smaller loan amounts with higher interest\n• Credit builder programs\n\n📈 We also offer:\n• Free credit score improvement guidance\n• Credit report analysis\n• Tips to build creditworthiness\n• Regular progress tracking\n\nStart small, build credit, and qualify for better rates over time. Our credit counselors are here to help you succeed.",
      highlight: "Bad credit? No problem!"
    }
  ];

  // Fetch FAQs from backend on component mount
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setIsLoadingFaqs(true);
        const response = await getFAQs(activeCategory === 'all' ? null : activeCategory);
        
        if (response && response.length > 0) {
          setFaqs(response);
        } else {
          // Use fallback FAQs if no FAQs in database
          setFaqs(fallbackFaqs);
        }
      } catch (error) {
        console.error("Error loading FAQs:", error);
        // Use fallback FAQs on error
        setFaqs(fallbackFaqs);
      } finally {
        setIsLoadingFaqs(false);
      }
    };

    loadFAQs();
  }, [activeCategory]); // Reload when category changes

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Fully Responsive with Tailwind CSS */}
      <div 
        className="relative w-full min-h-[320px] xs:min-h-[350px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px] 2xl:min-h-[560px] overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/image copy 3.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "scroll",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Background Elements - Responsive */}
        <div className="absolute top-1/4 left-1/4 w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-blue-400/20 rounded-full blur-2xl z-20"></div>
        <div className="absolute top-3/4 right-1/4 w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-purple-400/20 rounded-full blur-2xl z-20"></div>
        <div className="absolute bottom-1/3 left-3/4 w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-cyan-400/20 rounded-full blur-2xl z-20"></div>
        
        {/* Content Container */}
        <div className="relative z-30 min-h-[320px] xs:min-h-[450px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[580px] flex flex-col items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12">
          <div className="text-center max-w-4xl mx-auto w-full">

            <h1 className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent mb-3 xs:mb-4 leading-tight px-2">
              Contact Us
            </h1>
            
            <p className="text-white/80 max-w-2xl mx-auto text-sm xs:text-base sm:text-lg md:text-xl leading-relaxed px-2">
              Get instant support for all your financial needs. Our expert team is ready to assist you 24/7.
            </p>
            
            <div className="mt-4 xs:mt-5 sm:mt-6 flex flex-wrap justify-center gap-2 xs:gap-3 px-2">
              <div className="flex items-center gap-1.5 xs:gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-md border border-white/10 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-white/90 text-xs xs:text-sm font-medium">Instant Response</span>
              </div>
              <div className="flex items-center gap-1.5 xs:gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/10 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/90 text-xs xs:text-sm font-medium">Expert Guidance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content Section */}
      <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-green-50/30 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        {/* Social Media */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="text-center mb-4 xs:mb-5 sm:mb-6">
            <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent mb-1">Stay Connected</h3>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base">Follow us for latest updates & financial tips</p>
          </div>
          <div className="flex justify-center gap-3">
            {[
              { Icon: FaFacebook, href: "https://www.facebook.com/profile.php?id=61585416795807", label: "Facebook", gradient: "from-green-500 to-green-600", shadow: "shadow-green-200" },
              { Icon: FaTwitter, href: "#", label: "Twitter", gradient: "from-emerald-400 to-emerald-500", shadow: "shadow-emerald-200" },
              { Icon: FaLinkedin, href: "https://www.linkedin.com/company/cashper-ai/", label: "LinkedIn", gradient: "from-green-600 to-green-700", shadow: "shadow-green-300" },
              { Icon: FaInstagram, href: "https://www.instagram.com/cashper.ai?igsh=MWZ5dXhianFoemphaQ==", label: "Instagram", gradient: "from-teal-500 to-green-600", shadow: "shadow-teal-200" },
              { Icon: FaYoutube, href: "https://www.youtube.com/@CASHPER-n7z", label: "YouTube", gradient: "from-red-500 to-red-600", shadow: "shadow-red-200" }
            ].map(({ Icon, href, label, gradient, shadow }) => (
              <a 
                key={label} 
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1`} 
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Contact Form */}
          <div className="bg-white/90 backdrop-blur-md p-6 lg:p-8 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-full text-base font-semibold mb-3">
                  <FaEnvelope className="w-4 h-4" />
                  Quick Contact
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Send Message</h2>
                <p className="text-gray-600 text-base">Get response within 2 hours</p>
              </div>
            {successMessage && (
              <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center">
                {successMessage}
              </div>
            )}
            {errors.submit && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">{errors.submit}</div>
            )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Enter your full name" 
                      className={`w-full p-4 border-2 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-3 focus:ring-green-400/30 focus:border-green-500 transition-all duration-300 text-base ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30' : 'border-gray-200 hover:border-green-300'}`} 
                      required 
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><span>⚠</span>{errors.name}</p>}
                  </div>
                  <div className="relative">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Enter your email address" 
                      className={`w-full p-4 border-2 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-3 focus:ring-green-400/30 focus:border-green-500 transition-all duration-300 text-base ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30' : 'border-gray-200 hover:border-green-300'}`} 
                      required 
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder="Enter your phone number" 
                      className={`w-full p-4 border-2 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-3 focus:ring-green-400/30 focus:border-green-500 transition-all duration-300 text-base ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30' : 'border-gray-200 hover:border-green-300'}`} 
                      required 
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><span>⚠</span>{errors.phone}</p>}
                  </div>
                  <div className="relative">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Subject *</label>
                    <input 
                      type="text" 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange} 
                      placeholder="Enter message subject" 
                      className={`w-full p-4 border-2 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-3 focus:ring-green-400/30 focus:border-green-500 transition-all duration-300 text-base ${errors.subject ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30' : 'border-gray-200 hover:border-green-300'}`} 
                      required 
                    />
                    {errors.subject && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><span>⚠</span>{errors.subject}</p>}
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-base font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder="Tell us how we can help you..." 
                    rows="4" 
                    className={`w-full p-4 border-2 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-3 focus:ring-green-400/30 focus:border-green-500 transition-all duration-300 resize-none text-base ${errors.message ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30' : 'border-gray-200 hover:border-green-300'}`} 
                    required
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><span>⚠</span>{errors.message}</p>}
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-base relative overflow-hidden ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-green-500/25 hover:scale-105'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center relative z-10">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <FaEnvelope className="w-5 h-5" />
                      Send Message
                    </span>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-2">
                  Secure & confidential • Response within 2 hours
                </p>
              </form>
            </div>
          </div>
          {/* Contact Info */}
          <div className="bg-gradient-to-br from-white via-slate-50 to-green-50/40 backdrop-blur-md p-6 lg:p-8 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-transparent rounded-full -translate-y-16 -translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="text-center lg:text-left mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-full text-base font-semibold mb-3">
                  <FaPhone className="w-4 h-4" />
                  Contact Info
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Get in Touch
                </h2>
                <p className="text-gray-600 text-base">Multiple ways to reach us</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: FaMapMarkerAlt,
                    title: "Office Location",
                    details: "B - 3011, Gaur Siddhartham\nSiddhartha Vihar, Ghaziabad\nUttar Pradesh - 201009",
                    gradient: "from-red-500 to-pink-500",
                    bg: "bg-red-50/80",
                  },
                  {
                    icon: FaPhone,
                    title: "Phone Support",
                    details: "6200755759  , 7393080847\n",
                    gradient: "from-green-500 to-emerald-500",
                    bg: "bg-green-50/80",
                    link: "tel:6200755759 ,7393080847",
                    clickable: true,
                  },
                  {
                    icon: FaEnvelope,
                    title: "Email Support",
                    details: " info@cashper.ai \n",
                    gradient: "from-teal-500 to-green-500",
                    bg: "bg-teal-50/80",
                    link: "mailto:info@cashper.ai",
                    clickable: true,
                  },
                  {
                    icon: FaClock,
                    title: "Business Hours",
                    details: "Mon-Sun: 9 AM - 6 PM\n\n",
                    gradient: "from-orange-500 to-yellow-500",
                    bg: "bg-orange-50/80",
                  },
                ].map((item, idx) => {
                  const ContactItem = item.clickable ? 'a' : 'div';
                  const contactProps = item.clickable 
                    ? { href: item.link, onClick: (e) => { e.preventDefault(); window.location.href = item.link; } }
                    : {};
                  
                  return (
                    <ContactItem
                      key={idx}
                      {...contactProps}
                      className={`flex items-start gap-4 p-4 rounded-xl ${item.bg} hover:shadow-md transition-all duration-300 border border-white/60 hover:scale-105 hover:-translate-y-1 ${item.clickable ? 'cursor-pointer' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient} flex items-center justify-center shadow-md`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-base mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    </ContactItem>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200/50">
                <h3 className="font-bold text-gray-700 mb-3 text-center lg:text-left text-base">Quick Actions</h3>
                <div className="flex gap-3">
                  <a
                    href="tel:6200755759<br/>7393080847"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-base flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <FaPhone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href="mailto:info@cashper.ai"
                    className="flex-1 bg-gradient-to-r from-teal-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-base flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <FaEnvelope className="w-4 h-4" />
                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 bg-white/90 backdrop-blur-md p-4 lg:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-white/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-100/40 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-full text-base font-semibold mb-3">
                <FaMapMarkerAlt className="w-4 h-4" />
                Visit Us
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Our Location</h3>
              <p className="text-gray-600 text-base">Ghaziabad, Uttar Pradesh</p>
            </div>
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.3926890719876!2d77.38494267549927!3d28.652671075663244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfb6e8ef8c3a5%3A0x8e8f8e8e8e8e8e8e!2sGaur%20Siddhartham%2C%20Siddhartha%20Vihar%2C%20Ghaziabad%2C%20Uttar%20Pradesh%20201009!5e0!3m2!1sen!2sin!4v1696867890000!5m2!1sen!2sin"
                className="w-full h-[280px] sm:h-[320px] lg:h-[360px] border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-md">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  Ghaziabad Office
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Gaur+Siddhartham,+Siddhartha+Vihar,+Ghaziabad,+Uttar+Pradesh+201009"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-800 to-black text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-base hover:scale-105"
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="pb-8 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 xs:mb-7 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 xs:gap-2 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-sm xs:text-base font-semibold mb-3 xs:mb-4 shadow-lg">
              <span className="text-lg xs:text-xl">💡</span>
              <span className="tracking-wide">HELP CENTER</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-green-700 to-emerald-700 bg-clip-text text-transparent mb-3 xs:mb-4 leading-tight px-2">
              Expert Answers to Your Questions
            </h2>
            <p className="text-gray-600 text-sm xs:text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-2">
              Get instant clarity on loans, insurance, investments & tax planning
            </p>
            
            {/* Category Filter Pills */}
            <div className="mt-4 xs:mt-6 sm:mt-8 flex justify-center gap-1.5 xs:gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-2">
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-3.5 rounded-full font-semibold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 shadow-md hover:shadow-xl whitespace-nowrap hover:scale-105 hover:-translate-y-1 ${
                    activeCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white transform scale-105`
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
            {/* Results Count */}
            <div className="mt-4 xs:mt-5 sm:mt-6 text-sm xs:text-base text-gray-500">
              Showing <span className="font-bold text-green-600">{filteredFaqs.length}</span> {filteredFaqs.length === 1 ? 'question' : 'questions'}
            </div>
          </div>
          <div className="space-y-3 xs:space-y-4 sm:space-y-5">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="relative border-2 border-green-100 rounded-2xl overflow-hidden bg-gradient-to-br from-white via-white to-green-50/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105 hover:-translate-y-1"
              >
                <button
                  className="w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 text-left bg-transparent hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/30 flex justify-between items-start gap-3 xs:gap-4 sm:gap-6 transition-all duration-300"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  <div className="flex-1">
                      <span className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 font-normal leading-tight block group-hover:text-green-600 transition-colors duration-300">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                  >
                    <svg className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openFaqIndex === index && (
                  <div className="overflow-hidden transition-all duration-400">
                    <div className="px-3 xs:px-4 sm:px-5 md:px-6 lg:px-7 pb-4 xs:pb-5 sm:pb-6 pt-2 bg-gradient-to-br from-green-50/70 via-emerald-50/50 to-green-50/30 text-gray-700 leading-relaxed border-t-2 border-green-100/50 text-xs xs:text-sm sm:text-base">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 xs:p-4 sm:p-5 shadow-inner border border-white/60 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Additional Help Section */}
          <div className="mt-10 sm:mt-14 text-center">
            <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white p-8 sm:p-10 lg:p-12 rounded-3xl shadow-2xl overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-block mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-4 border-white/30">
                    <span className="text-4xl sm:text-5xl">🤝</span>
                  </div>
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
                  Can't Find Your Answer?
                </h3>
                <p className="text-green-100 mb-3 text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
                  Our dedicated support team of financial experts is available 24/7 to provide personalized assistance
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 mt-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
                    <div className="text-3xl sm:text-4xl font-bold">24/7</div>
                    <div className="text-sm sm:text-base text-green-100">Support</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
                    <div className="text-3xl sm:text-4xl font-bold">&lt;2 min</div>
                    <div className="text-sm sm:text-base text-green-100">Response</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
                    <div className="text-3xl sm:text-4xl font-bold">98%</div>
                    <div className="text-sm sm:text-base text-green-100">Satisfaction</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href="tel:6200755759<br/>7393080847"
                    className="bg-white text-green-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 flex items-center gap-3 group hover:scale-105 hover:-translate-y-1"
                  >
                    <FaPhone className="w-6 h-6" />
                    Call: 6200755759<br/>7393080847
                  </a>
                  <a
                    href="https://wa.me/916200755759<br/>7393080847?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-green-700 border-2 border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl hover:bg-green-50 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group hover:scale-105 hover:-translate-y-1"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Chat
                  </a>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-green-100 text-base sm:text-lg mb-4">
                    💼 Expert financial advisors | 🔒 100% confidential | ⚡ Instant solutions
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 text-sm sm:text-base">
                    <span className="bg-white/10 px-3 py-1 rounded-full">Free Consultation</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">No Obligation</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">Multilingual Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contactus;
