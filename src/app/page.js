'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import BackgroundAnimation from '../components/BackgroundAnimation';

export default function Home() {
  const headerRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);
  
  useEffect(() => {
    // Animate header content
    gsap.fromTo(
      headerRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
    
    // Animate CTA buttons
    gsap.fromTo(
      ctaRef.current.children,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.2, 
        duration: 0.6, 
        ease: 'back.out(1.7)',
        delay: 0.4
      }
    );
    
    // Animate feature cards
    gsap.fromTo(
      featuresRef.current.children,
      { y: 100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        duration: 0.8, 
        ease: 'power2.out',
        delay: 0.6
      }
    );
  }, []);
  
  return (
    <main className="min-h-screen">
      {/* Background animation */}
      <BackgroundAnimation />
      
      {/* Hero section */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div 
          ref={headerRef} 
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-blue-500">
            Personal Finance Tracker
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-gray-300">
            Take control of your finances with our intuitive tracking and visualization tools. Monitor expenses, set budgets, and gain insights into your spending habits.
          </p>
          
          <div ref={ctaRef} className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/transactions" 
              className="btn bg-green-500 btn-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <i className="fas fa-wallet mr-2"></i>
              Get Started
            </Link>
            <Link 
              href="/reports" 
              className="btn bg-blue-500 hover:bg-blue-600 text-white btn-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <i className="fas fa-chart-line mr-2"></i>
              View Reports
            </Link>
          </div>
        </div>
        
        {/* Features */}
        <div 
          ref={featuresRef} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <div className="card bg-white/10 backdrop-blur-md border border-blue-500/20 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="rounded-full bg-blue-900/50 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-3xl">💱</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Track Transactions</h3>
              <p className="text-gray-300">
                Easily record and categorize your income and expenses. Import transactions or add them manually.
              </p>
            </div>
          </div>
          
          <div className="card bg-white/10 backdrop-blur-md border border-blue-500/20 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="rounded-full bg-blue-900/50 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Visualize Spending</h3>
              <p className="text-gray-300">
                See where your money goes with intuitive charts and breakdowns by categories and time periods.
              </p>
            </div>
          </div>
          
          <div className="card bg-white/10 backdrop-blur-md border border-blue-500/20 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="rounded-full bg-blue-900/50 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-3xl">🐷</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Set Budgets</h3>
              <p className="text-gray-300">
                Create budgets for different categories and track your progress to stay on financial target.
              </p>
            </div>
          </div>
          
          <div className="card bg-white/10 backdrop-blur-md border border-blue-500/20 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="rounded-full bg-blue-900/50 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Get Insights</h3>
              <p className="text-gray-300">
                Receive personalized insights and suggestions to improve your financial habits.
              </p>
            </div>
          </div>
          
          <div className="card bg-white/10 backdrop-blur-md border border-blue-500/20 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="rounded-full bg-blue-900/50 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Secure & Private</h3>
              <p className="text-gray-300">
                Your financial data is encrypted and never shared with third parties.
              </p>
            </div>
          </div>
          
          <div className="card bg-white/10 backdrop-blur-md border border-blue-500/20 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="rounded-full bg-blue-900/50 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Mobile Friendly</h3>
              <p className="text-gray-300">
                Access your finances on any device with our responsive design.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 