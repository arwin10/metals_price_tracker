'use client';

interface MetalTrendCardProps {
  metal: string;
  currentPrice: number;
  changePercentage: number;
  trendData: { date: string; price: number }[];
}

const metalColors: Record<string, string> = {
  gold: 'from-yellow-400 to-yellow-600',
  silver: 'from-gray-300 to-gray-500',
  platinum: 'from-gray-200 to-gray-400',
  palladium: 'from-amber-600 to-amber-800',
};

const metalIcons: Record<string, string> = {
  gold: '🥇',
  silver: '🥈',
  platinum: '⚪',
  palladium: '⚙️',
};

export default function MetalTrendCard({ 
  metal, 
  currentPrice, 
  changePercentage, 
  trendData 
}: MetalTrendCardProps) {
  const isPositive = changePercentage >= 0;
  const colorClass = metalColors[metal] || 'from-gray-400 to-gray-600';
  
  // Get the last 7 data points for the mini chart
  const miniChartData = trendData.slice(-7);
  
  // Calculate min and max for the mini chart
  const prices = miniChartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1; // Avoid division by zero

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{metalIcons[metal]}</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {metal}
          </h3>
        </div>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
          isPositive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {isPositive ? '↑' : '↓'} {Math.abs(changePercentage).toFixed(2)}%
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          per troy ounce
        </p>
      </div>
      
      {/* Mini trend chart */}
      <div className="h-16 flex items-end justify-between pt-2">
        {miniChartData.map((dataPoint, index) => {
          const height = ((dataPoint.price - minPrice) / priceRange) * 100;
          return (
            <div 
              key={index}
              className={`w-2 rounded-t bg-gradient-to-t ${colorClass}`}
              style={{ height: `${Math.max(height, 5)}%` }}
            />
          );
        })}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>7D</span>
        <span>Last: {miniChartData[miniChartData.length - 1]?.date || ''}</span>
      </div>
    </div>
  );
}