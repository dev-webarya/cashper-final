import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Contactus from '../components/Contactus';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <Contactus />
      <Footer />
    </div>
  );
};

export default ContactPage;
