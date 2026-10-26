const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

module.exports = { registerSchema };
