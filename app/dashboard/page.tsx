'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MarketOverview from '@/components/MarketOverview';
import PriceCard from '@/components/PriceCard';
import { WeightUnit } from '@/lib/weightConversions';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>('10g');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/login');
        return;
      }

      setUser(JSON.parse(userData));
      fetchPrices();
    };

    checkAuth();
  }, [router]);

  const fetchPrices = async () => {
    try {
      const response = await fetch(`/api/prices/current?currency=${selectedCurrency}`);
      const data = await response.json();
      setPrices(data.prices || []);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPrices();
    }
  }, [selectedCurrency, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your personalized dashboard
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        <MarketOverview />

        {/* Quick Actions */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency:
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit:
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value as WeightUnit)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="oz">Troy Ounce</option>
                  <option value="kg">Kilogram</option>
                  <option value="10g">10 Grams</option>
                  <option value="1g">1 Gram</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/portfolio" className="card hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  My Portfolio
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage your precious metals investments
                </p>
              </div>
            </Link>
            
            <Link href="/alerts" className="card hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Price Alerts
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Set alerts for price changes
                </p>
              </div>
            </Link>
            
            <Link href="/profile" className="card hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">👤</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  My Profile
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Update your account settings
                </p>
              </div>
            </Link>
            
            <Link href="/prices" className="card hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  All Prices
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  View all metals prices
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Current Prices */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Current Prices
            </h2>
            <Link href="/prices" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
              View All Prices →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {prices.slice(0, 4).map((price) => (
              <PriceCard 
                key={price.metal} 
                price={price}
                currency={selectedCurrency}
                unit={selectedUnit}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="card rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your recent portfolio and alert activities will appear here
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/portfolio" className="btn-primary">
                Create Portfolio
              </Link>
              <Link href="/alerts" className="btn-secondary">
                Set Alert
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}