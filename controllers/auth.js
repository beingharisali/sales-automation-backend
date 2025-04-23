const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");

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
      } else if (role === "admin") {
        throw new Error("Admins can only created by superadmins");
      } else {
        req.body.role = "agent";
      }
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
    throw new UnauthenticatedError("Account is deactivated");
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
    },
    token,
  });
};

module.exports = {
  register,
  login,
};
