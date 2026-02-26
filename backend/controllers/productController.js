const db = require("../config/db");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    console.log("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  const { name, price, stock } = req.body;

  try {
    await db.query(
      "INSERT INTO products (name, price, stock, created_at) VALUES (?, ?, ?, NOW())",
      [name, price, stock]
    );

    res.json({ message: "Product created" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  const { name, price, stock } = req.body;

  try {
    await db.query(
      "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
      [name, price, stock, req.params.id]
    );

    res.json({ message: "Product updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESTOCK PRODUCT
exports.restockProduct = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  try {
    await db.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [quantity, req.params.id]
    );

    await db.query(
      "INSERT INTO stock_history (product_id, stock_change, movement_type, created_at) VALUES (?, ?, ?, NOW())",
      [req.params.id, quantity, "RESTOCK"]
    );

    res.json({ message: "Product restocked successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};