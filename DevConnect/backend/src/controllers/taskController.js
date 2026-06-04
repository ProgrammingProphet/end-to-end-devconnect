const Task = require("../models/Task");
const Project = require("../models/Project");

// @desc    Create a new task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has access to project
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this project",
      });
    }

    // Prepare task data
    const taskData = {
      ...req.body,
      project: req.params.projectId,
      createdBy: req.user.id,
    };

    // Handle assignedTo - if empty string or "unassigned", set to null
    if (taskData.assignedTo === "" || taskData.assignedTo === "unassigned") {
      taskData.assignedTo = null;
    }

    const task = await Task.create(taskData);

    // Populate the task with user details
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email");

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Handle assignedTo - if empty string, set to null
    if (
      updateData.assignedTo === "" ||
      updateData.assignedTo === "unassigned"
    ) {
      updateData.assignedTo = null;
    }

    // If status is being set to 'done', set completedAt
    if (updateData.status === "done" && task.status !== "done") {
      updateData.completedAt = Date.now();
    }

    // Update the task
    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email");

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to comment on this task",
      });
    }

    // Validate comment text
    if (!req.body.text || req.body.text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    // Add comment
    task.comments.push({
      user: req.user.id,
      text: req.body.text.trim(),
    });

    await task.save();

    // Populate the new comment
    await task.populate("comments.user", "name email");

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has access to project
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this project",
      });
    }

    // Get tasks for the project
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
};
