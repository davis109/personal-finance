'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { gsap } from 'gsap';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  
  // Date range state
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  
  // Animation refs
  const titleRef = useRef(null);
  const summaryRef = useRef(null);
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  
  // Fetch current month statistics
  useEffect(() => {
    async function fetchStatistics() {
      try {
        setLoading(true);
        const currentMonth = new Date().getMonth() + 1; // API expects 1-12 month format
        const currentYear = new Date().getFullYear();
        
        const response = await fetch(`/api/statistics?month=${currentMonth}&year=${currentYear}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStatistics(data || {});
        setError(null);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStatistics();
  }, []);
  
  // Fetch monthly data for trend analysis
  useEffect(() => {
    async function fetchMonthlyData() {
      try {
        setLoading(true);
        // API expects months in 1-12 format
        const apiStartMonth = startMonth + 1;
        const apiEndMonth = endMonth + 1;
        
        // Create a series of monthly requests
        let data = [];
        let currentYear = startYear;
        let currentMonth = apiStartMonth;
        
        // Loop through months between start and end dates
        while (
          currentYear < endYear || 
          (currentYear === endYear && currentMonth <= apiEndMonth)
        ) {
          try {
            const response = await fetch(`/api/statistics?month=${currentMonth}&year=${currentYear}`);
            if (!response.ok) continue;
            
            const monthData = await response.json();
            
            // Format data for charts
            data.push({
              month: currentMonth,
              year: currentYear,
              income: monthData.summary?.totalIncome || 0,
              expenses: Math.abs(monthData.summary?.totalExpense || 0),
              netIncome: (monthData.summary?.totalIncome || 0) - Math.abs(monthData.summary?.totalExpense || 0)
            });
          } catch (error) {
            console.error(`Error fetching data for ${currentMonth}/${currentYear}:`, error);
          }
          
          // Move to next month
          if (currentMonth === 12) {
            currentMonth = 1;
            currentYear++;
          } else {
            currentMonth++;
          }
        }
        
        if (data.length === 0) {
          setError('No data available for the selected period.');
        } else {
          setMonthlyData(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching monthly data:', err);
        setError('Failed to load monthly data. Please try again.');
        setMonthlyData([]); // Clear any previous data on error
      } finally {
        setLoading(false);
      }
    }
    
    // Only fetch if we have valid date range
    if (startYear && startMonth !== null && endYear && endMonth !== null) {
      // Validate date range before fetching
      const startDate = new Date(startYear, startMonth, 1);
      const endDate = new Date(endYear, endMonth, 1);
      
      if (startDate <= endDate) {
        fetchMonthlyData();
      } else {
        setError('Start date must be before or equal to end date.');
        setMonthlyData([]);
        setLoading(false);
      }
    }
  }, [startMonth, startYear, endMonth, endYear]);
  
  // GSAP animations
  useEffect(() => {
    if (!loading && titleRef.current && summaryRef.current) {
      // Animate title
      gsap.fromTo(
        titleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
      
      // Animate summary cards
      gsap.fromTo(
        summaryRef.current.children,
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.4, 
          ease: 'power2.out',
          delay: 0.2
        }
      );
      
      // Animate charts if they exist
      if (lineChartRef.current) {
        gsap.fromTo(
          lineChartRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.4 }
        );
      }
      
      if (pieChartRef.current) {
        gsap.fromTo(
          pieChartRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.6 }
        );
      }
    }
  }, [loading, monthlyData]);
  
  // Handle date changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'startMonth':
        setStartMonth(parseInt(value));
        break;
      case 'startYear':
        setStartYear(parseInt(value));
        break;
      case 'endMonth':
        setEndMonth(parseInt(value));
        break;
      case 'endYear':
        setEndYear(parseInt(value));
        break;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get month name
  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };
  
  // Prepare category data for pie chart
  const getCategoryData = () => {
    if (!statistics.categories) return [];
    
    return Object.entries(statistics.categories)
      .filter(([_, data]) => data.expense > 0) // Only include expenses
      .map(([category, data]) => ({
        name: category,
        value: data.expense || 0
      }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Calculate totals for selected period
  const calculateTotals = () => {
    if (!monthlyData.length) {
      return { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
    }
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    monthlyData.forEach(month => {
      totalIncome += month.income || 0;
      totalExpenses += month.expenses || 0;
    });
    
    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses
    };
  };
  
  // Generate insights based on data
  const generateInsights = () => {
    if (!monthlyData.length) return [];
    
    const insights = [];
    const { totalIncome, totalExpenses, netIncome } = calculateTotals();
    
    // Savings rate
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      insights.push({
        title: 'Savings Rate',
        value: `${savingsRate.toFixed(1)}%`,
        icon: 'piggy-bank',
        color: savingsRate >= 20 ? 'green' : savingsRate >= 10 ? 'yellow' : 'red'
      });
    }
    
    // Expense trend
    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[monthlyData.length - 1].expenses || 0;
      const prevMonth = monthlyData[monthlyData.length - 2].expenses || 0;
      const trend = prevMonth !== 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
      
      insights.push({
        title: 'Monthly Expense Trend',
        value: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`,
        icon: trend > 0 ? 'arrow-up' : 'arrow-down',
        color: trend <= 0 ? 'green' : trend <= 5 ? 'yellow' : 'red'
      });
    }
    
    // Get largest expense category
    const categoryData = getCategoryData();
    if (categoryData.length > 0) {
      insights.push({
        title: 'Top Expense Category',
        value: `${categoryData[0].name} (${formatCurrency(categoryData[0].value)})`,
        icon: 'chart-pie',
        color: 'blue'
      });
    }
    
    return insights;
  };
  
  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b'];
  
  // Calculate totals
  const { totalIncome, totalExpenses, netIncome } = calculateTotals();
  
  // Generate insights
  const insights = generateInsights();
  
  // Generate last 5 years for selectors
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);
  
  return (
    <Layout>
      <div ref={titleRef} className="mb-6 flex justify-between items-center flex-col md:flex-row">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Financial Reports</h1>
        <div className="flex space-x-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm">From:</label>
            <select 
              name="startMonth" 
              value={startMonth} 
              onChange={handleDateChange} 
              className="select select-sm"
              disabled={loading}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={`start-month-${i}`} value={i}>
                  {getMonthName(i)}
                </option>
              ))}
            </select>
            <select 
              name="startYear" 
              value={startYear} 
              onChange={handleDateChange} 
              className="select select-sm"
              disabled={loading}
            >
              {years.map(year => (
                <option key={`start-year-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm">To:</label>
            <select 
              name="endMonth" 
              value={endMonth} 
              onChange={handleDateChange} 
              className="select select-sm"
              disabled={loading}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={`end-month-${i}`} value={i}>
                  {getMonthName(i)}
                </option>
              ))}
            </select>
            <select 
              name="endYear" 
              value={endYear} 
              onChange={handleDateChange} 
              className="select select-sm"
              disabled={loading}
            >
              {years.map(year => (
                <option key={`end-year-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div ref={summaryRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                  <i className="fas fa-arrow-down text-blue-500 dark:text-blue-300"></i>
                </div>
                <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Income</h3>
                  <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            </div>
            <div className="card bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
                  <i className="fas fa-arrow-up text-red-500 dark:text-red-300"></i>
                </div>
                <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Expenses</h3>
                  <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
            <div className="card bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <div className={`rounded-full ${netIncome >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} p-3 mr-4`}>
                  <i className={`fas fa-${netIncome >= 0 ? 'piggy-bank' : 'exclamation-circle'} ${netIncome >= 0 ? 'text-green-500 dark:text-green-300' : 'text-red-500 dark:text-red-300'}`}></i>
                </div>
                <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm">Net Income</h3>
                  <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {formatCurrency(netIncome)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* Insights cards */}
            {insights.map((insight, index) => (
              <div key={`insight-${index}`} className="card bg-white dark:bg-gray-800">
                <div className="flex items-center">
                  <div className={`rounded-full bg-${insight.color}-100 dark:bg-${insight.color}-900 p-3 mr-4`}>
                    <i className={`fas fa-${insight.icon} text-${insight.color}-500 dark:text-${insight.color}-300`}></i>
                  </div>
                  <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm">{insight.title}</h3>
                    <p className="text-xl font-bold">{insight.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Monthly trend chart */}
          {monthlyData.length > 0 ? (
            <div ref={lineChartRef} className="card bg-white dark:bg-gray-800 mb-6">
              <h2 className="text-xl font-semibold mb-4">Income vs. Expenses Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(tick) => `${getMonthName(tick-1)}`}
                    />
                    <YAxis tickFormatter={(tick) => `$${tick}`} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => {
                        const monthData = monthlyData.find(m => m.month === label);
                        return `${getMonthName(label-1)} ${monthData?.year}`;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#3b82f6" 
                      activeDot={{ r: 8 }} 
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : !loading && !error ? (
            <div className="card bg-white dark:bg-gray-800 mb-6 p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Income vs. Expenses Trend</h2>
              <p className="text-gray-500">No data available for the selected period.</p>
              <p className="text-gray-500 mt-2">Try selecting a different date range or add transactions.</p>
            </div>
          ) : null}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly comparison bar chart */}
            {monthlyData.length > 0 ? (
              <div className="card bg-white dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4">Monthly Net Income</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(tick) => `${getMonthName(tick-1)}`}
                      />
                      <YAxis tickFormatter={(tick) => `$${tick}`} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => {
                          const monthData = monthlyData.find(m => m.month === label);
                          return `${getMonthName(label-1)} ${monthData?.year}`;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="netIncome" 
                        name="Net Income"
                      >
                        {monthlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.netIncome >= 0 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : !loading && !error ? (
              <div className="card bg-white dark:bg-gray-800 p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Monthly Net Income</h2>
                <p className="text-gray-500">No data available for the selected period.</p>
                <p className="text-gray-500 mt-2">Try selecting a different date range or add transactions.</p>
              </div>
            ) : null}
            
            {/* Category pie chart */}
            <div ref={pieChartRef} className="card bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4">Expense by Category</h2>
              {getCategoryData().length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
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
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No category data to display.</p>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Add transactions to see category statistics.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
} 