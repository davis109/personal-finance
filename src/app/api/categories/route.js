import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Mock data for demo mode
const mockCategories = [
  {
    _id: '1',
    name: 'Income',
    type: 'income',
    icon: 'wallet',
    color: '#4CAF50',
    createdAt: new Date('2025-04-01')
  },
  {
    _id: '2',
    name: 'Housing',
    type: 'expense',
    icon: 'home',
    color: '#2196F3',
    createdAt: new Date('2025-04-01')
  },
  {
    _id: '3',
    name: 'Food',
    type: 'expense',
    icon: 'utensils',
    color: '#FF9800',
    createdAt: new Date('2025-04-01')
  },
  {
    _id: '4',
    name: 'Transportation',
    type: 'expense',
    icon: 'car',
    color: '#9C27B0',
    createdAt: new Date('2025-04-01')
  },
  {
    _id: '5',
    name: 'Entertainment',
    type: 'expense',
    icon: 'film',
    color: '#F44336',
    createdAt: new Date('2025-04-01')
  },
  {
    _id: '6',
    name: 'Healthcare',
    type: 'expense',
    icon: 'medkit',
    color: '#00BCD4',
    createdAt: new Date('2025-04-01')
  }
];

export async function GET() {
  // Check if we're in demo mode
  const isDemo = process.env.IS_DEMO === 'true';
  
  try {
    if (isDemo) {
      // Return mock data for demo mode
      return NextResponse.json({ 
        categories: mockCategories,
        success: true 
      });
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Get categories
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    return NextResponse.json({ 
      categories, 
      success: true 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', success: false }, 
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
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Name and type are required', success: false },
        { status: 400 }
      );
    }
    
    // Format category data
    const category = {
      name: body.name,
      type: body.type,
      icon: body.icon || 'tag',
      color: body.color || '#808080',
      createdAt: new Date()
    };
    
    if (isDemo) {
      // For demo mode, just return success with the category data
      return NextResponse.json({ 
        category: { ...category, _id: String(Date.now()) },
        success: true 
      });
    }
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Check if category already exists
    const existingCategory = await db.collection('categories').findOne({ name: category.name });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists', success: false },
        { status: 400 }
      );
    }
    
    // Insert category
    const result = await db.collection('categories').insertOne(category);
    
    return NextResponse.json({ 
      category: { ...category, _id: result.insertedId },
      success: true 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', success: false }, 
      { status: 500 }
    );
  }
} 