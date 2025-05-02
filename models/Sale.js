const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  campaign: {
    type: String,
    required: [true, "Campaign is required"],
    enum: ["Home Warranty", "Auto Warrenty"],
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
  campaignType: {
    type: String,
    required: [true, "Campaign type is required"],
    enum: [
      "ARW (American Residential Warranty)",
      "Omega Home Care",
      "Choice Home Warranty",
      "AFC Warranty",
      "Frontier TX",
      "Guard Home Warranty",
    ],
  },
  confirmationNumber: {
    type: String,
    required: [true, "Confirmation number is required"],
    trim: true,
  },
  planName: {
    type: String,
    required: [true, "Plan name is required"],
    enum: [
      "Platinum Plan",
      "Kitchen Plus Plan",
      "Platinum Premier Plan",
      "Deluxe Home Protection (Omega)",
      "Choice Basic Plan",
      "AFC Silver Plan",
    ],
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
  merchantName: {
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
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Agent is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  campaignDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    validate: {
      validator: function (v) {
        if (this.campaign === "Auto Warranty") {
          return (
            v.vinNumber &&
            typeof v.vinNumber === "string" &&
            v.vehicleMileage &&
            typeof v.vehicleMileage === "string" &&
            v.vehicleModel &&
            typeof v.vehicleModel === "string" &&
            v.planDuration &&
            typeof v.planDuration === "string" &&
            v.fronterName &&
            typeof v.fronterName === "string" &&
            v.closerName &&
            typeof v.closerName === "string"
          );
        }
        return true;
      },
      message: "Invalid campaign details for Auto Warranty",
    },
  },
});

module.exports = mongoose.model("Sale", SaleSchema);
