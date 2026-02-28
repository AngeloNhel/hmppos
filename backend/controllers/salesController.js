const db = require("../config/db");

exports.createSale = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    await connection.beginTransaction();

    const [saleResult] = await connection.query(
      "INSERT INTO sales (user_id, total_amount, created_at) VALUES (?, ?, NOW())",
      [req.user.id, total]
    );

    const saleId = saleResult.insertId;

    for (let item of items) {
      const [productRows] = await connection.query(
        "SELECT stock FROM products WHERE id = ?",
        [item.id]
      );

      if (productRows.length === 0) {
        throw new Error("Product not found");
      }

      if (productRows[0].stock < item.quantity) {
        throw new Error("Insufficient stock");
      }

      await connection.query(
        "INSERT INTO sale_items (sale_id, product_id, quantity, unit, subtotal) VALUES (?, ?, ?, ?, ?)",
        [saleId, item.id, item.quantity, item.unit || "pcs", item.subtotal]
      );

      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.id]
      );

      await connection.query(
        "INSERT INTO stock_history (product_id, stock_change, movement_type, created_at) VALUES (?, ?, ?, NOW())",
        [item.id, -item.quantity, "SALE"]
      );
    }

    await connection.commit();
    res.json({ message: "Sale completed successfully" });

  } catch (err) {
    await connection.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    connection.release();
  }
};

exports.getReport = async (req, res) => {
  const { start, end } = req.query;

  let sql = `
    SELECT 
      s.id AS trans_no,
      p.code,
      p.description,
      si.unit,
      si.quantity,
      p.price,
      si.subtotal AS total,
      TIME(s.created_at) AS time
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN products p ON si.product_id = p.id
  `;

  const values = [];

  if (start && end) {
    sql += " WHERE DATE(s.created_at) BETWEEN ? AND ?";
    values.push(start, end);
  }

  sql += " ORDER BY s.created_at DESC";

  try {
    const [report] = await db.query(sql, values);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Report error" });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [today] = await db.query(`
      SELECT IFNULL(SUM(total_amount),0) total
      FROM sales
      WHERE DATE(created_at) = CURDATE()
    `);

    const [week] = await db.query(`
      SELECT IFNULL(SUM(total_amount),0) total
      FROM sales
      WHERE YEARWEEK(created_at,1) = YEARWEEK(CURDATE(),1)
    `);

    const [items] = await db.query(`
      SELECT IFNULL(SUM(quantity),0) total
      FROM sale_items
    `);

    res.json({
      today: today[0].total,
      week: week[0].total,
      items: items[0].total,
    });

  } catch (err) {
    res.status(500).json({ message: "Summary error" });
  }
};

// GET SALES REPORT PER USER
exports.getSalesByUser = async (req, res) => {
  const { userId } = req.params;
  const { start, end } = req.query;

  let sql = `
    SELECT 
      s.id AS sale_id,
      s.total_amount,
      s.created_at,
      p.name AS product_name,
      si.quantity,
      si.unit,
      si.subtotal
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN products p ON si.product_id = p.id
    WHERE s.user_id = ?
  `;

  const values = [userId];

  if (start && end) {
    sql += " AND DATE(s.created_at) BETWEEN ? AND ?";
    values.push(start, end);
  }

  sql += " ORDER BY s.created_at DESC";

  try {
    const [rows] = await db.query(sql, values);

    // SUMMARY
    const [today] = await db.query(`
      SELECT IFNULL(SUM(total_amount),0) total
      FROM sales
      WHERE user_id = ?
      AND DATE(created_at) = CURDATE()
    `, [userId]);

    const [week] = await db.query(`
      SELECT IFNULL(SUM(total_amount),0) total
      FROM sales
      WHERE user_id = ?
      AND YEARWEEK(created_at,1) = YEARWEEK(CURDATE(),1)
    `, [userId]);

    res.json({
      sales: rows,
      today: today[0].total,
      week: week[0].total,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "User sales report error" });
  }
};
