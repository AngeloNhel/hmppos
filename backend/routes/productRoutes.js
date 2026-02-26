const router = require("express").Router();

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
} = require("../controllers/productController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getProducts);

router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);
router.post("/:id/restock", verifyToken, isAdmin, restockProduct);

module.exports = router;