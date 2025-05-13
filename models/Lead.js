const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
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
  extendedWarranty: {
    type: String,
    required: [true, "Extended warranty answer is required"],
    enum: ["no", "yes"],
  },
  vehicleMileage: {
    type: String,
    required: [true, "Vehicle Mileage is required"],
    trim: true,
  },
  customerAgreedForTransferToSeniorRepresentative: {
    type: String,
    required: [true, "Customer consent for call transfer is required"],
    enum: ["no", "yes"],
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
  vehicleMakeModelVariant: {
    type: String,
    required: [true, "Vehicle make & model variant is required"],
  },
  dialerName: {
    type: String,
    required: [true, "Dialer name is required"],
    enum: ["VICIdial Dialer", "Omni Dialer"],
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

module.exports = mongoose.model("Lead", LeadSchema);
