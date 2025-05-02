const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const {
  createSale,
  getSales,
  updateSale,
  deleteSale,
} = require("../controllers/sale");

router
  .route("/")
  .post(authenticateUser, createSale)
  .get(authenticateUser, getSales);
router
  .route("/:id")
  .patch(authenticateUser, updateSale)
  .delete(authenticateUser, deleteSale);
module.exports = router;
