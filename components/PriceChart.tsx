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
        `${process.env.API_URL || 'http://localhost:5000'}/api/prices/history/${metal}?` +
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
          {metal} Price History
        </h3>
        <div className="flex gap-2">
          {['7', '30', '90', '365'].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-3 py-1 rounded ${
                period === days
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {days === '365' ? '1Y' : `${days}D`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#f3c341" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
