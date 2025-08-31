// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TaskList from './TaskList';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Simulate loading for smooth animation
    setTimeout(() => {
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // If user data is corrupted, clear it and redirect to login
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
      }
      setIsLoading(false);
    }, 1200);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
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

  // Get user's first letter for avatar
  const getUserInitial = () => {
    if (user?.username) return user.username[0].toUpperCase();
    if (user?.name) return user.name[0].toUpperCase();
    return 'U';
  };

  // Get user's display name
  const getUserDisplayName = () => {
    return user?.username || user?.name || 'Champion';
  };

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(50)].map((_, i) => (
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

        {/* Loading Content */}
        <motion.div
          className="text-center z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="relative w-32 h-32 mx-auto mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="absolute inset-0 border-4 border-white/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-white/40 border-t-white rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-6 border-4 border-white/60 border-r-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          
          <motion.h2
            className="text-2xl font-bold text-white mb-4"
            variants={itemVariants}
          >
            Crafting Your Experience
          </motion.h2>
          
          <motion.div
            className="flex space-x-2 justify-center"
            variants={itemVariants}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Floating Background Elements */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
        />

        {/* Header */}
        <motion.header
          className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="max-w-7xl mx-auto px-6 py-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center text-white text-2xl font-bold transform rotate-3"
                  whileHover={{ rotate: -3, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {getUserInitial()}
                </motion.div>
                <div>
                  <motion.h1
                    className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    variants={itemVariants}
                  >
                    Welcome back, {getUserDisplayName()}! ✨
                  </motion.h1>
                  <motion.p
                    className="text-gray-600 text-lg mt-1"
                    variants={itemVariants}
                  >
                    Ready to conquer your tasks today?
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                variants={itemVariants}
              >
                {/* Profile Info */}
                {user?.email && (
                  <motion.div
                    className="hidden md:block text-right"
                    variants={itemVariants}
                  >
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Member since {new Date().getFullYear()}
                    </p>
                  </motion.div>
                )}

                {/* Logout Button */}
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                >
                  Logout
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          className="relative z-10 max-w-7xl mx-auto px-6 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            
            <motion.div
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-2xl"
              animate={{
                rotate: -360,
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            {/* Task List Container */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <TaskList />
            </motion.div>
          </motion.div>
        </motion.main>
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;
