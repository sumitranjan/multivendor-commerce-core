const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const User = require("../models/user.model");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  let decoded;

  // Catch only JWT verification errors.
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: process.env.ISSUER,
      audience: process.env.API_AUDIENCE,
      algorithms: ["HS256"],
    });
  } catch (error) {
    return next(new AppError("Invalid or expired access token", 401));
  }

  // Database and application errors are handled separately.
  try {
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    if (user.status !== "ACTIVE") {
      return next(new AppError("Your account is not active", 403));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
