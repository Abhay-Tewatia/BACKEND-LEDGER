const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Transaction must have a source account"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Transaction must have a destination account"],
        index: true
    },
    status: {
        type: String,
        enum :{
            values : ["PENDING","REVERSED", "COMPLETED", "FAILED"],
            message : "Status must be either PENDING, COMPLETED or FAILED or REVERSED"
        }
    },
    amount: {
        type: Number,
        required: [true, "Transaction amount is required"],
        min: [0.01, "Transaction amount must be at least 0.01"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        unique: true
    },

    },
{
    timestamps: true
});
const TransactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = TransactionModel;