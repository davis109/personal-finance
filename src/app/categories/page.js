'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { gsap } from 'gsap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: 'tag',
    color: '#3b82f6'
  });
  
  // Animation refs
  const titleRef = useRef(null);
  const chartRef = useRef(null);
  const listRef = useRef(null);
  
  // Fetch categories and stats
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        
        // Fetch statistics
        const statisticsResponse = await fetch('/api/statistics');
        if (!statisticsResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const statisticsData = await statisticsResponse.json();
        
        setCategories(categoriesData.categories || []);
        setStatistics(statisticsData || {});
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Animations
  useEffect(() => {
    if (!loading && titleRef.current && chartRef.current && listRef.current) {
      // Animate title
      gsap.fromTo(
        titleRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      
      // Animate chart
      gsap.fromTo(
        chartRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.2 }
      );
      
      // Animate list
      gsap.fromTo(
        listRef.current.children,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.4, 
          stagger: 0.05,
          ease: 'power2.out', 
          delay: 0.3 
        }
      );
    }
  }, [loading]);
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.name || !formData.type) {
        setError('Please fill in all required fields');
        return;
      }
      
      setLoading(true);
      
      // Determine if we're updating or creating
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      // Send request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
      }
      
      // Reset form and fetch updated data
      resetForm();
      
      // Refresh categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories || []);
      
      setError(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(`Failed to save category. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || 'tag',
      color: category.color || '#3b82f6'
    });
    setEditingCategory(category);
    setShowForm(true);
  };
  
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect transactions and budgets using this category.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Send delete request
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      // Refresh categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories || []);
      
      setError(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(`Failed to delete category. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      icon: 'tag',
      color: '#3b82f6'
    });
    setEditingCategory(null);
    setShowForm(false);
  };
  
  // Prepare data for pie chart
  const prepareChartData = () => {
    const catUsage = statistics.categoryTotals || [];
    
    return catUsage.map(item => ({
      name: item.category,
      value: Math.abs(item.total),
      type: categories.find(c => c.name === item.category)?.type || 'expense'
    })).filter(item => item.value > 0);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get icon based on category type or specified icon
  const getCategoryIcon = (category) => {
    if (category.icon) return category.icon;
    
    return category.type === 'income' ? 'arrow-down' : 'tag';
  };
  
  // Colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b'];
  
  const chartData = prepareChartData();
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            Amount: {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-500">
            Type: {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Icon options
  const iconOptions = [
    'tag', 'credit-card', 'cash', 'home', 'shopping-cart', 'utensils', 
    'car', 'plane', 'film', 'gift', 'book', 'coffee', 'briefcase',
    'graduation-cap', 'heartbeat', 'dollar-sign', 'piggy-bank'
  ];
  
  return (
    <Layout>
      <div ref={titleRef} className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Category Form */}
      {showForm && (
        <div className="card bg-white dark:bg-gray-800 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Type <span className="text-danger">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Icon
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="input"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>
                      {icon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="h-10 w-full border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Loading state */}
      {loading && !categories.length ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Category Usage Chart */}
          <div ref={chartRef} className="card bg-white dark:bg-gray-800 mb-6">
            <h2 className="text-xl font-semibold mb-4">Category Usage</h2>
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No category usage data to display.</p>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Add transactions to see category statistics.</p>
              </div>
            )}
          </div>
          
          {/* Categories List */}
          <div className="card bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Categories List</h2>
            {categories.length > 0 ? (
              <div ref={listRef} className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map(category => (
                  <div key={category._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white"
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      >
                        <i className={`fas fa-${getCategoryIcon(category)}`}></i>
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Create your first category using the button above.</p>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
} 