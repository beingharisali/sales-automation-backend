const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError("Please provide name, email and password");
  }

  const validRoles = ["superadmin", "admin", "agent"];
  if (role && !validRoles.includes(role)) {
    throw new BadRequestError("Invalid role provided");
  }

  const requestingUser = req.user;
  let createdBy = null;

  if (requestingUser) {
    if (requestingUser.role === "superadmin") {
      createdBy = requestingUser.userId;
    } else if (requestingUser.role === "admin" && role === "agent") {
      createdBy = requestingUser.userId;
    } else {
      throw new Error("Not authorized to create this role");
    }
  } else {
    if (role === "superadmin") {
      const superAdminExists = await User.findOne({ role: "superadmin" });
      if (superAdminExists) {
        throw new Error("Superadmin already exists");
      }
    } else if (role === "admin") {
      throw new Error("Admins can only created by superadmins");
    } else {
      req.body.role = "agent";
    }
  }

  if (createdBy) {
    req.body.createdBy = createdBy;
  }

  const user = await User.create({ ...req.body });

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    user: { name: user.name, email: user.email, role: user.role },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  if (!user.isActive) {
    throw new UnauthenticatedError(
      "Account is deactivated. Please contact an admin."
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  });
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(StatusCodes.OK)
      .json({ msg: "If the email exists, a reset link has been sent" });
  }

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_APP_URL}/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h3>Password Reset</h3>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res
      .status(StatusCodes.OK)
      .json({ msg: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send reset email");
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    throw new BadRequestError("Please provide token and password");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new BadRequestError("Invalid or expired token");
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Invalid or expired token");
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password reset successful" });
};
const getAdmins = async (req, res) => {
  if (req.user.role !== "superadmin") {
    throw new Error("Only superadmins can view admins");
  }

  const admins = await User.find({ role: "admin" }).select(
    "name email role createdAt"
  );

  res.status(StatusCodes.OK).json({ admins, count: admins.length });
};
const getAgents = async (req, res) => {
  if (!["superadmin", "admin"].includes(req.user.role)) {
    throw new Error("Only superadmins and admins can view agents");
  }

  const agents = await User.find({ role: "agent" }).select(
    "name email role createdAt isActive"
  );

  res.status(StatusCodes.OK).json({ agents, count: agents.length });
};
const getAgentById = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthorizedError(
      "Only admins and superadmins can view agent details"
    );
  }

  const agent = await User.findById(id).select(
    "name email role isActive createdAt"
  );
  if (!agent) {
    throw new NotFoundError(`No agent found with id ${id}`);
  }
  if (agent.role !== "agent") {
    throw new BadRequestError("Can only view details for agents");
  }

  res.status(StatusCodes.OK).json({ agent });
};
const toggleAgentActive = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!user || !user.userId) {
    throw new UnauthenticatedError("User not authenticated");
  }
  if (!["admin", "superadmin"].includes(user.role)) {
    throw new UnauthorizedError(
      "Only admins and superadmins can toggle agent status"
    );
  }

  const agent = await User.findById(id);
  if (!agent) {
    throw new NotFoundError(`No agent found with id ${id}`);
  }
  if (agent.role !== "agent") {
    throw new BadRequestError("Can only toggle status for agents");
  }

  agent.isActive = !agent.isActive;
  await agent.save();

  res.status(StatusCodes.OK).json({
    msg: `Agent ${agent.isActive ? "activated" : "deactivated"} successfully`,
    agent: {
      name: agent.name,
      email: agent.email,
      role: agent.role,
      isActive: agent.isActive,
    },
  });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAdmins,
  getAgents,
  toggleAgentActive,
  getAgentById,
};
