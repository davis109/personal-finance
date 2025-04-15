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

export async function GET(request, { params }) {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    const { id } = params;
    
    if (isDemo) {
      // Find budget in mock data
      const budget = mockBudgets.find(b => b._id === id);
      if (!budget) {
        return NextResponse.json(
          { error: 'Budget not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(budget);
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Find the budget by ID
    let budget;
    try {
      budget = await db.collection('budgets').findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid budget ID format' },
        { status: 400 }
      );
    }
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    // Get the month and year from the budget
    const { month, year, category } = budget;
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Find transactions for this category and date range
    const transactions = await db.collection('transactions').find({
      category,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      type: 'expense'
    }).toArray();
    
    // Calculate total spent
    const spent = transactions.reduce((total, tx) => total + Math.abs(tx.amount), 0);
    
    return NextResponse.json({
      ...budget,
      spent
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.category || !body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Category and amount (positive) are required' },
        { status: 400 }
      );
    }
    
    const budgetData = {
      category: body.category,
      amount: parseFloat(body.amount),
      month: body.month || new Date().getMonth() + 1,
      year: body.year || new Date().getFullYear(),
      updatedAt: new Date()
    };
    
    if (isDemo) {
      // Find and update in mock data for demo
      const index = mockBudgets.findIndex(b => b._id === id);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Budget not found' },
          { status: 404 }
        );
      }
      
      // Update the mock budget
      const updatedBudget = {
        ...mockBudgets[index],
        ...budgetData
      };
      
      return NextResponse.json(updatedBudget);
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Update the budget
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid budget ID format' },
        { status: 400 }
      );
    }
    
    const result = await db.collection('budgets').updateOne(
      { _id: objectId },
      { $set: budgetData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      _id: id,
      ...budgetData
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    const { id } = params;
    
    if (isDemo) {
      // Check if budget exists in mock data
      const index = mockBudgets.findIndex(b => b._id === id);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Budget not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ message: 'Budget deleted successfully' });
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Delete the budget
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid budget ID format' },
        { status: 400 }
      );
    }
    
    const result = await db.collection('budgets').deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
} 