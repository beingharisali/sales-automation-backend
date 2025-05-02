const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const { createLead, getLeads } = require("../controllers/lead");

router
  .route("/")
  .post(authenticateUser, createLead)
  .get(authenticateUser, getLeads);

module.exports = router;
