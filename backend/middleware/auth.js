// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  // Log the raw incoming header
  console.log("[Auth] 🔍 Authorization header:", req.headers.authorization);

  let token;

  // 1) Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Split out the token
    token = req.headers.authorization.split(" ")[1];
    console.log("[Auth] 🗝  Parsed token:", token);

    try {
      // 2) Verify the token against your secret
      console.log("[Auth] 🔑 Verifying JWT with secret:", process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3) Lookup the user and attach to req
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.warn("[Auth] 🚫 User not found for ID:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }
      if (!user.isActive) {
        console.warn("[Auth] 🚫 User account deactivated:", user.email);
        return res.status(401).json({ message: "User account is deactivated" });
      }

      // Success: attach user and proceed
      req.user = user;
      console.log("[Auth] ✅ Authentication successful for:", user.email);
      return next();
    } catch (error) {
      console.error("[Auth] ❌ Token verification error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 4) No token provided
  console.warn("[Auth] 🚫 No Bearer token provided");
  return res.status(401).json({ message: "Not authorized, no token" });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn("[Auth] 🚫 authorize() called without a req.user");
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      console.warn(
        "[Auth] 🚫 User role not permitted:",
        req.user.role,
        "allowed roles:",
        roles
      );
      return res
        .status(403)
        .json({ message: `User role ${req.user.role} is not allowed` });
    }
    next();
  };
};

module.exports = { protect, authorize };
