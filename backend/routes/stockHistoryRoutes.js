const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const stockHistory = require("../controllers/stockHistoryController");

router.get("/", verifyToken, isAdmin, stockHistory.getStockHistory);
router.get("/product/:productId", verifyToken, isAdmin, stockHistory.getStockHistoryByProduct);

module.exports = router;