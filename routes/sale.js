const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const { createSale, getSales } = require("../controllers/sale");

router
  .route("/")
  .post(authenticateUser, createSale)
  .get(authenticateUser, getSales);

module.exports = router;
