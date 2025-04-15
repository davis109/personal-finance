import { connectToDatabase } from './mongodb';
import Category from './models/Category';

const defaultCategories = [
  {
    name: 'Food & Dining',
    color: '#e74c3c',
    icon: 'utensils',
    type: 'expense',
  },
  {
    name: 'Transportation',
    color: '#3498db',
    icon: 'car',
    type: 'expense',
  },
  {
    name: 'Housing',
    color: '#2ecc71',
    icon: 'home',
    type: 'expense',
  },
  {
    name: 'Utilities',
    color: '#f39c12',
    icon: 'bolt',
    type: 'expense',
  },
  {
    name: 'Entertainment',
    color: '#9b59b6',
    icon: 'film',
    type: 'expense',
  },
  {
    name: 'Shopping',
    color: '#e67e22',
    icon: 'shopping-bag',
    type: 'expense',
  },
  {
    name: 'Healthcare',
    color: '#1abc9c',
    icon: 'medkit',
    type: 'expense',
  },
  {
    name: 'Personal Care',
    color: '#34495e',
    icon: 'user',
    type: 'expense',
  },
  {
    name: 'Education',
    color: '#8e44ad',
    icon: 'book',
    type: 'expense',
  },
  {
    name: 'Salary',
    color: '#27ae60',
    icon: 'money-bill',
    type: 'income',
  },
  {
    name: 'Investment',
    color: '#16a085',
    icon: 'chart-line',
    type: 'income',
  },
  {
    name: 'Gift',
    color: '#f1c40f',
    icon: 'gift',
    type: 'income',
  },
  {
    name: 'Other',
    color: '#95a5a6',
    icon: 'ellipsis-h',
    type: 'both',
  },
];

export async function initDatabase() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    
    if (existingCategories === 0) {
      // Insert default categories
      await Category.insertMany(defaultCategories);
      console.log('Default categories created successfully');
    } else {
      console.log('Categories already exist, skipping initialization');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error };
  }
} 