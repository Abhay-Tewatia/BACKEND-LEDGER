const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.services");
const mongoose = require("mongoose");
const userModel = require("../models/user.model");

const accountModel = require("../models/account.model");
/**
 *  – Create a new transaction
 *  THE 10-STEP TRANSFER FLOW:
 *
 *  1. Validate request
 *  2. Validate idempotency key
 *  3. Check account status
 *  4. Derive sender balance from ledger
 *  5. Create transaction (PENDING)
 *  6. Create DEBIT ledger entry
 *  7. Create CREDIT ledger entry
 *  8. Mark transaction COMPLETED
 *  9. Commit MongoDB session
 * 10. Send email notification
 */


async function createTransaction(req, res){
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
}

async function createInitialFundsTransaction(req, res){

  const { toAccount, amount, idempotencyKey } = req.body;

  if(!toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message : "toAccount, amount and idempotencyKey are required"
    });
  }

  const toUserAccount = await accountModel.findById(toAccount);

  if(!toUserAccount){
    return res.status(404).json({
      message : "toAccount not found"
    });
  }

  // system user already verified by adminMiddleware
  const fromUserAccount = req.user;

  const session = await mongoose.startSession();

  try{

    session.startTransaction();

    // idempotency check
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if(existingTransaction){
      return res.status(409).json({
        message : "Duplicate transaction detected"
      });
    }

    const transaction = new transactionModel({
      fromAccount : fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status : "PENDING"
    });

    await transaction.save({ session });

    // DEBIT entry
    await ledgerModel.create(
      [{
        account : fromUserAccount._id,
        amount,
        transaction : transaction._id,
        type : "DEBIT"
      }],
      { session }
    );

    // CREDIT entry
    await ledgerModel.create(
      [{
        account : toAccount,
        amount,
        transaction : transaction._id,
        type : "CREDIT"
      }],
      { session }
    );

    transaction.status = "COMPLETED";

    await transaction.save({ session });

    await session.commitTransaction();

    session.endSession();

    return res.status(201).json({
      message : "Initial funds transaction completed successfully",
      transaction
    });

  }
  catch(error){

    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message : "Transaction failed",
      error : error.message
    });

  }

//   Admin request
//       ↓
// Validate request
//       ↓
// Check idempotency
//       ↓
// Start MongoDB transaction
//       ↓
// Create transaction (PENDING)
//       ↓
// Debit ledger entry
//       ↓
// Credit ledger entry
//       ↓
// Mark transaction COMPLETED
//       ↓
// Commit DB transaction
//       ↓
// Return response

}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};