// controller/dashboard.js
const { StatusCodes } = require("http-status-codes");
const Sale = require("../models/Sale");
const AutoSale = require("../models/AutoSale");
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
const getDashboardAutoSalesStats = async (req, res) => {
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
      AutoSale.countDocuments({ dateOfSale: { $gte: from24Hours } }),
      AutoSale.countDocuments({ dateOfSale: { $gte: from7Days } }),
      AutoSale.countDocuments({ dateOfSale: { $gte: from30Days } }),
      User.countDocuments({ role: "agent" }),
    ]);

  res.status(StatusCodes.OK).json({
    sales24Hours,
    sales7Days,
    sales30Days,
    totalAgents,
  });
};

const graphDataStats = async (req, res) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const salesByDate = await Sale.aggregate([
    // {
    //   $match: {
    //     createdAt: { $gte: startDate },
    //   },
    // },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        total: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(StatusCodes.OK).json({ salesByDate });
};

const recentSales = async (req, res) => {
  const recentSales = await Sale.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("agent", "name email campaignType")
    .lean();

  const formatted = recentSales.map((sale) => ({
    id: sale._id,
    name: sale.agent?.name || "Unknown",
    email: sale.agent?.email || "N/A",
    campaignType: sale.campaignType || 0,
  }));

  res.status(StatusCodes.OK).json(formatted);
};

module.exports = {
  getDashboardStats,
  getDashboardAutoSalesStats,
  graphDataStats,
  recentSales,
};
