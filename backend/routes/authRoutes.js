const router = require("express").Router();

const {
  login,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// PUBLIC
router.post("/login", login);

// ADMIN ONLY
router.post("/register", verifyToken, isAdmin, createUser);
router.get("/users", verifyToken, isAdmin, getUsers);
router.put("/users/:id", verifyToken, isAdmin, updateUser);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;