const crypto = require("crypto");

// Generate a cryptographically secure random refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

// Hash the refresh token before storing it in MongoDB
const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Calculate refresh token expiry
const getRefreshTokenExpiry = () => {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

module.exports = {
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
};
