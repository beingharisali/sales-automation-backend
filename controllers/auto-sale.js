const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError } = require("../errors");
const AutoSale = require("../models/AutoSale");

const createAutoSale = async (req, res) => {
  const { user } = req;
  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (user.role !== "agent") {
    throw new UnauthenticatedError("Only agents can create auto sale");
  }

  const { agent, ...saleData } = req.body;
  const salePayload = {
    ...saleData,
    agent: user.userId,
  };

  const sale = await AutoSale.create(salePayload);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Sale created successfully", sale });
};

const getAutoSales = async (req, res) => {
  const { user } = req;
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new Error("Only admins and superadmins can view sales");
  }

  const sales = await AutoSale.find({})
    .populate("agent", "name email")
    .sort("-createdAt");
  res.status(StatusCodes.OK).json({ sales, count: sales.length });
};

module.exports = {
  createAutoSale,
  getAutoSales,
};
