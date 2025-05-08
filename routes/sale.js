const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const {
  createSale,
  getSales,
  updateSale,
  deleteSale,
  getSalesByAgent,
  getAgentSalesCounts,
} = require("../controllers/sale");

router
  .route("/")
  .post(authenticateUser, createSale)
  .get(authenticateUser, getSales);
router
  .route("/:id")
  .patch(authenticateUser, updateSale)
  .delete(authenticateUser, deleteSale);
router
  .route("/dashboard/agent-sales-counts")
  .get(authenticateUser, getAgentSalesCounts);
// router.get("/", getSalesByAgent);
module.exports = router;
