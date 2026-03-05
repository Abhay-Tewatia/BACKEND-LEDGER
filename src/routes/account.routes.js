const express = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router  = express.Router();


/*
-post /api/account
- create a new account
- Protected Route
*/
router.post("/", 
    authMiddleware.authMiddleware,
 accountController.createAccountController);

 /*-get /api/account
- get all accounts of the logged in user
- Protected Route
*/
router.get("/", 
    authMiddleware.authMiddleware,
 accountController.getUserAccountsController);

 /*
     -get /api/account/balance
        - get balance of the logged in user
        - Protected Route
 */
router.get("/balance/:accountId", 
    authMiddleware.authMiddleware,
 accountController.getAccountBalanceController);


module.exports = router;