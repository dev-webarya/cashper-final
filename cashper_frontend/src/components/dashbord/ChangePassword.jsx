import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { changePassword } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ChangePassword = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const handlePasswordChange = async () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(passwordForm.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        // Call backend API to change password
        await changePassword(
          passwordForm.currentPassword,
          passwordForm.newPassword,
          passwordForm.confirmPassword
        );
        
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
        
        toast.success('Password changed successfully! Please login again.', {
          position: "top-center",
          autoClose: 2000,
        });
        
        // Logout and redirect to login after 2 seconds
        setTimeout(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          navigate('/login');
        }, 2000);
        
      } catch (error) {
        console.error('Failed to change password:', error);
        toast.error(error.message || 'Failed to change password', {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl flex items-center gap-2 sm:gap-3 animate-slideInRight">
          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Change Password</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Update your account password for better security</p>
        </div>
      </div>
      {/* Password Change Form */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Security Notice */}
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-blue-900 font-semibold mb-1">Security Reminder</p>
                <p className="text-xs sm:text-sm text-blue-800">
                  Choose a strong password that you don't use for other accounts. After changing your password, you'll need to log in again.
                </p>
              </div>
            </div>
          </div>

          {/* Current Password */}
          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 pr-12 text-sm sm:text-base rounded-lg border-2 ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                } focus:border-green-500 focus:outline-none transition-all`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs sm:text-sm text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />{errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">New Password *</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 pr-12 text-sm sm:text-base rounded-lg border-2 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                } focus:border-green-500 focus:outline-none transition-all`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs sm:text-sm text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />{errors.newPassword}
              </p>
            )}
            
            {/* Password Strength Indicator */}
            {passwordForm.newPassword && (
              <div className="mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2 sm:mb-3">Password Requirements:</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    { test: passwordForm.newPassword.length >= 8, label: 'At least 8 characters' },
                    { test: /[A-Z]/.test(passwordForm.newPassword), label: 'One uppercase letter (A-Z)' },
                    { test: /[a-z]/.test(passwordForm.newPassword), label: 'One lowercase letter (a-z)' },
                    { test: /[0-9]/.test(passwordForm.newPassword), label: 'One number (0-9)' },
                    { test: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword), label: 'One special character (!@#$...)' }
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${
                        req.test ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {req.test && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                      </div>
                      <span className={`text-xs sm:text-sm ${req.test ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">Confirm New Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 pr-12 text-sm sm:text-base rounded-lg border-2 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } focus:border-green-500 focus:outline-none transition-all`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs sm:text-sm text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />{errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
            <button
              onClick={() => setActiveView('profile')}
              disabled={loading}
              className="flex-1 px-6 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="flex-1 px-6 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs sm:text-sm text-yellow-900">
              <strong>⚠️ Important:</strong> After changing your password, you will be automatically logged out and need to sign in again with your new password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
