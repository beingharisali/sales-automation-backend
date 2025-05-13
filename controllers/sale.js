const { StatusCodes } = require("http-status-codes");
const {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} = require("../errors");
const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const AutoSale = require("../models/AutoSale");

const createSale = async (req, res) => {
  const { user } = req;
  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (user.role !== "agent") {
    throw new UnauthenticatedError("Only agents can create sales");
  }

  const { agent, ...saleData } = req.body;
  const salePayload = {
    ...saleData,
    agent: user.userId,
  };

  const sale = await Sale.create(salePayload);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Sale created successfully", sale });
};

const getSales = async (req, res) => {
  const { user } = req;
  const { agent, filter } = req.query;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthenticatedError(
      "Only admins and superadmins can view sales data"
    );
  }

  const query = {};

  if (agent) {
    if (!mongoose.Types.ObjectId.isValid(agent)) {
      throw new BadRequestError("Invalid Agent ID");
    }
    query.agent = new mongoose.Types.ObjectId(agent);
  }

  const validFilters = ["24hours", "7days", "30days", "90days", "all"];
  if (filter && !validFilters.includes(filter)) {
    throw new BadRequestError("Invalid filter type");
  }

  // Date Filtering Logic
  if (filter && filter !== "all") {
    const now = new Date();
    let fromDate;

    switch (filter) {
      case "24hours":
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24 hours
        break;
      case "7days":
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    if (fromDate) {
      query.dateOfSale = { $gte: fromDate };
    }
  }

  const sales = await Sale.find(query)
    .populate("agent", "name")
    .select(
      "customerName primaryPhone campaignType confirmationNumber planName address email activationFee paymentMode bankName chequeOrCardNumber cvv expiryDate merchantName checkingAccountNumber routingNumber alternativePhone dateOfSale"
    );

  res.status(StatusCodes.OK).json({ sales, count: sales.length });
};

const updateSale = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthenticatedError(
      "Only admins and superadmins can update sales"
    );
  }

  const sale = await Sale.findById(id);
  if (!sale) {
    throw new NotFoundError(`No sale found with id ${id}`);
  }

  const updates = req.body;
  // Prevent updating agent or createdAt
  delete updates.agent;
  delete updates.createdAt;

  const updatedSale = await Sale.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("agent", "name email");

  res
    .status(StatusCodes.OK)
    .json({ msg: "Sale updated successfully", sale: updatedSale });
};

const deleteSale = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthenticatedError(
      "Only admins and superadmins can delete sales"
    );
  }

  const sale = await Sale.findByIdAndDelete(id);
  if (!sale) {
    throw new NotFoundError(`No sale found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({ msg: "Sale deleted successfully" });
};
const getAgentSalesCounts = async (req, res) => {
  const { user } = req;
  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (user.role !== "agent") {
    throw new UnauthenticatedError("Only agents can view their sales counts");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30);

  const [homeSales, autoSales] = await Promise.all([
    Sale.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(user.userId),
          dateOfSale: { $gte: lastMonth },
        },
      },
      {
        $group: {
          _id: null,
          todaySales: {
            $sum: {
              $cond: [{ $gte: ["$dateOfSale", today] }, 1, 0],
            },
          },
          lastWeekSales: {
            $sum: {
              $cond: [{ $gte: ["$dateOfSale", lastWeek] }, 1, 0],
            },
          },
          lastMonthSales: {
            $sum: 1,
          },
        },
      },
    ]),
    AutoSale.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(user.userId),
          dateOfSale: { $gte: lastMonth },
        },
      },
      {
        $group: {
          _id: null,
          todaySales: {
            $sum: {
              $cond: [{ $gte: ["$dateOfSale", today] }, 1, 0],
            },
          },
          lastWeekSales: {
            $sum: {
              $cond: [{ $gte: ["$dateOfSale", lastWeek] }, 1, 0],
            },
          },
          lastMonthSales: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const salesCounts = {
    todaySales:
      (homeSales[0]?.todaySales || 0) + (autoSales[0]?.todaySales || 0),
    lastWeekSales:
      (homeSales[0]?.lastWeekSales || 0) + (autoSales[0]?.lastWeekSales || 0),
    lastMonthSales:
      (homeSales[0]?.lastMonthSales || 0) + (autoSales[0]?.lastMonthSales || 0),
  };

  res.status(StatusCodes.OK).json(salesCounts);
};

module.exports = {
  createSale,
  getSales,
  updateSale,
  deleteSale,
  getAgentSalesCounts,
};
