const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), name: user.name, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m", issuer: process.env.ISSUER, audience: API_AUDIENCE },
  );
};

module.exports = { generateAccessToken };
