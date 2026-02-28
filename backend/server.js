const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/sale-items", require("./routes/saleItemsRoute"));
app.use("/api/stock-history", require("./routes/stockHistoryRoutes"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});