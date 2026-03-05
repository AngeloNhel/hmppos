const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// allow requests from your Netlify frontend
app.use(cors({
  origin: "https://brilliant-concha-645eab.netlify.app",
}));

app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/sale-items", require("./routes/saleItemsRoute"));
app.use("/api/stock-history", require("./routes/stockHistoryRoutes"));

// use dynamic port for deployment
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});