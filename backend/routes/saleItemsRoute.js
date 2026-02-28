const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const saleItems = require("../controllers/saleItemsController");

router.get("/", verifyToken, isAdmin, saleItems.getSaleItems);
router.get("/sale/:saleId", verifyToken, saleItems.getSaleItemsBySale);

module.exports = router;