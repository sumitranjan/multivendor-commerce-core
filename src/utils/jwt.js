const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  return jwt.sign(
    { sub: payload.sub, role: payload.role },
    process.env.JWT_ACCESS_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
      issuer: process.env.ISSUER,
      audience: process.env.API_AUDIENCE,
    },
  );
};

module.exports = { generateAccessToken };
