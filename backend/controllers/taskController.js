import Task from "../models/Task.js";

// CREATE
export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await Task.create({ title, description, user: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: "Task creation failed", error: err.message });
  }
};

// READ - all user tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
};

// READ - by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: "Invalid Task ID" });
  }
};

// UPDATE
export const updateTask = async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// DELETE
export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed", error: err.message });
  }
};
// backend/controllers/taskController.js