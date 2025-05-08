const { StatusCodes } = require("http-status-codes");
const Sale = require("../models/Sale");
const AutoSale = require("../models/AutoSale");
const { UnauthenticatedError, NotFoundError } = require("../errors");
const mongoose = require("mongoose");

const createSale = async (req, res) => {
  const { user } = req;
  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (user.role !== "agent") {
    throw new CustomError.UnauthorizedError("Only agents can create sales");
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

// const getSales = async (req, res) => {
//   const { user } = req;
//   if (!["admin", "superadmin"].includes(user.role)) {
//     throw new Error("Only admins and superadmins can view sales");
//   }

//   const sales = await Sale.find({})
//     .populate("agent", "name email")
//     .sort("-createdAt");
//   res.status(StatusCodes.OK).json({ sales, count: sales.length });
// };
const getSales = async (req, res) => {
  const { user } = req;
  const { agent, filter } = req.query;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthorizedError(
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

  const validFilters = ["today", "week", "month", "90days", "all"];
  if (filter && !validFilters.includes(filter)) {
    throw new BadRequestError("Invalid filter type");
  }

  if (filter && filter !== "all") {
    const now = new Date();
    if (filter === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      query.dateOfSale = { $gte: startOfDay };
    } else if (filter === "week") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      query.dateOfSale = { $gte: startOfWeek };
    } else if (filter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.dateOfSale = { $gte: startOfMonth };
    } else if (filter === "90days") {
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
      query.dateOfSale = { $gte: ninetyDaysAgo };
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
    throw new UnauthorizedError("Only admins and superadmins can update sales");
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
    throw new UnauthorizedError("Only admins and superadmins can delete sales");
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
    throw new UnauthorizedError("Only agents can view their sales counts");
  }
  console.log("User Details:", { userId: user.userId, role: user.role });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30);

  console.log("Agent Sales Counts Query Dates:", {
    today: today.toISOString(),
    lastWeek: lastWeek.toISOString(),
    lastMonth: lastMonth.toISOString(),
    agent: user.userId,
  });

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

  console.log("Home Sales Counts:", homeSales);
  console.log("Auto Sales Counts:", autoSales);

  const salesCounts = {
    todaySales:
      (homeSales[0]?.todaySales || 0) + (autoSales[0]?.todaySales || 0),
    lastWeekSales:
      (homeSales[0]?.lastWeekSales || 0) + (autoSales[0]?.lastWeekSales || 0),
    lastMonthSales:
      (homeSales[0]?.lastMonthSales || 0) + (autoSales[0]?.lastMonthSales || 0),
  };

  console.log("Final Agent Sales Counts:", salesCounts);
  res.status(StatusCodes.OK).json(salesCounts);
};

module.exports = {
  createSale,
  getSales,
  updateSale,
  deleteSale,
  getAgentSalesCounts,
};
