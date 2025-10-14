const db = require("../config/db");
 
exports.addProduct = (req, res) => {
  const { title, price, description, category, image } = req.body;
  const sql = "INSERT INTO products (title, price, description, category, image) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [title, price, description, category, image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product added successfully!", id: result.insertId });
    });
};
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { title, price, description, category, image } = req.body;
  const sql = "UPDATE products SET title=?, price=?, description=?, category=?, image=? WHERE id=?";
  db.query(sql, [title, price, description, category, image, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product updated successfully!" });
  });
};
 
exports.getProducts = (req, res) => {
  // Parse pagination params with defaults
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 8);
  
  const offset = (page - 1) * limit;
  
  // Query for paginated products
  const dataSql = "SELECT * FROM products LIMIT ? OFFSET ?";
  // Query for total count
  const countSql = "SELECT COUNT(*) as total FROM products";
  
  db.query(countSql, (countErr, countResults) => {
    if (countErr) return res.status(500).json({ error: countErr.message });
    
    const total = countResults[0].total;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    
    db.query(dataSql, [limit, offset], (dataErr, dataResults) => {
      if (dataErr) return res.status(500).json({ error: dataErr.message });
      
      res.json({
        data: dataResults,
        total,
        page,
        limit,
        totalPages
      });
    });
  });
};
 
exports.getProductById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result[0]);
  });
};
 
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully!" });
  });
};