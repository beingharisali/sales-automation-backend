const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAdmins,
  getAgents,
  forgotPassword,
  resetPassword,
  toggleAgentActive,
  getAgentById,
} = require("../controllers/auth");
const authenticateUser = require("../middleware/authentication");
const {
  getDashboardStats,
  graphDataStats,
} = require("../controllers/dashboard");

// public routes
router.post("/public-register", register);
router.post("/login", login);
// private routes
router.post("/register", authenticateUser, register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/admins", authenticateUser, getAdmins);
router.get("/agents", authenticateUser, getAgents);
router.patch("/agents/:id/toggle-active", authenticateUser, toggleAgentActive);
router.get("/agents/:id", authenticateUser, getAgentById);
router.get("/dashboard-stats", authenticateUser, getDashboardStats);
router.get("/graph-stats", authenticateUser, graphDataStats);

module.exports = router;
