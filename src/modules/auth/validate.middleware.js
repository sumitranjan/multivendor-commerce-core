const AppError = require("../../utils/AppError");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    // console.log("validation result : ", result);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new AppError("Validation failed", 400, errors));
    }

    // Replace req.body with the validated/transformed data
    req.body = result.data;

    next();
  };
};

module.exports = validate;
