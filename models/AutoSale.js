const mongoose = require("mongoose");

const AutoSaleSchema = new mongoose.Schema({
  campaign: {
    type: String,
    default: "Auto Warranty",
  },
  dateOfSale: {
    type: Date,
    required: [true, "Date of sale is required"],
  },
  customerName: {
    type: String,
    required: [true, "Customer name is required"],
    trim: true,
  },
  primaryPhone: {
    type: String,
    required: [true, "Primary phone number is required"],
    match: [/^\+?[\d\s-]{10,15}$/, "Invalid phone number"],
  },
  confirmationNumber: {
    type: String,
    required: [true, "Confirmation number is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
  },
  agentName: {
    type: String,
    trim: true,
  },
  activationFee: {
    type: Number,
    required: [true, "Activation fee is required"],
    min: [0, "Activation fee cannot be negative"],
  },
  paymentMode: {
    type: String,
    required: [true, "Payment mode is required"],
    enum: ["Credit Card", "Cheque Book"],
  },
  campaignType: {
    type: String,
    required: [true, "Campaign type is required"],
    enum: [
      // "ARW (American Residential Warranty)",
      // "Omega Home Care",
      // "Choice Home Warranty",
      // "AFC Warranty",
      // "Frontier TX",
      // "Guard Home Warranty",
      "ASMB Auto Care",
      "Auto 2",
      "Inline auto service",
    ],
  },
  bankName: {
    type: String,
    trim: true,
  },
  chequeOrCardNumber: {
    type: String,
    trim: true,
  },
  cvv: {
    type: String,
    trim: true,
  },
  expiryDate: {
    type: String,
    trim: true,
  },
  checkingAccountNumber: {
    type: String,
    trim: true,
  },
  routingNumber: {
    type: String,
    trim: true,
  },
  alternativePhone: {
    type: String,
    match: [/^\+?[\d\s-]{10,15}$/, "Invalid phone number"],
  },
  vinNumber: {
    type: String,
    required: [true, "VIN number is required"],
  },
  vehicleMileage: {
    type: String,
    required: [true, "Vehicle mileage is required"],
  },
  vehicleModel: {
    type: String,
    required: [true, "Vehicle model is required"],
  },
  planDuration: {
    type: String,
    required: [true, "Plan duration is required"],
  },
  fronterName: {
    type: String,
    required: [true, "Fronter name is required"],
  },
  closerName: {
    type: String,
    required: [true, "Closer name is required"],
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Agent is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AutoSale", AutoSaleSchema);
