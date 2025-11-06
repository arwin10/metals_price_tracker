'use client';

import { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  metal: string;
}

export default function PriceChart({ metal }: PriceChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState('7'); // days
  const [loading, setLoading] = useState(true);

  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period));

      const response = await fetch(
        `/api/prices/history/${metal}?` +
        `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const result = await response.json();
      
      const chartData = result.prices.map((item: any) => ({
        date: new Date(item.timestamp).toLocaleDateString(),
        price: item.price,
      }));

      setData(chartData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setLoading(false);
    }
  }, [metal, period]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  // Get the color based on metal type
  const getMetalColor = (metal: string) => {
    switch(metal) {
      case 'gold': return '#f3c341';
      case 'silver': return '#c0c0c0';
      case 'platinum': return '#e5e4e2';
      case 'palladium': return '#b87333';
      default: return '#f3c341';
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
          {metal} Price History
        </h3>
        <div className="flex flex-wrap gap-2">
          {['7', '30', '90', '365'].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === days
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {days === '365' ? '1Y' : `${days}D`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">No data available</div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={getMetalColor(metal)} 
                strokeWidth={3}
                dot={{ stroke: getMetalColor(metal), strokeWidth: 2, r: 4, fill: '#fff' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
