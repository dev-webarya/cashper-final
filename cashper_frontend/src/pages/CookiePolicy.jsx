import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-600 leading-relaxed">
              Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience and analyze how our site is used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Types of Cookies We Use</h2>
            <div className="text-gray-600 leading-relaxed space-y-3">
              <div>
                <strong className="text-gray-800">Essential Cookies:</strong> Required for basic site functionality and security.
              </div>
              <div>
                <strong className="text-gray-800">Performance Cookies:</strong> Help us understand how visitors interact with our website.
              </div>
              <div>
                <strong className="text-gray-800">Functional Cookies:</strong> Remember your preferences and settings.
              </div>
              <div>
                <strong className="text-gray-800">Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign performance.
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Why We Use Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies to improve site functionality, personalize your experience, analyze site traffic, and deliver targeted marketing content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Some cookies are placed by third-party services that appear on our pages, such as analytics providers and social media platforms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Managing Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              You can control and manage cookies through your browser settings. Note that disabling cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookie Duration</h2>
            <p className="text-gray-600 leading-relaxed">
              Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device for a set period or until you delete them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Updates to Cookie Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Cookie Policy from time to time. Please review it periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about our use of cookies, please contact us at info@cashper.ai or call 6200755759<br/>7393080847.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
