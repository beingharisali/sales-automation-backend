const { StatusCodes } = require("http-status-codes");
const Lead = require("../models/Lead");
const { UnauthenticatedError } = require("../errors");

const createLead = async (req, res) => {
  const { user } = req;
  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (user.role !== "agent") {
    throw new UnauthenticatedError("Only agents can create lead");
  }

  // Exclude agent from req.body to prevent overwrite
  const { agent, ...leadData } = req.body;
  const leadPayload = {
    ...leadData,
    agent: user.userId,
  };

  const lead = await Lead.create(leadPayload);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Lead created successfully", lead });
};

const getLeads = async (req, res) => {
  const { user } = req;
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new Error("Only admins and superadmins can view leads");
  }

  const leads = await Lead.find({})
    .populate("agent", "name email")
    .sort("-createdAt");
  res.status(StatusCodes.OK).json({ leads, count: leads.length });
};
const updateLead = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthorizedError("Only admins and superadmins can update leads");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new NotFoundError(`No lead found with id ${id}`);
  }

  const updates = req.body;
  // Prevent updating agent or createdAt
  delete updates.agent;
  delete updates.createdAt;

  const updatedLead = await Lead.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("agent", "name email");

  res
    .status(StatusCodes.OK)
    .json({ msg: "Lead updated successfully", sale: updatedLead });
};

const deleteLead = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthorizedError("Only admins and superadmins can delete leads");
  }

  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) {
    throw new NotFoundError(`No lead found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({ msg: "Lead deleted successfully" });
};

module.exports = {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
};
