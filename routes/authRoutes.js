const express = require("express");
const { signup, login } = require("../controllers/authController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected Routes
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Welcome User", user: req.user });
});

router.post("/admin/add-product", authMiddleware, adminOnly, (req, res) => {
  res.json({ message: "✅ Product added by Admin" });
});
module.exports = router;
