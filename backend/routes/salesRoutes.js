const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");
const sales = require("../controllers/salesController");
const { getCustomers } = require("../controllers/salesController");
const { createSale } = require("../controllers/salesController");

router.post("/", verifyToken, sales.createSale);
router.get("/report", verifyToken, sales.getReport);
router.get("/summary", verifyToken, sales.getSummary);
router.get("/user/:userId", verifyToken, sales.getSalesByUser);


// NEWWWWWWWWWWWWWWWWWWWWW POSSSSSSSSSSSSSSSSS
// customers name in the dropdown 
router.get("/customers", getCustomers);
// checkout modal reciept
router.post("/checkout", createSale);

module.exports = router;