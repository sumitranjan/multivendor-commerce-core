const express = require("express");
const errorHandler = require("./middlewares/error.middleware");
const AppError = require("./utils/AppError");
const asyncHandler = require("./utils/asyncHandler");
const notFoundHandler = require("./middlewares/notFound.middleware");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

app.get("/api/test-error", (req, res, next) => {
  next(new AppError("This is a test error", 400));
});

app.get(
  "/api/test-async-error",
  asyncHandler(async (req, res, next) => {
    throw new Error("Something went wrong asynchronously");
  }),
);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
