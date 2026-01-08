import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { registerUser, googleLogin } from '../../services/api';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const passwordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Weak', color: 'bg-red-500' },
      { strength: 2, text: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, text: 'Good', color: 'bg-blue-500' },
      { strength: 4, text: 'Strong', color: 'bg-green-600' }
    ];
    return levels[strength];
  };
  const validateForm = () => {
    const newErrors = {};
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');
    
    try {
      // Call backend API to register user
      const response = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms: formData.agreeToTerms
      });

      console.log('Registration successful:', response);
      
      // Show success message
      toast.success('Account created successfully! Please login to continue.', {
        position: "top-center",
        autoClose: 2000,
      });
      
      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await googleLogin(credentialResponse.credential);
      
      // Store token and user data
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      
      localStorage.setItem('user', JSON.stringify({
        ...response.user,
        isAdmin: false
      }));
      
      toast.success('Account created with Google! Welcome! 🎉', {
        position: 'top-center',
        autoClose: 2000,
      });
      
      // Navigate to dashboard after successful signup
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
      
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error(error.response?.data?.detail || 'Google signup failed');
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup was cancelled or failed', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-3 xs:px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-sm xs:max-w-md sm:max-w-2xl lg:max-w-3xl">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-green-700"> Cashper</h1>
          </Link>
          <p className="text-gray-600 mt-2 text-sm xs:text-base">Create your account and start your financial journey</p>
        </div>
        {/* Registration Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 xs:p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Create Account</h2>

          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-9 xs:pl-10 pr-3 py-2.5 xs:py-3 text-sm xs:text-base border ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none`}
                  placeholder="Sudha"
                />
              </div>
              {errors.fullName && (
                <div className="flex items-center mt-1 text-red-500 text-xs xs:text-sm">
                  <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                  {errors.fullName}
                </div>
              )}
            </div>
            {/* Email and Phone in Grid */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-9 xs:pl-10 pr-3 py-2.5 xs:py-3 text-sm xs:text-base border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-1 text-red-500 text-xs xs:text-sm">
                    <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                    {errors.email}
                  </div>
                )}
              </div>
              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-9 xs:pl-10 pr-3 py-2.5 xs:py-3 text-sm xs:text-base border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none`}
                    placeholder="9876543210"
                    maxLength="10"
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center mt-1 text-red-500 text-xs xs:text-sm">
                    <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>
            {/* Password and Confirm Password in Grid */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-9 xs:pl-10 pr-10 py-2.5 xs:py-3 text-sm xs:text-base border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none`}
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] xs:text-xs text-gray-600">Strength:</span>
                      <span className={`text-[10px] xs:text-xs font-medium ${
                        strength.strength === 4 ? 'text-green-700' :
                        strength.strength === 3 ? 'text-blue-600' :
                        strength.strength === 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {strength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${strength.color}`}
                        style={{ width: `${(strength.strength / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <div className="flex items-center mt-1 text-red-500 text-xs xs:text-sm">
                    <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                    {errors.password}
                  </div>
                )}
              </div>
              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-9 xs:pl-10 pr-10 py-2.5 xs:py-3 text-sm xs:text-base border ${
                      errors.confirmPassword ? 'border-red-500' : 
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500' : 
                      'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <div className="flex items-center mt-1 text-green-700 text-xs xs:text-sm">
                    <CheckCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                    Passwords match
                  </div>
                )}
                {errors.confirmPassword && (
                  <div className="flex items-center mt-1 text-red-500 text-xs xs:text-sm">
                    <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>
            {/* Terms & Conditions */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-3.5 w-3.5 xs:h-4 xs:w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer ${
                      errors.agreeToTerms ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                <label htmlFor="agreeToTerms" className="ml-2 block text-xs xs:text-sm text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/legal/terms" className="text-green-700 hover:underline font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/legal/privacy" className="text-green-700 hover:underline font-medium">Privacy Policy</Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <div className="flex items-center mt-1 text-red-500 text-xs xs:text-sm">
                  <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                  {errors.agreeToTerms}
                </div>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-2.5 xs:py-3 sm:py-3.5 rounded-lg font-semibold text-sm xs:text-base hover:bg-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 xs:h-5 xs:w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="mt-5 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>
          </div>
          
          {/* Google Sign Up Button */}
          <div className="mt-5 sm:mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              width="100%"
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
            />
          </div>
          
          {/* Login Link */}
          <p className="mt-6 sm:mt-8 text-center text-xs xs:text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-700 hover:text-green-800 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default CreateAccount;
