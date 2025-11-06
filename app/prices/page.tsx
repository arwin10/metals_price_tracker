'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PriceCard from '@/components/PriceCard';
import MetalTrendCard from '@/components/MetalTrendCard';
import MetalInfoCard from '@/components/MetalInfoCard';
import { WeightUnit } from '@/lib/weightConversions';

// Define all metals we want to display
const ALL_METALS = [
  { id: 'gold', name: 'Gold', symbol: '🥇', category: 'primary' },
  { id: 'silver', name: 'Silver', symbol: '🥈', category: 'primary' },
  { id: 'platinum', name: 'Platinum', symbol: '⚪', category: 'primary' },
  { id: 'palladium', name: 'Palladium', symbol: '⚙️', category: 'primary' },
  { id: 'rhodium', name: 'Rhodium', symbol: '💎', category: 'additional' },
  { id: 'iridium', name: 'Iridium', symbol: '🔷', category: 'additional' },
  { id: 'ruthenium', name: 'Ruthenium', symbol: '🔶', category: 'additional' },
  { id: 'osmium', name: 'Osmium', symbol: '🔷', category: 'additional' },
];

export default function PricesPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>('oz');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/prices/current?currency=${selectedCurrency}`
      );
      const data = await response.json();
      setPrices(data.prices || []);
      setLastUpdated(new Date().toLocaleTimeString());
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

  // Generate mock data for additional metals
  const generateMockPrices = () => {
    const mockPrices = [...prices];
    
    // Add mock data for additional metals if they don't exist
    const additionalMetals = ALL_METALS.filter(metal => 
      metal.category === 'additional' && 
      !prices.some(p => p.metal === metal.id)
    );
    
    additionalMetals.forEach(metal => {
      const basePrice = metal.id === 'rhodium' ? 2500 : 
                       metal.id === 'iridium' ? 1500 : 
                       metal.id === 'ruthenium' ? 800 : 
                       metal.id === 'osmium' ? 400 : 1000;
      
      mockPrices.push({
        metal: metal.id,
        price: basePrice + (Math.random() * 100 - 50),
        changePercentage: (Math.random() * 4 - 2),
        change24h: (Math.random() * 20 - 10),
        timestamp: new Date().toISOString(),
      });
    });
    
    return mockPrices;
  };

  const allPrices = generateMockPrices();
  const primaryMetals = allPrices.filter(price => 
    ALL_METALS.find(metal => metal.id === price.metal)?.category === 'primary'
  );
  const additionalMetals = allPrices.filter(price => 
    ALL_METALS.find(metal => metal.id === price.metal)?.category === 'additional'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Precious Metals Prices
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time tracking of precious metals prices
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  View:
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'cards' | 'table')}
                  className="px-2 py-1 border-0 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 rounded"
                >
                  <option value="cards">Cards</option>
                  <option value="table">Table</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency:
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-2 py-1 border-0 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 rounded"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit:
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value as WeightUnit)}
                  className="px-2 py-1 border-0 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 rounded"
                >
                  <option value="oz">Troy Ounce</option>
                  <option value="kg">Kilogram</option>
                  <option value="10g">10 Grams</option>
                  <option value="1g">1 Gram</option>
                </select>
              </div>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Last updated: {lastUpdated}
            </div>
          )}
        </section>

        {/* Primary Metals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Primary Metals
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {primaryMetals.length} metals
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse rounded-2xl">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {primaryMetals.map((price) => (
                <PriceCard 
                  key={price.metal} 
                  price={price}
                  currency={selectedCurrency}
                  unit={selectedUnit}
                />
              ))}
            </div>
          ) : (
            <div className="card rounded-2xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Metal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">24h Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {primaryMetals.map((price) => {
                    const isPositive = price.changePercentage >= 0;
                    const metalInfo = ALL_METALS.find(m => m.id === price.metal);
                    return (
                      <tr key={price.metal} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{metalInfo?.symbol || '🔸'}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {metalInfo?.name || price.metal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ${(price.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isPositive ? '+' : ''}{(price.changePercentage || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {selectedUnit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Additional Metals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Additional Metals
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {additionalMetals.length} metals
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse rounded-2xl">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalMetals.map((price) => (
                <PriceCard 
                  key={price.metal} 
                  price={price}
                  currency={selectedCurrency}
                  unit={selectedUnit}
                />
              ))}
            </div>
          ) : (
            <div className="card rounded-2xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Metal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">24h Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {additionalMetals.map((price) => {
                    const isPositive = price.changePercentage >= 0;
                    const metalInfo = ALL_METALS.find(m => m.id === price.metal);
                    return (
                      <tr key={price.metal} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{metalInfo?.symbol || '🔸'}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {metalInfo?.name || price.metal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ${(price.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isPositive ? '+' : ''}{(price.changePercentage || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {selectedUnit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Metal Information Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Precious Metals Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ALL_METALS.map((metal) => (
              <MetalInfoCard key={metal.id} metalId={metal.id} />
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="card rounded-2xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Metals Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Metal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rarity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Typical Uses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price Range</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { id: 'gold', name: 'Gold', symbol: '🥇', category: 'Primary', rarity: 'Common', uses: 'Jewelry, Investment', price: '$1,800-2,200' },
                  { id: 'silver', name: 'Silver', symbol: '🥈', category: 'Primary', rarity: 'Common', uses: 'Electronics, Investment', price: '$20-30' },
                  { id: 'platinum', name: 'Platinum', symbol: '⚪', category: 'Primary', rarity: 'Rare', uses: 'Catalysts, Jewelry', price: '$900-1,200' },
                  { id: 'palladium', name: 'Palladium', symbol: '⚙️', category: 'Primary', rarity: 'Rare', uses: 'Catalysts, Electronics', price: '$1,000-3,000' },
                  { id: 'rhodium', name: 'Rhodium', symbol: '💎', category: 'Additional', rarity: 'Extremely Rare', uses: 'Catalysts, Plating', price: '$2,000-6,000' },
                  { id: 'iridium', name: 'Iridium', symbol: '🔷', category: 'Additional', rarity: 'Very Rare', uses: 'Spark Plugs, Crucibles', price: '$1,200-2,500' },
                  { id: 'ruthenium', name: 'Ruthenium', symbol: '🔶', category: 'Additional', rarity: 'Very Rare', uses: 'Electronics, Catalysts', price: '$300-600' },
                  { id: 'osmium', name: 'Osmium', symbol: '🔷', category: 'Additional', rarity: 'Rare', uses: 'Alloys, Instruments', price: '$400-800' },
                ].map((metal) => (
                  <tr key={metal.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{metal.symbol}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {metal.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {metal.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        metal.rarity === 'Common' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        metal.rarity === 'Rare' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        metal.rarity === 'Very Rare' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {metal.rarity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {metal.uses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {metal.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}