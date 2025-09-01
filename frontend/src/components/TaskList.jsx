import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import API_BASE_URL from '../config/api';
import { 
  PlusIcon, 
  CheckIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  TrashIcon,
  FunnelIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token) {
          navigate('/login');
          return;
        }

        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }

        const res = await axios.get(`${API_BASE_URL}/api/tasks`, {
          headers: { 'x-auth-token': token },
        });

        const tasksData = res.data.tasks || res.data;
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        
        if (res.data.success === false) {
          toast.error(res.data.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Fetch tasks error:', err);
        if (err.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          logout();
        } else {
          toast.error(err.response?.data?.message || 'Failed to fetch tasks');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const addTask = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    if (description.length > 500) {
      toast.error('Task description must be less than 500 characters');
      return;
    }

    setAdding(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '${API_BASE_URL}/api/tasks/add',
        { description: description.trim() },
        { headers: { 'x-auth-token': token } }
      );

      const newTask = res.data.task || res.data;
      setTasks([newTask, ...tasks]);
      setDescription('');
      toast.success(res.data.message || 'Task added successfully!');
    } catch (err) {
      console.error('Add task error:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        toast.error(err.response?.data?.message || 'Failed to add task');
      }
    } finally {
      setAdding(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: { 'x-auth-token': token },
      });

      setTasks(tasks.filter((task) => task._id !== id));
      toast.success(res.data.message || 'Task deleted successfully!');
    } catch (err) {
      console.error('Delete task error:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const toggleComplete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${API_BASE_URL}/api/tasks/${id}/toggle`,
        {},
        { headers: { 'x-auth-token': token } }
      );

      const updatedTask = res.data.task || res.data;
      setTasks(
        tasks.map((task) =>
          task._id === id ? { ...task, completed: updatedTask.completed } : task
        )
      );
      toast.success(res.data.message || 'Task status updated!');
    } catch (err) {
      console.error('Toggle task error:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        toast.error(err.response?.data?.message || 'Failed to update task status');
      }
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setNewDescription(task.description);
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setNewDescription('');
  };

  const saveTask = async (id) => {
    if (!newDescription.trim()) {
      toast.error('Task description cannot be empty');
      return;
    }

    if (newDescription.length > 500) {
      toast.error('Task description must be less than 500 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE_URL}/api/tasks/${id}`,
        { description: newDescription.trim() },
        { headers: { 'x-auth-token': token } }
      );

      const updatedTask = res.data.task || res.data;
      setTasks(
        tasks.map((task) =>
          task._id === id ? { ...task, description: updatedTask.description } : task
        )
      );
      setEditingTask(null);
      setNewDescription('');
      toast.success(res.data.message || 'Task updated successfully!');
    } catch (err) {
      console.error('Update task error:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        toast.error(err.response?.data?.message || 'Failed to update task');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Enhanced filtering and sorting
  const filteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'completed' && task.completed) || 
        (filter === 'pending' && !task.completed);
      
      const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'alphabetical':
          return a.description.localeCompare(b.description);
        case 'completed':
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        default: // newest
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return filtered;
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "backOut" }
    }
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div
            className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xl text-gray-600">Loading your tasks...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Enhanced Header */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <SparklesIcon className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Task Manager
                </h1>
                {user && (
                  <p className="text-gray-600 text-lg">Welcome back, {user.username}! 🚀</p>
                )}
              </div>
            </div>
            
            
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'from-blue-500 to-cyan-500', icon: ChartBarIcon },
            { label: 'Completed', value: completedCount, color: 'from-green-500 to-emerald-500', icon: CheckIcon },
            { label: 'Pending', value: pendingCount, color: 'from-yellow-500 to-orange-500', icon: XMarkIcon }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
              variants={statsVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Add Task Form */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-6">
            <PlusIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Add New Task</h2>
          </div>
          
          <form onSubmit={addTask} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <motion.input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What needs to be accomplished? ✨"
                required
                disabled={adding}
                maxLength={500}
                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all duration-300"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                disabled={adding || !description.trim()}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {adding ? (
                  <motion.span
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Adding...
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Add Task
                  </span>
                )}
              </motion.button>
            </div>
            <p className="text-sm text-gray-500">{description.length}/500 characters</p>
          </form>
        </motion.div>

        {/* Enhanced Filters and Search */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: `All (${tasks.length})`, color: 'indigo' },
                { key: 'pending', label: `Pending (${pendingCount})`, color: 'yellow' },
                { key: 'completed', label: `Completed (${completedCount})`, color: 'green' }
              ].map(({ key, label, color }) => (
                <motion.button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    filter === key
                      ? `bg-${color}-500 text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A-Z</option>
              <option value="completed">Completed First</option>
            </select>
          </div>
        </motion.div>

        {/* Enhanced Tasks List */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-6">
            <FunnelIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Your Tasks {filter !== 'all' && `(${filter})`}
            </h2>
          </div>

          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {filteredAndSortedTasks().length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    {tasks.length === 0
                      ? "Ready to get productive? Add your first task above! 🎯"
                      : `No ${filter} tasks found.`}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedTasks().map((task, index) => (
                    <motion.div
                      key={task._id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      {editingTask && editingTask._id === task._id ? (
                        // Edit Mode
                        <div className="flex flex-col lg:flex-row gap-4">
                          <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            maxLength={500}
                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => saveTask(task._id)}
                              disabled={!newDescription.trim()}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <CheckIcon className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              onClick={cancelEditing}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <motion.input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleComplete(task._id)}
                              className="w-6 h-6 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500 cursor-pointer"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            />
                            <span
                              className={`text-lg break-words ${
                                task.completed
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-800'
                              }`}
                            >
                              {task.description}
                            </span>
                            {task.completed && (
                              <motion.span
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                ✅ Done
                              </motion.span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => startEditing(task)}
                              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => deleteTask(task._id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TaskList;
