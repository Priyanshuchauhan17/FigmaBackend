const db = require("../config/db");

// Get all unique categories from products table
exports.getCategories = (req, res) => {
  const sql = "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Transform to array of category names
    const categories = results.map(row => row.category);
    res.json(categories);
  });
};

// Get products by category
exports.getCategoryById = (req, res) => {
  const { id } = req.params; // id is the category name
  const sql = "SELECT * FROM products WHERE category = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No products found in this category" });
    res.json(results);
  });
};
