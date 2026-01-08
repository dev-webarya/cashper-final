import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Phone, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { verifyPhone } from '../../services/api';

const VerifyPhone = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your phone number...');

  useEffect(() => {
    const verify = async () => {
      if (!userId) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await verifyPhone(userId);
        setStatus('success');
        setMessage(response.message || 'Phone number verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Phone verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Phone verification failed. Please try again.');
      }
    };

    verify();
  }, [userId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-green-700">Cashper</h1>
          </Link>
          <p className="text-gray-600 mt-2">Phone Verification</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            {/* Icon based on status */}
            {status === 'verifying' && (
              <div className="flex justify-center mb-6">
                <Loader className="h-16 w-16 text-green-700 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="h-16 w-16 text-green-700" />
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
            )}

            {/* Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {status === 'verifying' && 'Verifying Phone...'}
              {status === 'success' && 'Phone Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* Actions based on status */}
            {status === 'success' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Redirecting to dashboard in 3 seconds...
                </p>
                <Link
                  to="/dashboard"
                  className="inline-block w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                >
                  Go to Dashboard Now
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  className="inline-block w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <p className="text-sm text-gray-500">
                  Or{' '}
                  <Link to="/login" className="text-green-700 hover:underline font-medium">
                    login to your account
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Need help?{' '}
          <Link to="/contact" className="text-green-700 hover:underline font-medium">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyPhone;

