import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Mock data for demo mode
const mockBudgets = [
  {
    _id: '1',
    category: 'Housing',
    amount: 1500,
    month: 4,
    year: 2025,
    spent: 1200
  },
  {
    _id: '2',
    category: 'Food',
    amount: 400,
    month: 4,
    year: 2025,
    spent: 210
  },
  {
    _id: '3',
    category: 'Transportation',
    amount: 300,
    month: 4,
    year: 2025,
    spent: 180
  },
  {
    _id: '4',
    category: 'Entertainment',
    amount: 200,
    month: 4,
    year: 2025,
    spent: 150
  }
];

export async function GET(request) {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
    
    if (isDemo) {
      // Return mock data for demo mode
      const filteredBudgets = mockBudgets.map(budget => ({
        ...budget,
        month,
        year
      }));
      return NextResponse.json(filteredBudgets);
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch budgets for the specified month and year
    const budgets = await db.collection('budgets')
      .find({ month, year })
      .toArray();
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // For each budget, calculate how much has been spent
    const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
      // Find transactions for this category and date range
      const transactions = await db.collection('transactions').find({
        category: budget.category,
        date: {
          $gte: startDate,
          $lte: endDate
        },
        type: 'expense'
      }).toArray();
      
      // Calculate total spent (negative amounts converted to positive)
      const spent = transactions.reduce((total, tx) => total + Math.abs(tx.amount), 0);
      
      return {
        ...budget,
        spent
      };
    }));
    
    return NextResponse.json(budgetsWithSpending);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.category || !body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Category and amount (positive) are required' },
        { status: 400 }
      );
    }
    
    // Set month and year if not provided
    const month = body.month || new Date().getMonth() + 1;
    const year = body.year || new Date().getFullYear();
    
    const budgetData = {
      category: body.category,
      amount: parseFloat(body.amount),
      month,
      year,
      createdAt: new Date()
    };
    
    if (isDemo) {
      // Return success response without saving to database
      return NextResponse.json({
        ...budgetData,
        _id: Math.random().toString(36).substring(2, 15),
        spent: 0
      });
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Check if a budget for this category and month already exists
    const existingBudget = await db.collection('budgets').findOne({
      category: budgetData.category,
      month,
      year
    });
    
    if (existingBudget) {
      // Update existing budget
      const result = await db.collection('budgets').updateOne(
        { _id: existingBudget._id },
        { $set: { amount: budgetData.amount, updatedAt: new Date() } }
      );
      
      return NextResponse.json({
        ...existingBudget,
        amount: budgetData.amount,
        updatedAt: new Date()
      });
    } else {
      // Insert new budget
      const result = await db.collection('budgets').insertOne(budgetData);
      return NextResponse.json({
        ...budgetData,
        _id: result.insertedId
      });
    }
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget' },
      { status: 500 }
    );
  }
} 