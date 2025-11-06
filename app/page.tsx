'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PriceCard from '@/components/PriceCard';
import PriceChart from '@/components/PriceChart';
import MarketOverview from '@/components/MarketOverview';
import { WeightUnit } from '@/lib/weightConversions';

export default function Home() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>('oz');

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/prices/current?currency=${selectedCurrency}`
      );
      const data = await response.json();
      setPrices(data.prices || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setLoading(false);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Track Precious Metals Prices
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Real-time tracking of gold, silver, platinum, and palladium prices
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 text-lg">
              Get Started
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3 text-lg">
              Sign In
            </Link>
          </div>
        </section>

        <MarketOverview />
        
        {/* Current Prices */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Current Prices
            </h2>
            
            {/* Currency and Unit Selectors */}
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
                  <option value="kg">Kilogram (1 kg)</option>
                  <option value="10g">10 Grams</option>
                  <option value="1g">1 Gram</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {prices.map((price) => (
                <PriceCard 
                  key={price.metal} 
                  price={price}
                  currency={selectedCurrency}
                  unit={selectedUnit}
                  onClick={() => setSelectedMetal(price.metal)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Price Chart */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Price History
          </h2>
          <div className="card">
            <PriceChart metal={selectedMetal} />
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card text-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="text-4xl mb-4 text-primary-500">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Real-Time Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor live prices updated every 5 minutes from reliable sources
            </p>
          </div>

          <div className="card text-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="text-4xl mb-4 text-primary-500">💼</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Portfolio Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track your precious metals investments and monitor performance
            </p>
          </div>

          <div className="card text-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="text-4xl mb-4 text-primary-500">🔗</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              All Metals Prices
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              View prices for all precious metals including rare investments
            </p>
            <Link href="/prices" className="mt-4 btn-primary text-sm px-4 py-2 rounded-lg inline-block">
              View All Prices
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Gold Price Tracker. All rights reserved.</p>
          <p className="mt-2 text-gray-400">
            Data sourced from Metals API and other reliable providers
          </p>
        </div>
      </footer>
    </div>
  );
}
