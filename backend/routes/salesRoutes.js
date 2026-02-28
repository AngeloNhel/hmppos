const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");
const sales = require("../controllers/salesController");

router.post("/", verifyToken, sales.createSale);
router.get("/report", verifyToken, sales.getReport);
router.get("/summary", verifyToken, sales.getSummary);
router.get("/user/:userId", verifyToken, sales.getSalesByUser);

module.exports = router;