const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/products", require("./routes/productRoutes"));
// app.use("/api/sales", require("./routes/salesRoutes"));

app.get("/", (req, res) => {
  res.send("HMP_POS API Running");
});

app.listen(5000, () => console.log("Server running on port 5000"));
