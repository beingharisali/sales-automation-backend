const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError } = require("../errors");
const Sale = require("../models/Sale");

const createSale = async (req, res) => {
  const { user } = req;
  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (user.role !== "agent") {
    throw new CustomError.UnauthorizedError("Only agents can create sales");
  }

  const { agent, campaign, campaignDetails, ...saleData } = req.body;
  if (campaign === "Auto Warranty") {
    if (
      !campaignDetails ||
      !campaignDetails.vinNumber ||
      !campaignDetails.vehicleMileage ||
      !campaignDetails.vehicleModel ||
      !campaignDetails.planDuration ||
      !campaignDetails.fronterName ||
      !campaignDetails.closerName
    ) {
      throw new BadRequestError(
        "VIN, Make, Model, duration, fronter and closer name are required for Auto Warranty"
      );
    }
  }
  const salePayload = {
    ...saleData,
    campaign,
    campaignDetails: campaign === "Auto Warranty" ? campaignDetails : {},
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
    throw new UnauthenticatedError(
      "Only admins and superadmins can view sales"
    );
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
