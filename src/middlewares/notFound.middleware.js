const AppError = require("../utils/AppError");

const notFoundHandler = (req, res, next) => {
  next(new AppError("Route not found"));
};

module.exports = notFoundHandler;
