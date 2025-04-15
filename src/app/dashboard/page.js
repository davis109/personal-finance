'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { gsap } from 'gsap';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const cardRefs = useRef([]);
  const titleRef = useRef(null);
  
  // Fetch statistics data
  useEffect(() => {
    async function fetchStatistics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/statistics?month=${selectedMonth}&year=${selectedYear}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStatistics();
  }, [selectedMonth, selectedYear]);
  
  // GSAP animations
  useEffect(() => {
    if (!loading && stats) {
      // Animate title
      gsap.from(titleRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
      
      // Animate cards
      gsap.from(cardRefs.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }
  }, [loading, stats]);
  
  // Process category data for pie chart
  const getCategoryData = () => {
    if (!stats?.categories) return [];
    
    return Object.entries(stats.categories).map(([category, data]) => ({
      name: category,
      value: data.expense || 0
    })).filter(item => item.value > 0);
  };
  
  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Month selector options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <BackgroundAnimation />
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 ref={titleRef} className="text-2xl font-bold mb-4 md:mb-0">
          Financial Dashboard
        </h1>
        
        <div className="flex space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="input max-w-[150px]"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input max-w-[120px]"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          ref={(el) => (cardRefs.current[0] = el)}
          className="card bg-white dark:bg-gray-800"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Income
          </h3>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(stats?.summary?.totalIncome || 0)}
          </p>
        </div>
        
        <div 
          ref={(el) => (cardRefs.current[1] = el)}
          className="card bg-white dark:bg-gray-800"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Expenses
          </h3>
          <p className="text-2xl font-bold text-danger">
            {formatCurrency(stats?.summary?.totalExpense || 0)}
          </p>
        </div>
        
        <div 
          ref={(el) => (cardRefs.current[2] = el)}
          className="card bg-white dark:bg-gray-800"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Balance
          </h3>
          <p className={`text-2xl font-bold ${stats?.summary?.balance >= 0 ? 'text-secondary' : 'text-danger'}`}>
            {formatCurrency(stats?.summary?.balance || 0)}
          </p>
        </div>
        
        <div 
          ref={(el) => (cardRefs.current[3] = el)}
          className="card bg-white dark:bg-gray-800"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Transactions
          </h3>
          <p className="text-2xl font-bold text-info">
            {stats?.summary?.transactionCount || 0}
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expense by Category */}
        <div 
          ref={(el) => (cardRefs.current[4] = el)}
          className="card bg-white dark:bg-gray-800"
        >
          <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Monthly Trend */}
        <div 
          ref={(el) => (cardRefs.current[5] = el)}
          className="card bg-white dark:bg-gray-800"
        >
          <h3 className="text-lg font-medium mb-4">Monthly Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.monthlyTrend || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#2ecc71" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expense" stroke="#e74c3c" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Budget comparison */}
      {stats?.budgetComparison && stats.budgetComparison.length > 0 && (
        <div 
          ref={(el) => (cardRefs.current[6] = el)}
          className="card bg-white dark:bg-gray-800 mb-8"
        >
          <h3 className="text-lg font-medium mb-4">Budget vs Actual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.budgetComparison}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="budgeted" name="Budget" fill="#3498db" />
                <Bar dataKey="spent" name="Actual" fill="#e74c3c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Recent Transactions */}
      <div 
        ref={(el) => (cardRefs.current[7] = el)}
        className="card bg-white dark:bg-gray-800"
      >
        <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
        
        {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {transaction.category}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income' ? 'text-secondary' : 'text-danger'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No recent transactions found.</p>
        )}
      </div>
    </Layout>
  );
} 