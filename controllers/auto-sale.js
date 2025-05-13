const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError, NotFoundError } = require("../errors");
const { Parser } = require("json2csv");
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
const exportAutoSalesToCSV = async (req, res) => {
  const autoSales = await AutoSale.find().lean();

  if (!autoSales || autoSales.length === 0) {
    return res.status(404).json({ msg: "No auto sales found to export" });
  }

  const fields = [
    "dateOfSale",
    "customerName",
    "primaryPhone",
    "confirmationNumber",
    "address",
    "email",
    "agentName",
    "activationFee",
    "paymentMode",
    "campaignType",
    "planName",
    "bankName",
    "chequeOrCardNumber",
    "cvv",
    "expiryDate",
    "checkingAccountNumber",
    "routingNumber",
    "alternativePhone",
    "vinNumber",
    "vehicleMileage",
    "vehicleModel",
    "fronterName",
    "closerName",
  ];

  const json2csv = new Parser({ fields });
  const csv = json2csv.parse(autoSales);

  res.header("Content-Type", "text/csv");
  res.attachment("auto_warranty_sales.csv");
  res.send(csv);
};

module.exports = {
  createAutoSale,
  getAutoSales,
  updateAutoSale,
  deleteAutoSale,
  exportAutoSalesToCSV,
};
