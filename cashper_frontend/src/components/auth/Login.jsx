import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { loginUser, adminLogin, googleLogin } from '../../services/api';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
    e.stopPropagation();
    
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError('');
    
    try {
      // Always use regular login API - backend will return user info with isAdmin flag
      const response = await loginUser(formData.email, formData.password);
      
      // Store token
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      
      // Check if user is admin based on backend response
      const isAdmin = response.user?.role === 'admin' || response.user?.isAdmin === true;
      
      // Store user data with admin flag
      localStorage.setItem('user', JSON.stringify({
        ...response.user,
        isAdmin: isAdmin
      }));
      
      // Route based on admin status
      if (isAdmin) {
        toast.success('Welcome Admin! 🎉');
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.success('Login successful! Welcome back! 🎉');
        
        // Check if user came from ITR form or other service form
        const redirectPath = searchParams.get('redirect') || location.state?.from;
        
        console.log('Login - Redirect path:', redirectPath);
        
        if (redirectPath) {
          // Small delay to ensure token is stored
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 100);
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setApiError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await googleLogin(credentialResponse.credential);
      
      // Store token (already done by googleLogin, but ensure it's there)
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      
      // Check user role and redirect accordingly
      if (response.user && response.user.role === 'admin') {
        // Store admin token and user data with isAdmin flag
        localStorage.setItem('user', JSON.stringify({
          ...response.user,
          isAdmin: true
        }));
        
        toast.success('Welcome Admin! 🎉');
        navigate('/admin', { replace: true });
      } else {
        // Store user data
        localStorage.setItem('user', JSON.stringify({
          ...response.user,
          isAdmin: false
        }));
        
        toast.success('Google login successful!');
        
        // Check if user came from ITR form or other service form
        const redirectPath = searchParams.get('redirect') || location.state?.from;
        
        console.log('Google Login - Redirect path:', redirectPath);
        
        if (redirectPath) {
          // Small delay to ensure token is stored
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 100);
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.detail || 'Google login failed');
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login was cancelled or failed', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-3 xs:px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-sm xs:max-w-md sm:max-w-lg">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-green-700"> Cashper</h1>
          </Link>
          <p className="text-gray-600 mt-2 text-sm xs:text-base">Welcome back! Please login to your account</p>
        </div>
        {/* Login Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 xs:p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Login</h2>
          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{apiError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
                  placeholder="Enter your password"
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
              {errors.password && (
                <div className="flex items-center mt-1 text-red-500 text-xs xs:text-sm">
                  <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 flex-shrink-0" />
                  {errors.password}
                </div>
              )}
            </div>
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-xs xs:text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-xs xs:text-sm font-medium text-green-700 hover:text-green-800 transition-colors">
                Forgot password?
              </Link>
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
                  Logging in...
                </>
              ) : (
                'Login'
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
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>
          
          {/* Google Login Button */}
          <div className="mt-5 sm:mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              width="100%"
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          
          {/* Sign Up Link */}
          <p className="mt-5 sm:mt-6 text-center text-xs xs:text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/create-account" className="font-medium text-green-700 hover:text-green-800 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
