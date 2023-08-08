import { Schema,model } from "mongoose";
import User from "./User.js";
import { Types } from "mongoose";

const addTransactionSchema = new Schema({

  user: {
    type: Types.ObjectId,
    ref: User,
  },
  title: String,
  amount: Number,
  date: String,
  category: String

});

const Transaction = model("Transaction", addTransactionSchema);

export default Transaction;