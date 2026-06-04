const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

// Re-route into task router
const taskRouter = require("./tasks");
router.use("/:projectId/tasks", taskRouter);

router.route("/").get(protect, getProjects).post(protect, createProject);

router
  .route("/:id")
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route("/:id/members").post(protect, addMember);

module.exports = router;
