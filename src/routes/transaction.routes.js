const {Router} = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");



const transactionRoutes = Router();
/*
- post /api/transactions/
- create a new transaction
*/
transactionRoutes.post("/", authMiddleware, transactionController.createTransaction);


/**
 * -Post /api/transactions/system/iniitial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post(
  "/system/initial-funds",
  (req, res, next) => {
    console.log("Route hit: /system/initial-funds");
    next();
  },
  adminMiddleware,
  transactionController.createInitialFundsTransaction
);

module.exports = transactionRoutes;