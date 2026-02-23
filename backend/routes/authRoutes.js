const router = require("express").Router();
const { login, createUser } = require("../controllers/authController");

// login route
router.post("/login", login);

// create user route
router.post("/register", createUser);

module.exports = router;