const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getTasks).post(protect, createTask);

router.route("/:id").put(protect, updateTask).delete(protect, deleteTask);

router.route("/:id/comments").post(protect, addComment);

module.exports = router;
