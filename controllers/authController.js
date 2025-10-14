const db = require("../config/db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";
// ✅ Signup Controller
const signup = (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const userRole = role || "user"; // default role = user

  db.query(
    "INSERT INTO login (username, password, role) VALUES (?, ?, ?)",
    [username, password, userRole],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Signup failed" });
      }
      res.json({ success: true, message: "Signup successful" });
    }
  );
};

// ✅ Login Controller
const login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM login WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Login error" });

      if (result.length > 0) {
        const user = result[0];
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.json({
          success: true,
          message: "Login successful",
          token,
          role: user.role
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  );
};

module.exports = { signup, login };
