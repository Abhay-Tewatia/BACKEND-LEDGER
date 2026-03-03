const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();



/* user registration */
/* POST /api/auth/register */
router.post("/register", authController.userRegisterController);

/* user login */
/* POST /api/auth/login */
router.post("/login", authController.userLoginController);

module.exports = router;