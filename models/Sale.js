const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  campaign: {
    type: String,
    default: "Home Warranty",
    enum: ["Home Warranty"],
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
    enum: ["Basic", "Premium", "Elite"],
  },
  confirmationNumber: {
    type: String,
    required: [true, "Confirmation number is required"],
    trim: true,
  },
  planNumber: {
    type: String,
    required: [true, "Plan number is required"],
    enum: ["Plan A", "Plan B", "Plan C"],
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
  chequeNumber: {
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
  autoWarrantyTransfer: {
    type: String,
    required: [true, "Auto warranty transfer status is required"],
    enum: ["Yes", "No"],
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
});

module.exports = mongoose.model("Sale", SaleSchema);
