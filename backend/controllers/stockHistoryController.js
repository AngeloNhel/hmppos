const db = require("../config/db");

// GET ALL STOCK HISTORY
exports.getStockHistory = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        sh.id,
        p.name AS product_name,
        sh.stock_change,
        sh.movement_type,
        sh.created_at
      FROM stock_history sh
      JOIN products p ON sh.product_id = p.id
      ORDER BY sh.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET STOCK HISTORY BY PRODUCT
exports.getStockHistoryByProduct = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM stock_history WHERE product_id = ? ORDER BY created_at DESC`,
      [req.params.productId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};