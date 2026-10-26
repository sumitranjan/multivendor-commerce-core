const User = require("../../models/user.model");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcrypt");

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
  console.log(typeof userObject);

  delete userObject.password;

  return userObject;
};

module.exports = { registerUser };
