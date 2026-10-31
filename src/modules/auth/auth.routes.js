const express = require("express");
const { register, login, getMe, refresh } = require("./auth.controller");
const validate = require("./validate.middleware");
const { registerSchema, loginSchema } = require("./auth.validation");
const authenticate = require("../../middlewares/authenticate.middleware");
const authorize = require("../../middlewares/authorize.middleware");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.get("/me", authenticate, getMe);
router.post("/refresh", refresh);

router.get(
  "/admin-dashboard",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin dashboard accessed successfully",
      user: req.user,
    });
  },
);

router.get("/protected", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You have accessed a protected route",
    user: req.user,
  });
});

module.exports = router;
