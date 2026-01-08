import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Added pt-20 for top padding to avoid navbar overlap */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-600 text-sm sm:text-base">Last updated: October 29, 2025</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-8">
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              By accessing and using  Cashper's services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>You must be at least 18 years old to use our services</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">2. Use of Services</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              Our services are provided for lawful purposes only. You agree to use our platform in accordance with all applicable laws and regulations.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Use services only for legitimate financial purposes</li>
              <li>Do not attempt to manipulate or abuse the system</li>
              <li>Comply with all local, state, and federal laws</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">3. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Provide accurate and truthful information</li>
              <li>Update your information when necessary</li>
              <li>You are liable for all activities under your account</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">4. Financial Services</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              All loan applications, insurance policies, and investment services are subject to approval and compliance with relevant regulations.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Loan approvals are subject to credit checks and verification</li>
              <li>Interest rates and terms may vary based on eligibility</li>
              <li>Insurance policies subject to underwriting approval</li>
              <li>Investment services carry inherent risks</li>
              <li>Tax planning advice is for informational purposes only</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
               Cashper shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of our services.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>We are not liable for investment losses</li>
              <li>No warranty on service availability or accuracy</li>
              <li>Not responsible for third-party service failures</li>
              <li>Users assume all risks of using the platform</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              All content, trademarks, and data on this platform are the property of  Cashper and protected by applicable intellectual property laws.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>No unauthorized use of our trademarks or logos</li>
              <li>Content may not be copied without permission</li>
              <li>We retain all rights to platform technology</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">7. Termination</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              We reserve the right to suspend or terminate your account at any time for violation of these terms or any fraudulent activity.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Accounts may be terminated for terms violations</li>
              <li>You may close your account at any time</li>
              <li>Outstanding obligations remain after termination</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">8. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of modified terms.
            </p>
            <ul className="ml-6 space-y-2 text-gray-600 text-sm sm:text-base list-disc">
              <li>Changes will be posted on this page</li>
              <li>Major changes will be communicated via email</li>
              <li>Review terms regularly for updates</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">9. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-3">10. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
              For questions about these Terms of Service, please contact us:
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

export default TermsOfService;
