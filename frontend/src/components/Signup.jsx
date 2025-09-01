import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import API_BASE_URL from '../config/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();
  const { username, email, password, confirmPassword } = formData;

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    return strength;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Update password strength for password field
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/signup`, {
        username,
        email,
        password
      });
      
      console.log('Signup successful:', res.data);
      setSuccess('Account created successfully! Redirecting to login...');
      
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Signup error:', err.response?.data);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-gray-300';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Enter password';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-800 flex items-center justify-center px-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* Floating Background Shapes */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
      />

      {/* Main Content */}
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Brand Section */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-tr from-white/20 to-white/10 backdrop-blur-xl rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl border border-white/20"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-3xl font-bold text-white">T</span>
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">Join Task Manager</h1>
          <p className="text-white/80">Create your account to get started with productivity.</p>
        </motion.div>

        {/* Signup Form */}
        <motion.form
          onSubmit={onSubmit}
          className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <motion.h2
            className="text-3xl font-bold mb-6 text-center text-white"
            variants={itemVariants}
          >
            Create Account
          </motion.h2>

          <AnimatePresence>
            {/* Error Message */}
            {error && (
              <motion.div
                className="mb-4 p-4 bg-red-500/20 border border-red-400/50 text-red-100 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                className="mb-4 p-4 bg-green-500/20 border border-green-400/50 text-green-100 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <CheckIcon className="w-5 h-5 mr-2" />
                  {success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username Field */}
          <motion.div
            className="mb-4"
            variants={itemVariants}
          >
            <label className="block text-white font-medium mb-2">Username</label>
            <motion.input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              required
              disabled={loading}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 backdrop-blur-sm transition-all duration-300"
              placeholder="Choose a username"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            {username && (
              <motion.div
                className="mt-2 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {username.length >= 3 ? (
                  <CheckIcon className="w-4 h-4 text-green-400 mr-1" />
                ) : (
                  <XMarkIcon className="w-4 h-4 text-red-400 mr-1" />
                )}
                <span className={`text-xs ${username.length >= 3 ? 'text-green-400' : 'text-red-400'}`}>
                  {username.length >= 3 ? 'Good username!' : 'At least 3 characters'}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div
            className="mb-4"
            variants={itemVariants}
          >
            <label className="block text-white font-medium mb-2">Email</label>
            <motion.input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              disabled={loading}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 backdrop-blur-sm transition-all duration-300"
              placeholder="Enter your email"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            {email && (
              <motion.div
                className="mt-2 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                  <CheckIcon className="w-4 h-4 text-green-400 mr-1" />
                ) : (
                  <XMarkIcon className="w-4 h-4 text-red-400 mr-1" />
                )}
                <span className={`text-xs ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'text-green-400' : 'text-red-400'}`}>
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Valid email!' : 'Please enter a valid email'}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div
            className="mb-4"
            variants={itemVariants}
          >
            <label className="block text-white font-medium mb-2">Password</label>
            <div className="relative">
              <motion.input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={onChange}
                required
                disabled={loading}
                className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 backdrop-blur-sm transition-all duration-300"
                placeholder="Create a strong password"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            {/* Password Strength Indicator */}
            {password && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-white/80">{getPasswordStrengthText()}</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div
            className="mb-6"
            variants={itemVariants}
          >
            <label className="block text-white font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <motion.input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required
                disabled={loading}
                className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 backdrop-blur-sm transition-all duration-300"
                placeholder="Confirm your password"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            {confirmPassword && (
              <motion.div
                className="mt-2 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {password === confirmPassword ? (
                  <CheckIcon className="w-4 h-4 text-green-400 mr-1" />
                ) : (
                  <XMarkIcon className="w-4 h-4 text-red-400 mr-1" />
                )}
                <span className={`text-xs ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? 'Passwords match!' : 'Passwords do not match'}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold shadow-2xl hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <motion.span
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </motion.svg>
                Creating Account...
              </motion.span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </span>
            )}
          </motion.button>

          {/* Login Link */}
          <motion.p
            className="mt-6 text-center text-white/80"
            variants={itemVariants}
          >
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-white hover:text-emerald-200 font-medium transition-colors duration-200"
            >
              Sign in here
            </Link>
          </motion.p>

          {/* Terms Notice */}
          <motion.div
            className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
            variants={itemVariants}
          >
            <p className="text-white/60 text-xs text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </motion.form>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          variants={itemVariants}
        >
          <p className="text-white/60 text-sm">
            Built by Subhankar Das • MERN Stack Developer
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
