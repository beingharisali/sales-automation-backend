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
const updateAutoSale = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthorizedError("Only admins and superadmins can update sales");
  }

  const sale = await AutoSale.findById(id);
  if (!sale) {
    throw new NotFoundError(`No sale found with id ${id}`);
  }

  const updates = req.body;
  // Prevent updating agent or createdAt
  delete updates.agent;
  delete updates.createdAt;

  const updatedSale = await AutoSale.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("agent", "name email");

  res
    .status(StatusCodes.OK)
    .json({ msg: "Sale updated successfully", sale: updatedSale });
};

const deleteAutoSale = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthorizedError("Only admins and superadmins can delete sales");
  }

  const sale = await AutoSale.findByIdAndDelete(id);
  if (!sale) {
    throw new NotFoundError(`No sale found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({ msg: "Sale deleted successfully" });
};

module.exports = {
  createAutoSale,
  getAutoSales,
  updateAutoSale,
  deleteAutoSale,
};
