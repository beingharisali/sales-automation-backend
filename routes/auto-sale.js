const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const {
  createAutoSale,
  getAutoSales,
  updateAutoSale,
  deleteAutoSale,
} = require("../controllers/auto-sale");

router
  .route("/")
  .post(authenticateUser, createAutoSale)
  .get(authenticateUser, getAutoSales);
router
  .route("/:id")
  .patch(authenticateUser, updateAutoSale)
  .delete(authenticateUser, deleteAutoSale);

module.exports = router;
