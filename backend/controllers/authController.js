const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Wrap db.query with promise
const query = (sql, values) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

// CREATE USER / REGISTER
exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // check if user exists
    const existingUser = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    await query(
      "INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())",
      [username, hashedPassword, role]
    );

    res.json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  try {
    const result = await query("SELECT * FROM users WHERE username = ?", [username]);

    if (result.length === 0) return res.status(400).json({ message: "User not found" });

    const user = result[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secret", {
      expiresIn: "1d",
    });

    res.json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
};