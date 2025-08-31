import express from 'express';
import auth from '../middleware/auth.js';
import Task from '../models/task.model.js';

const router = express.Router();

// Get all tasks for authenticated user
router.route('/').get(auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching tasks' 
    });
  }
});

// Add a new task
router.route('/add').post(auth, async (req, res) => {
  try {
    const { description, priority = 'medium', dueDate } = req.body;

    // Validation
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task description is required'
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description must be less than 500 characters'
      });
    }

    const newTask = new Task({
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      owner: req.user,
    });

    const savedTask = await newTask.save();
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: savedTask
    });
  } catch (err) {
    console.error('Add task error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating task' 
    });
  }
});

// Get a specific task by ID
router.route('/:id').get(auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const task = await Task.findOne({ _id: req.params.id, owner: req.user });
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching task' 
    });
  }
});

// Update a task (using PUT method)
router.route('/:id').put(auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const { description, completed, priority, dueDate } = req.body;

    // Validation
    if (description !== undefined && (!description || description.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Task description cannot be empty'
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description must be less than 500 characters'
      });
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating task' 
    });
  }
});

// Delete a task
router.route('/:id').delete(auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const deletedTask = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user 
    });

    if (!deletedTask) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting task' 
    });
  }
});

// Toggle task completion status
router.route('/:id/toggle').patch(auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const task = await Task.findOne({ _id: req.params.id, owner: req.user });
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    task.completed = !task.completed;
    const savedTask = await task.save();

    res.json({
      success: true,
      message: `Task marked as ${savedTask.completed ? 'completed' : 'incomplete'}`,
      task: savedTask
    });
  } catch (err) {
    console.error('Toggle task error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while toggling task' 
    });
  }
});

export default router;
