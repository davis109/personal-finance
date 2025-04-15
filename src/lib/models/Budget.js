import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    unique: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a budget amount'],
    min: [0, 'Budget amount cannot be negative'],
  },
  month: {
    type: Number,
    required: [true, 'Please provide a month'],
    min: [1, 'Month must be between 1-12'],
    max: [12, 'Month must be between 1-12'],
  },
  year: {
    type: Number,
    required: [true, 'Please provide a year'],
    min: [2000, 'Year must be 2000 or later'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Create a compound index for category, month, and year
BudgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema); 