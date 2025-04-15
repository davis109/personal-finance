import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Mock budgets data
    const budgets = [
      {
        _id: '1',
        category: 'Food',
        amount: 500,
        month: 4,
        year: 2025,
        spent: 320
      },
      {
        _id: '2',
        category: 'Housing',
        amount: 1500,
        month: 4,
        year: 2025,
        spent: 1500
      },
      {
        _id: '3',
        category: 'Transportation',
        amount: 300,
        month: 4,
        year: 2025,
        spent: 210
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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month'));
    const year = parseInt(searchParams.get('year'));
    
    // Filter budgets by month and year if provided
    let filteredBudgets = [...budgets];
    
    if (month && year) {
      filteredBudgets = filteredBudgets.filter(
        budget => budget.month === month && budget.year === year
      );
    }

    return NextResponse.json({ budgets: filteredBudgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const budget = await request.json();
    
    // In a real app, you would save to database here
    
    return NextResponse.json({
      message: 'Budget created successfully',
      budget: {
        ...budget,
        _id: Date.now().toString(), // Generate mock ID
        spent: 0 // Initialize spent amount to 0
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
} 