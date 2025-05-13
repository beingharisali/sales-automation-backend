const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const {
  createAutoSale,
  getAutoSales,
  updateAutoSale,
  deleteAutoSale,
  exportAutoSalesToCSV,
} = require("../controllers/auto-sale");

router
  .route("/")
  .post(authenticateUser, createAutoSale)
  .get(authenticateUser, getAutoSales);
router
  .route("/:id")
  .patch(authenticateUser, updateAutoSale)
  .delete(authenticateUser, deleteAutoSale);
router.route("/export").get(authenticateUser, exportAutoSalesToCSV);

module.exports = router;
