import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { sendOTP, verifyOTP } from '../../services/api';

const OTPLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState({});
  
  const otpInputs = useRef([]);

  // Timer for OTP resend
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const validatePhone = () => {
    const newErrors = {};
    
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validatePhone()) return;
    
    setLoading(true);
    try {
      await sendOTP(phone);
      toast.success('OTP sent to your mobile number!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      await sendOTP(phone);
      toast.success('OTP resent successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to resend OTP', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setOtp(newOtp);
    
    const lastFilledIndex = pastedData.length - 1;
    if (lastFilledIndex < 5) {
      otpInputs.current[lastFilledIndex + 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await verifyOTP(phone, otpString);
      
      // Store token and user info
      localStorage.setItem('access_token', response.access_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 1500,
      });
      
      // Delay navigation slightly to ensure state updates
      setTimeout(() => {
        // Redirect based on user email
        if (response.user?.email === 'sudha@gmail.com') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 sm:px-8 py-6 sm:py-8">
            <Link to="/login" className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm">Back to Login</span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Mobile OTP Login
            </h2>
            <p className="mt-2 text-sm text-white/90">
              {step === 1 ? 'Enter your mobile number to receive OTP' : 'Enter the 6-digit OTP sent to your mobile'}
            </p>
          </div>

          {/* Form Section */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            {step === 1 ? (
              // Step 1: Phone Number Entry
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 text-base border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none`}
                      placeholder="9876543210"
                      maxLength="10"
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    We'll send a 6-digit OTP to verify your number
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            ) : (
              // Step 2: OTP Verification
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Change Number
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 text-center">
                      OTP sent to <span className="font-semibold text-gray-900">+91 {phone}</span>
                    </p>
                  </div>

                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        onPaste={handleOTPPaste}
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  {/* Timer and Resend */}
                  <div className="mt-4 text-center">
                    {!canResend ? (
                      <p className="text-sm text-gray-600">
                        Resend OTP in <span className="font-semibold text-green-600">{timer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Verify & Login
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Alternative Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Login with Email & Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
