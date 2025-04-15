import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

    // Mock statistics data
    const mockStatistics = {
      summary: {
        totalIncome: 3500,
        totalExpense: 2180,
        balance: 1320,
        savingsRate: 37.7
      },
      categories: {
        'Food': {
          income: 0,
          expense: 320,
          budget: 500,
          percentage: 14.7
        },
        'Housing': {
          income: 0,
          expense: 1500,
          budget: 1500,
          percentage: 68.8
        },
        'Transportation': {
          income: 0,
          expense: 210,
          budget: 300,
          percentage: 9.6
        },
        'Entertainment': {
          income: 0,
          expense: 150,
          budget: 200,
          percentage: 6.9
        },
        'Salary': {
          income: 3000,
          expense: 0,
          budget: 0,
          percentage: 85.7
        },
        'Freelance': {
          income: 500,
          expense: 0,
          budget: 0,
          percentage: 14.3
        }
      },
      trends: {
        incomeGrowth: 5.2,
        expenseGrowth: -2.8,
        topExpenseCategory: 'Housing',
        topIncomeCategory: 'Salary'
      }
    };

    // If requesting different month, adjust some numbers to create variation
    if (month !== new Date().getMonth() + 1 || year !== new Date().getFullYear()) {
      const randomFactor = 0.8 + Math.random() * 0.4; // Random between 0.8 and 1.2
      
      mockStatistics.summary.totalIncome = Math.round(mockStatistics.summary.totalIncome * randomFactor);
      mockStatistics.summary.totalExpense = Math.round(mockStatistics.summary.totalExpense * randomFactor);
      mockStatistics.summary.balance = mockStatistics.summary.totalIncome - mockStatistics.summary.totalExpense;
      mockStatistics.summary.savingsRate = Math.round((mockStatistics.summary.balance / mockStatistics.summary.totalIncome) * 100 * 10) / 10;
      
      Object.keys(mockStatistics.categories).forEach(category => {
        const catRandomFactor = 0.7 + Math.random() * 0.6; // Random between 0.7 and 1.3
        if (mockStatistics.categories[category].income > 0) {
          mockStatistics.categories[category].income = Math.round(mockStatistics.categories[category].income * catRandomFactor);
        }
        if (mockStatistics.categories[category].expense > 0) {
          mockStatistics.categories[category].expense = Math.round(mockStatistics.categories[category].expense * catRandomFactor);
        }
      });
    }

    return NextResponse.json(mockStatistics);
  } catch (error) {
    console.error('Error generating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to generate statistics' },
      { status: 500 }
    );
  }
} 