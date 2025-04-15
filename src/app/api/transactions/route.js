import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Mock data for demo mode
const mockTransactions = [
  {
    _id: '1',
    description: 'Salary',
    amount: 3000,
    type: 'income',
    category: 'Income',
    date: new Date('2025-04-01'),
    notes: 'Monthly salary'
  },
  {
    _id: '2',
    description: 'Rent',
    amount: -1200,
    type: 'expense',
    category: 'Housing',
    date: new Date('2025-04-05'),
    notes: 'Monthly rent'
  },
  {
    _id: '3',
    description: 'Groceries',
    amount: -150,
    type: 'expense',
    category: 'Food',
    date: new Date('2025-04-10'),
    notes: 'Weekly groceries'
  },
  {
    _id: '4',
    description: 'Restaurant',
    amount: -60,
    type: 'expense',
    category: 'Food',
    date: new Date('2025-04-15'),
    notes: 'Dinner with friends'
  },
  {
    _id: '5',
    description: 'Freelance Work',
    amount: 500,
    type: 'income',
    category: 'Income',
    date: new Date('2025-04-20'),
    notes: 'Website development project'
  }
];

export async function GET(request) {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    if (isDemo) {
      // Return mock data for demo mode
      return NextResponse.json({ 
        transactions: mockTransactions,
        totalCount: mockTransactions.length,
        success: true 
      });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build query object
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    
    if (type) {
      query.type = type;
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Get transactions with pagination and filter
    const transactions = await db
      .collection('transactions')
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get total count for pagination
    const totalCount = await db.collection('transactions').countDocuments(query);
    
    return NextResponse.json({ 
      transactions, 
      totalCount,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', success: false }, 
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
    if (!body.description || !body.amount || !body.type || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }
    
    // Format transaction data
    const transaction = {
      description: body.description,
      amount: body.type === 'expense' ? -Math.abs(body.amount) : Math.abs(body.amount),
      type: body.type,
      category: body.category,
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes || '',
      createdAt: new Date()
    };
    
    if (isDemo) {
      // For demo mode, just return success with the transaction data
      return NextResponse.json({ 
        transaction: { ...transaction, _id: String(Date.now()) },
        success: true 
      });
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Insert transaction
    const result = await db.collection('transactions').insertOne(transaction);
    
    return NextResponse.json({ 
      transaction: { ...transaction, _id: result.insertedId },
      success: true 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction', success: false }, 
      { status: 500 }
    );
  }
} 