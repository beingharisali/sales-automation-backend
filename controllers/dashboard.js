// controller/dashboard.js
const { StatusCodes } = require("http-status-codes");
const Sale = require("../models/Sale");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  if (!["superadmin", "admin"].includes(req.user.role)) {
    throw new UnauthorizedError(
      "Only superadmins and admins can view dashboard stats"
    );
  }

  const now = new Date();
  const from24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const from7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const from30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [sales24Hours, sales7Days, sales30Days, totalAgents] =
    await Promise.all([
      Sale.countDocuments({ dateOfSale: { $gte: from24Hours } }),
      Sale.countDocuments({ dateOfSale: { $gte: from7Days } }),
      Sale.countDocuments({ dateOfSale: { $gte: from30Days } }),
      User.countDocuments({ role: "agent" }),
    ]);

  res.status(StatusCodes.OK).json({
    sales24Hours,
    sales7Days,
    sales30Days,
    totalAgents,
  });
};

module.exports = { getDashboardStats };
