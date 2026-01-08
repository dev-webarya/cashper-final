import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Aboutus from '../components/Aboutus';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Aboutus />
      <Footer />
    </div>
  );
};

export default AboutPage;


