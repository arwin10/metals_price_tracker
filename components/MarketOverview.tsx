'use client';

import { useState, useEffect } from 'react';

interface MarketData {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
  timestamp: string;
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from your API
    // For now, we'll simulate with mock data
    const fetchMarketData = () => {
      setTimeout(() => {
        const mockData: MarketData = {
          gold: 1950.75,
          silver: 24.35,
          platinum: 980.50,
          palladium: 1250.25,
          timestamp: new Date().toISOString()
        };
        setMarketData(mockData);
        setLoading(false);
      }, 800);
    };

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="card glass-effect rounded-2xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!marketData) return null;

  const metals = [
    { name: 'Gold', price: marketData.gold, symbol: '🥇', change: '+1.2%' },
    { name: 'Silver', price: marketData.silver, symbol: '🥈', change: '-0.5%' },
    { name: 'Platinum', price: marketData.platinum, symbol: '⚪', change: '+2.3%' },
    { name: 'Palladium', price: marketData.palladium, symbol: '⚙️', change: '-1.1%' },
  ];

  return (
    <div className="card glass-effect rounded-2xl p-6 mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Market Overview
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(marketData.timestamp).toLocaleTimeString()}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metals.map((metal) => (
          <div 
            key={metal.name} 
            className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metal.symbol}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                metal.change.startsWith('+') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {metal.change}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{metal.name}</h3>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              ${metal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}