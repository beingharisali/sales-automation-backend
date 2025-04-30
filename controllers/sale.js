const { StatusCodes } = require("http-status-codes");
const Sale = require("../models/Sale");
const { UnauthenticatedError } = require("../errors");
// const CustomError = require("../errors");

const createSale = async (req, res) => {
  const { user } = req;
  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (user.role !== "agent") {
    throw new CustomError.UnauthorizedError("Only agents can create sales");
  }

  // Exclude agent from req.body to prevent overwrite
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
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new Error("Only admins and superadmins can view sales");
  }

  const sales = await Sale.find({})
    .populate("agent", "name email")
    .sort("-createdAt");
  res.status(StatusCodes.OK).json({ sales, count: sales.length });
};

module.exports = {
  createSale,
  getSales,
};
