const express = require("express");
const router = express.Router();
const db = require("../config/db"); // your MySQL connection

// ✅ Get all users
router.get("/", (req, res) => {
  const sql = "SELECT id, username, role,password FROM login"; // hide password for security
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
