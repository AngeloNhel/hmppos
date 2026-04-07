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
      p.name AS product_name,
      p.description,
      si.unit,
      si.quantity,
      p.price,
      si.subtotal AS total,
      s.created_at AS datetime
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN products p ON si.product_id = p.id
  `;

  const values = [];
  let hasWhere = false;

  // CASHIER: Only their own sales
  if (req.user.role === "cashier") {
    sql += " WHERE s.user_id = ?";
    values.push(req.user.id);
    hasWhere = true;
  }

  //  DATE + TIME FILTER (IMPORTANT)
  if (start && end) {
    if (hasWhere) {
      sql += " AND s.created_at BETWEEN ? AND ?";
    } else {
      sql += " WHERE s.created_at BETWEEN ? AND ?";
    }

    values.push(start, end);
  }

  sql += " ORDER BY s.created_at DESC";

  try {
    const [report] = await db.query(sql, values);
    res.json(report);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Report error" });
  }
};

exports.getSummary = async (req, res) => {
  try {

    const isCashier = req.user.role === "cashier";
    const userId = req.user.id;

    // TOP 5 PRODUCTS
    const [topProducts] = await db.query(`
      SELECT 
        p.name,
        SUM(si.subtotal) total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      ${isCashier ? "WHERE s.user_id = ?" : ""}
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 5
    `, isCashier ? [userId] : []);

    // TODAY
    const [today] = await db.query(`
      SELECT IFNULL(SUM(total_amount),0) total
      FROM sales
      WHERE DATE(created_at) = CURDATE()
      ${isCashier ? "AND user_id = ?" : ""}
    `, isCashier ? [userId] : []);

    // WEEK
    const [week] = await db.query(`
      SELECT IFNULL(SUM(total_amount),0) total
      FROM sales
      WHERE YEARWEEK(created_at,1) = YEARWEEK(CURDATE(),1)
      ${isCashier ? "AND user_id = ?" : ""}
    `, isCashier ? [userId] : []);

    // MONTH
    const [month] = await db.query(`
      SELECT IFNULL(SUM(total_amount),0) total
      FROM sales
      WHERE MONTH(created_at) = MONTH(CURDATE())
      AND YEAR(created_at) = YEAR(CURDATE())
      ${isCashier ? "AND user_id = ?" : ""}
    `, isCashier ? [userId] : []);

    // TOP SELLING PRODUCT
    const [topProduct] = await db.query(`
      SELECT p.name, SUM(si.quantity) total_qty
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      ${isCashier ? "WHERE s.user_id = ?" : ""}
      GROUP BY p.id
      ORDER BY total_qty DESC
      LIMIT 1
    `, isCashier ? [userId] : []);

    // TOP CASHIER
    const [topCashier] = await db.query(`
      SELECT u.username, SUM(s.total_amount) total_sales
      FROM sales s
      JOIN users u ON s.user_id = u.id
      GROUP BY u.id
      ORDER BY total_sales DESC
      LIMIT 1
    `);

      // SALES TREND
    const [trend] = await db.query(`
      SELECT DATE(created_at) date,
             SUM(total_amount) total
      FROM sales
      WHERE created_at >= CURDATE() - INTERVAL 6 DAY
      ${isCashier ? "AND user_id = ?" : ""}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, isCashier ? [userId] : []);

    res.json({
      today: today[0].total,
      week: week[0].total,
      month: month[0].total,
      topProduct: topProduct[0] || null,
      topCashier: topCashier[0] || null,
      trend,
      topProducts
    });

  } catch (err) {
    console.log(err);
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




// NEWWWWWWWWWWWWWWWWWWWWW POSSSSSSSSSSSSSSSSS
// customers name in the dropdown 
exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT customer_name 
      FROM sales 
      WHERE customer_name IS NOT NULL 
      AND customer_name != ''
      ORDER BY customer_name ASC
    `);

    res.json(rows);
  } catch (err) {
    console.log("GET CUSTOMERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// checkout modal reciept
exports.createSale = async (req, res) => {
  const {
    cart,
    subtotal,
    discount_percent,
    discount_amount,
    total_amount,
    tendered,
    change_amount,
    customer_name,
    user_id
  } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. INSERT SALE
    const [saleResult] = await connection.query(
      `INSERT INTO sales 
      (receipt_no, user_id, subtotal, total_amount, created_at, discount_percent, discount_amount, tendered, change_amount, customer_name, status)
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, 'completed')`,
      [
        `OR-${Date.now()}`, // auto receipt
        user_id,
        subtotal,
        total_amount,
        discount_percent,
        discount_amount,
        tendered,
        change_amount,
        customer_name || "Walk-in"
      ]
    );

    const saleId = saleResult.insertId;

    // 2. INSERT SALE ITEMS + UPDATE STOCK
    for (const item of cart) {
      // insert sale item
      await connection.query(
        `INSERT INTO sale_items 
        (sale_id, product_id, quantity, unit, subtotal, product_name, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.id,
          item.qty,
          "pcs",
          item.price * item.qty,
          item.name,
          item.price
        ]
      );

      // update product stock
      await connection.query(
        `UPDATE products 
         SET stock = stock - ? 
         WHERE id = ?`,
        [item.qty, item.id]
      );

      // insert stock history
      await connection.query(
        `INSERT INTO stock_history 
        (product_id, stock_change, movement_type, created_at)
        VALUES (?, ?, 'SALE', NOW())`,
        [item.id, -item.qty]
      );
    }

    // 3. AUDIT LOG
    await connection.query(
      `INSERT INTO audit_logs (action, description, user_id, created_at)
       VALUES ('SALE', ?, ?, NOW())`,
      [`Processed sale OR-${saleId}`, user_id]
    );

    await connection.commit();

    res.status(200).json({
      message: "Sale completed successfully",
      sale_id: saleId
    });

  } catch (error) {
    await connection.rollback();
    console.error("CHECKOUT ERROR:", error);
    res.status(500).json({ message: "Checkout failed" });
  } finally {
    connection.release();
  }
};