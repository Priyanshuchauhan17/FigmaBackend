// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all orders
router.get("/", (req, res) => {
  const sql = "SELECT * FROM orders ORDER BY id DESC"; // latest first
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single order by ID
router.get("/:orderId", (req, res) => {
  const { orderId } = req.params;
  const sql = "SELECT * FROM orders WHERE id = ?";
  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json(result[0]);
  });
});

// Get orders by user ID
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
