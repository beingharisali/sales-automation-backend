const express = require("express");
const router = express.Router();
const { register, login, getAdmins } = require("../controllers/auth");
const authenticateUser = require("../middleware/authentication");

// public routes
router.post("/public-register", register);
router.post("/login", login);
// private routes
router.post("/register", authenticateUser, register);
router.get("/admins", authenticateUser, getAdmins);

module.exports = router;
