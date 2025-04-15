import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
  },
  color: {
    type: String,
    default: '#3498db', // Default blue color
  },
  icon: {
    type: String,
    default: 'tag', // Default icon name
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'both'],
    default: 'expense',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema); 