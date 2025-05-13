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
  exportSalesToCSV,
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
router.route("/export").get(authenticateUser, exportSalesToCSV);
module.exports = router;
