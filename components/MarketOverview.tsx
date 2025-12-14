'use client';

import { useState, useEffect } from 'react';
import { WeightUnit, UNIT_CONVERSIONS } from '@/lib/weightConversions';

interface MetalPrice {
  metal: string;
  price: number;
  changePercentage: number;
  timestamp: string;
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MetalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const currency = 'INR'; // Set currency to INR
  const unit: WeightUnit = '10g'; // Set unit to 10g

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
  };

  const currencySymbol = currencySymbols[currency] || '₹';
  const conversionFactor = UNIT_CONVERSIONS[unit];

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/prices/current?currency=INR');
        const data = await response.json();

        if (data.prices && Array.isArray(data.prices)) {
          // Filter to only show primary metals (gold, silver, platinum, palladium)
          const primaryMetals = data.prices.filter((price: MetalPrice) =>
            ['gold', 'gold_22k', 'silver', 'platinum', 'palladium'].includes(price.metal)
          );
          setMarketData(primaryMetals);
          setLastUpdated(new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchMarketData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card glass-effect rounded-2xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!marketData || marketData.length === 0) return null;

  const metals = marketData.map((price) => {
    let displayName = price.metal.charAt(0).toUpperCase() + price.metal.slice(1);
    if (price.metal === 'gold') displayName = 'Gold (24k)';
    if (price.metal === 'gold_22k') displayName = 'Gold (22k)';

    return {
      name: displayName,
      price: price.price * conversionFactor, // Convert price to 10g
      symbol: getMetalSymbol(price.metal),
      change: `${price.changePercentage >= 0 ? '+' : ''}${price.changePercentage.toFixed(2)}%`,
      isPositive: price.changePercentage >= 0
    };
  });

  function getMetalSymbol(metal: string): string {
    switch (metal) {
      case 'gold': return '🥇';
      case 'gold_22k': return '🥇';
      case 'silver': return '🥈';
      case 'platinum': return '⚪';
      case 'palladium': return '⚙️';
      default: return '🔸';
    }
  }

  return (
    <div className="card glass-effect rounded-2xl p-6 mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Market Overview (per 10g)
        </h2>
        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metals.map((metal) => (
          <div
            key={metal.name}
            className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metal.symbol}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${metal.isPositive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {metal.change}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{metal.name}</h3>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {currencySymbol}{metal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}