const asyncHandler = require("../../utils/asyncHandler");
const { registerUser, loginUser, getCurrentUser } = require("./auth.service");
const { refreshAccessToken } = require("./refresh.service");

const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  const { user, accessToken, refreshToken } = result;

  const refreshTokenDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

  // Store refresh token in an HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSute: "strict",
    path: "/api/auth",
    maxAge: refreshTokenDays * 24 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login Successfull",
    data: {
      user,
      accessToken,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: user,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  console.log("rawRefreshToken:", rawRefreshToken);
  const result = await refreshAccessToken(rawRefreshToken);

  console.log("Result:", result);

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken: result.accessToken,
    },
  });
});

module.exports = { register, login, getMe, refresh };
