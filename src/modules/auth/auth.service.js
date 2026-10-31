const User = require("../../models/user.model");
const AppError = require("../../utils/AppError");

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { generateAccessToken } = require("../../utils/jwt");
const {
  hashRefreshToken,
  getRefreshTokenExpiry,
  generateRefreshToken,
} = require("../../utils/refreshToken");
const RefreshSession = require("../../models/refreshSession.model");

const BCRYPT_SALT_ROUNDS = 12;

const registerUser = async (body) => {
  const { name, email, password } = body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

const loginUser = async (body) => {
  const { email, password } = body;

  // 1. Normalize email before querying the database
  const normalizedEmail = email.trim().toLowerCase();

  // 2. Fetch user and explicitly include the password hash
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  // 3. Reject unknown email
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // 4. Verify the supplied password against the stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // 5. Check account status after verifying credentials
  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active", 403);
  }

  // 6. Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save();

  // 7.  Generate access token
  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });

  // 8. Generate raw refresh token
  const refreshToken = generateRefreshToken();

  // 9. Hash refresh token
  const tokenHash = hashRefreshToken(refreshToken);

  // 10. Generate a unique session family ID
  const familyId = crypto.randomUUID();

  // 11. Store refresh-token hash in MongoDB
  await RefreshSession.create({
    user: user._id,
    tokenHash,
    familyId,
    expiresAt: getRefreshTokenExpiry(),
  });

  // 12. Remove password before returning user
  const userObject = user.toObject();
  delete userObject.password;

  // 9. Return profile and token separately
  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  console.log("user:", user);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active", 403);
  }

  return user;
};

module.exports = { registerUser, loginUser, getCurrentUser };
