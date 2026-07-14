const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const { forbidden, unauthorized } = require("../utils/appError");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  // Fallback to query string — needed for endpoints opened via window.open
  // (e.g. resource /open links), where the browser can't set headers.
  const token = headerToken || req.query.token || null;

  if (!token) throw unauthorized("Not authorized, token missing");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw unauthorized("Not authorized, token invalid or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw unauthorized("Not authorized, user not found");
  if (user.status === "suspended")
    throw forbidden("Your account has been suspended");

  req.user = user;
  next();
});

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin")
    return next(forbidden("Admin access required"));
  next();
}

module.exports = { protect, requireAdmin };
