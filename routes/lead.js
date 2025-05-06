const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} = require("../controllers/lead");

router
  .route("/")
  .post(authenticateUser, createLead)
  .get(authenticateUser, getLeads);
router
  .route("/:id")
  .patch(authenticateUser, updateLead)
  .delete(authenticateUser, deleteLead);

module.exports = router;
