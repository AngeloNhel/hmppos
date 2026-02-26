const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ========================
// CREATE USER (ADMIN)
// ========================
exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())",
      [username, hashedPassword, role]
    );

    res.json({ message: "User created successfully" });

  } catch (err) {
    console.log("CREATE USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// LOGIN
// ========================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secret",
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// GET USERS
// ========================
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, username, role, created_at FROM users ORDER BY id DESC"
    );

    res.json(users);

  } catch (err) {
    console.log("GET USERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// UPDATE USER
// ========================
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, role, password } = req.body;

  if (!username || !role) {
    return res.status(400).json({ message: "Username and role required" });
  }

  try {
    let sql = "UPDATE users SET username = ?, role = ?";
    let values = [username, role];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ", password = ?";
      values.push(hashedPassword);
    }

    sql += " WHERE id = ?";
    values.push(id);

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });

  } catch (err) {
    console.log("UPDATE USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// DELETE USER
// ========================
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.log("DELETE USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};