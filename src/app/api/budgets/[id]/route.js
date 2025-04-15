import { NextResponse } from 'next/server';

// Mock budgets data (same as in main budgets route)
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

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const budget = budgets.find(b => b._id === id);

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const updatedData = await request.json();
    
    // In a real app, you would update in database here
    // Simulate successful update
    
    return NextResponse.json({
      message: 'Budget updated successfully',
      budget: {
        ...updatedData,
        _id: id
      }
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
  try {
    const id = params.id;
    
    // In a real app, you would delete from database here
    // Simulate successful deletion
    
    return NextResponse.json({ 
      message: 'Budget deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
} 