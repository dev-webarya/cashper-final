import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BlogInsights from '../components/BlogInsights';
import FeaturedOffers from '../components/FeaturedOffers';
import ServicesOverview from '../components/ServicesOverview';
import AboutSection from '../components/AboutSection';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
const EnhancedHomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Existing Sections - Must Remain Unchanged */}
      <Navbar />
      <HeroSection />
      <ServicesOverview />
      <FeaturedOffers />
      {/* New Sections - Added as Per Requirements */}
      <AboutSection />
      <WhyChooseUs />
      <Testimonials />
      <BlogInsights />
      <Footer />
    </div>
  );
};
export default EnhancedHomePage;
