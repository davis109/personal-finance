'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { gsap } from 'gsap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Budgets() {
  const [loading, setLoading] = useState(true);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});
  
  // Month and year selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: selectedMonth,
    year: selectedYear
  });
  
  // Animation refs
  const formRef = useRef(null);
  const chartRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  
  // Fetch budgets for the selected month and year
  useEffect(() => {
    async function fetchBudgets() {
      try {
        setBudgetsLoading(true);
        
        const response = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch budgets');
        }
        
        const data = await response.json();
        setBudgets(data.budgets || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        setError('Failed to load budgets. Please try again.');
      } finally {
        setBudgetsLoading(false);
        setLoading(false);
      }
    }
    
    fetchBudgets();
    
    // Update form data when selected month/year changes
    setFormData(prev => ({
      ...prev,
      month: selectedMonth,
      year: selectedYear
    }));
  }, [selectedMonth, selectedYear]);
  
  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        // Filter out income categories
        const expenseCategories = data.categories.filter(cat => 
          cat.type === 'expense' || cat.type === 'both'
        );
        
        setCategories(expenseCategories);
        
        // Initialize form with first category if empty
        if (expenseCategories.length > 0 && !formData.category) {
          setFormData(prev => ({
            ...prev,
            category: expenseCategories[0].name
          }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      }
    }
    
    fetchCategories();
  }, []);
  
  // Fetch statistics for comparison
  useEffect(() => {
    async function fetchStatistics() {
      try {
        setStatsLoading(true);
        const response = await fetch(`/api/statistics?month=${selectedMonth}&year=${selectedYear}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStatistics(data || {});
      } catch (err) {
        console.error('Error fetching statistics:', err);
        // Non-blocking error, we can still show budgets without stats
      } finally {
        setStatsLoading(false);
      }
    }
    
    fetchStatistics();
  }, [selectedMonth, selectedYear]);
  
  // GSAP animations - only run when data is loaded and components are mounted
  useEffect(() => {
    const shouldAnimate = !loading && !budgetsLoading && !statsLoading;
    
    if (shouldAnimate) {
      // Animate title
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
      }
      
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.2 }
        );
      }
      
      if (chartRef.current) {
        gsap.fromTo(
          chartRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.4 }
        );
      }
      
      if (cardsRef.current && cardsRef.current.children.length > 0) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 30, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            stagger: 0.1, 
            duration: 0.4, 
            ease: 'power2.out',
            delay: 0.6 
          }
        );
      }
    }
  }, [loading, budgetsLoading, statsLoading, budgets.length]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? value : value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please provide a valid category and amount');
      return;
    }
    
    try {
      setBudgetsLoading(true);
      
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save budget');
      }
      
      // Refresh budgets
      const budgetsResponse = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`);
      const budgetsData = await budgetsResponse.json();
      setBudgets(budgetsData.budgets || []);
      
      // Reset form
      setFormData({
        ...formData,
        amount: ''
      });
      
      setError(null);
    } catch (err) {
      console.error('Error saving budget:', err);
      setError('Failed to save budget. Please try again.');
    } finally {
      setBudgetsLoading(false);
    }
  };
  
  // Chart data preparation
  const getChartData = () => {
    if (!budgets || !statistics) return [];
    
    return budgets.map(budget => {
      const category = budget.category;
      const actualData = statistics.categories && statistics.categories[category] 
        ? statistics.categories[category].expense || 0 
        : 0;
      
      const remaining = Math.max(0, budget.amount - actualData);
      const overspent = actualData > budget.amount ? actualData - budget.amount : 0;
      
      return {
        category,
        budget: budget.amount,
        actual: actualData,
        remaining,
        overspent
      };
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Budget status calculation
  const calculateBudgetStatus = (budget) => {
    if (!statistics || !statistics.categories) return { status: 'neutral', percentage: 0 };
    
    const category = budget.category;
    const actualData = statistics.categories && statistics.categories[category] 
      ? statistics.categories[category].expense || 0 
      : 0;
    
    const percentage = budget.amount > 0 ? Math.round((actualData / budget.amount) * 100) : 0;
    
    if (percentage >= 100) {
      return { 
        status: 'danger', 
        percentage: 100, 
        message: `Overspent by ${formatCurrency(actualData - budget.amount)}` 
      };
    } else if (percentage >= 75) {
      return { 
        status: 'warning', 
        percentage, 
        message: `${formatCurrency(budget.amount - actualData)} remaining` 
      };
    } else {
      return { 
        status: 'success', 
        percentage, 
        message: `${formatCurrency(budget.amount - actualData)} remaining` 
      };
    }
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
  
  // Determine if chart data is ready to display
  const chartData = getChartData();
  const isChartReady = !budgetsLoading && !statsLoading && budgets.length > 0;
  const showLoader = loading || (budgetsLoading && !budgets.length);
  
  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 ref={titleRef} className="text-2xl font-bold mb-4 md:mb-0">
          Budget Management
        </h1>
        
        <div className="flex space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="input max-w-[150px]"
            disabled={budgetsLoading}
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
            disabled={budgetsLoading}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Budget form */}
      <div ref={formRef} className="card bg-white dark:bg-gray-800 mb-6">
        <h2 className="text-lg font-medium mb-4">Set Budget</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input w-full"
              required
              disabled={budgetsLoading}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input w-full"
              required
              disabled={budgetsLoading}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary h-[42px] mt-6"
            disabled={budgetsLoading}
          >
            {budgetsLoading ? 'Saving...' : 'Set Budget'}
          </button>
        </form>
      </div>
      
      {/* Budget comparison chart */}
      <div ref={chartRef} className="card bg-white dark:bg-gray-800 mb-6">
        <h2 className="text-lg font-medium mb-4">Budget vs Actual Spending</h2>
        
        {showLoader ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : budgets.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="#3498db" />
                <Bar dataKey="actual" name="Actual" fill="#e74c3c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>No budgets set for this month. Add your first budget above!</p>
          </div>
        )}
      </div>
      
      {/* Budget status cards */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const { status, percentage, message } = calculateBudgetStatus(budget);
          const statusColors = {
            success: 'bg-secondary',
            warning: 'bg-warning',
            danger: 'bg-danger',
            neutral: 'bg-gray-400'
          };
          
          return (
            <div key={budget._id} className="card bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium mb-2">{budget.category}</h3>
              <p className="text-2xl font-bold mb-4">{formatCurrency(budget.amount)}</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className={`h-2.5 rounded-full ${statusColors[status]}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>{percentage}% used</span>
                <span className={`${
                  status === 'danger' ? 'text-danger' : 
                  status === 'warning' ? 'text-warning' : 
                  'text-secondary'
                }`}>
                  {message}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
} 