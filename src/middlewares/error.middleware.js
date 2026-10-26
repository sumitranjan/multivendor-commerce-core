const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    statusCode = 409;
    message = `${field} already exists`;
  }

  const response = {
    success: false,
    message,
  };

  if (err.errors?.length) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
