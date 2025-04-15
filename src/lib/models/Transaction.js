import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [100, 'Description cannot be more than 100 characters'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now,
  },
  category: {
    type: String,
    default: 'Uncategorized',
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Please specify if this is income or expense'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema); 