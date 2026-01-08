import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Added pt-20 for top padding to avoid navbar overlap */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-600 text-sm sm:text-base">Last updated: October 29, 2025</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-8">
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We collect information you provide directly to us, including personal details, financial information, and contact details when you use our services.
            </p>
            <ul className="mt-3 ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Personal identification information (Name, Email, Phone number)</li>
              <li>Financial information for loan applications</li>
              <li>Usage data and cookies</li>
            </ul>
          </section>
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Your information is used to process applications, provide financial services, communicate with you, and improve our offerings. We are committed to protecting your privacy.
            </p>
            <ul className="mt-3 ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Processing loan and service applications</li>
              <li>Communicating about your account and services</li>
              <li>Improving our platform and user experience</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">3. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We do not sell your personal information. We may share information with trusted partners for service delivery and regulatory compliance purposes only.
            </p>
            <ul className="mt-3 ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>With financial institutions for loan processing</li>
              <li>With regulatory authorities when required by law</li>
              <li>With service providers who assist our operations</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We implement industry-standard security measures to protect your personal and financial information from unauthorized access, disclosure, or misuse.
            </p>
            <ul className="mt-3 ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>SSL encryption for data transmission</li>
              <li>Secure servers and databases</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">5. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              You have the right to access, correct, or delete your personal informatio
              n. You may also opt-out of marketing communications at any time.
            </p>
            <ul className="mt-3 ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability rights</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">6. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. See our Cookie Policy for details.
            </p>
            <ul className="mt-3 ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Essential cookies for website functionality</li>
              <li>Analytics cookies to understand usage</li>
              <li>Marketing cookies for personalized content</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">7. Updates to This Policy</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We may update this Privacy Policy periodically. We will notify you of any significant changes through our website or via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              For privacy-related questions or concerns, please contact us:
            </p>
            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700 text-sm sm:text-base">
                <span className="font-semibold">Email:</span> info@cashper.ai
              </p>
              <p className="text-gray-700 text-sm sm:text-base">
                <span className="font-semibold">Phone:</span> 6200755759, 7393080847
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
