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
} = require("../controllers/auth");
const authenticateUser = require("../middleware/authentication");

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

module.exports = router;
