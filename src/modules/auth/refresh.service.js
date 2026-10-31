const AppError = require("../../utils/AppError");
const { hashRefreshToken } = require("../../utils/refreshToken");

const RefreshSession = require("../../models/refreshSession.model");
const User = require("../../models/user.model");
const { generateAccessToken } = require("../../utils/jwt");

const refreshAccessToken = async (rawRefreshToken) => {
  // 1. Check whether refresh token exists
  if (!rawRefreshToken) {
    throw new AppError("Refresh token required", 401);
  }

  // 2. Hash incoming refresh token
  const tokenHash = hashRefreshToken(rawRefreshToken);
  console.log("tokenHash : ", tokenHash);

  // 3. Find matching refresh session
  const session = await RefreshSession.findOne({ tokenHash });
  console.log("session : ", session);

  if (!session) {
    throw new AppError("Invalid refresh token", 401);
  }

  // 4. Check whether session has already been revoked
  if (session.revokedAt) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  // 5. Check expiry
  if (session.expiresAt <= new Date()) {
    throw new AppError("Refresh token has expired", 401);
  }

  // 6. Find the user
  const user = await User.findById(session.user);
  console.log("user : ", user);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  // 7. Check account status
  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active", 403);
  }

  // 8. Generate a new access token
  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });

  console.log("accessToken: ", accessToken);

  return {
    accessToken,
  };
};

module.exports = {
  refreshAccessToken,
};
