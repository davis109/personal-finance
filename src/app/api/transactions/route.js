import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Mock data for demonstration
    const transactions = [
      {
        _id: '1',
        title: 'Salary',
        amount: 3000,
        type: 'income',
        category: 'Salary',
        date: new Date('2025-04-01'),
        description: 'Monthly salary payment'
      },
      {
        _id: '2',
        title: 'Rent',
        amount: 1200,
        type: 'expense',
        category: 'Housing',
        date: new Date('2025-04-05'),
        description: 'Monthly rent payment'
      },
      {
        _id: '3',
        title: 'Groceries',
        amount: 150,
        type: 'expense',
        category: 'Food',
        date: new Date('2025-04-10'),
        description: 'Weekly grocery shopping'
      },
      {
        _id: '4',
        title: 'Freelance Work',
        amount: 500,
        type: 'income',
        category: 'Freelance',
        date: new Date('2025-04-15'),
        description: 'Website development project'
      }
    ];

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Filter transactions
    let filteredTransactions = [...transactions];
    
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= end);
    }

    // Paginate results
    const totalItems = filteredTransactions.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const transaction = await request.json();
    
    // In a real app, you would save to database here
    
    return NextResponse.json({ 
      message: 'Transaction created successfully',
      transaction: {
        ...transaction,
        _id: Date.now().toString(), // generate mock ID
        date: transaction.date || new Date()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 