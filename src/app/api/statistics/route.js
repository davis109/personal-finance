import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Mock data for demo mode
const mockStatistics = {
  summary: {
    totalIncome: 3500,
    totalExpense: -1410,
    balance: 2090
  },
  categories: {
    "Income": {
      income: 3500,
      expense: 0
    },
    "Housing": {
      income: 0,
      expense: 1200
    },
    "Food": {
      income: 0,
      expense: 210
    }
  },
  categoryTotals: [
    {
      category: "Income",
      total: 3500
    },
    {
      category: "Housing",
      total: -1200
    },
    {
      category: "Food",
      total: -210
    }
  ],
  recentTransactions: [
    {
      _id: '1',
      description: 'Salary',
      amount: 3000,
      type: 'income',
      category: 'Income',
      date: new Date('2025-04-01')
    },
    {
      _id: '2',
      description: 'Rent',
      amount: -1200,
      type: 'expense',
      category: 'Housing',
      date: new Date('2025-04-05')
    },
    {
      _id: '3',
      description: 'Groceries',
      amount: -150,
      type: 'expense',
      category: 'Food',
      date: new Date('2025-04-10')
    },
    {
      _id: '5',
      description: 'Freelance Work',
      amount: 500,
      type: 'income',
      category: 'Income',
      date: new Date('2025-04-20')
    }
  ]
};

export async function GET(request) {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    if (isDemo) {
      // Return mock data for demo mode
      return NextResponse.json(mockStatistics);
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
    
    // Create date range for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch transactions for the month
    const transactions = await db.collection('transactions')
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ date: -1 })
      .toArray();
    
    // Calculate summary
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Process categories
    const categories = {};
    
    transactions.forEach(transaction => {
      // Update totals
      if (transaction.amount > 0) {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
      
      // Update category data
      if (!categories[transaction.category]) {
        categories[transaction.category] = {
          income: 0,
          expense: 0
        };
      }
      
      if (transaction.amount > 0) {
        categories[transaction.category].income += transaction.amount;
      } else {
        categories[transaction.category].expense += Math.abs(transaction.amount);
      }
    });
    
    // Format category totals for charts
    const categoryTotals = Object.entries(categories).map(([category, data]) => ({
      category,
      total: data.income - data.expense
    }));
    
    // Get recent transactions (limited to 5)
    const recentTransactions = transactions.slice(0, 5);
    
    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome + totalExpense
      },
      categories,
      categoryTotals,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' }, 
      { status: 500 }
    );
  }
} 