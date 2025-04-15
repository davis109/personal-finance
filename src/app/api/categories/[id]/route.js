import { NextResponse } from 'next/server';

// Mock categories data (same as in main categories route)
const categories = [
  {
    _id: '1',
    name: 'Food',
    type: 'expense',
    icon: '🍔',
    color: '#e74c3c'
  },
  {
    _id: '2',
    name: 'Housing',
    type: 'expense',
    icon: '🏠',
    color: '#3498db'
  },
  {
    _id: '3',
    name: 'Transportation',
    type: 'expense',
    icon: '🚗',
    color: '#f39c12'
  },
  {
    _id: '4',
    name: 'Utilities',
    type: 'expense',
    icon: '💡',
    color: '#9b59b6'
  },
  {
    _id: '5',
    name: 'Entertainment',
    type: 'expense',
    icon: '🎬',
    color: '#1abc9c'
  },
  {
    _id: '6',
    name: 'Salary',
    type: 'income',
    icon: '💼',
    color: '#2ecc71'
  },
  {
    _id: '7',
    name: 'Freelance',
    type: 'income',
    icon: '💻',
    color: '#27ae60'
  },
  {
    _id: '8',
    name: 'Investments',
    type: 'income',
    icon: '📈',
    color: '#16a085'
  }
];

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const category = categories.find(c => c._id === id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
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
      message: 'Category updated successfully',
      category: {
        ...updatedData,
        _id: id
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
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
      message: 'Category deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 