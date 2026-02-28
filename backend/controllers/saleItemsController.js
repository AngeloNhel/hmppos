const db = require("../config/db");

// GET ALL SALE ITEMS
exports.getSaleItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        si.id,
        si.sale_id,
        p.name AS product_name,
        si.quantity,
        si.unit,
        si.subtotal,
        si.created_at
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      ORDER BY si.id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SALE ITEMS BY SALE ID
exports.getSaleItemsBySale = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sale_items WHERE sale_id = ?`,
      [req.params.saleId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};