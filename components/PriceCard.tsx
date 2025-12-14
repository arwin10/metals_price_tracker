'use client';

import { WeightUnit, UNIT_LABELS, UNIT_CONVERSIONS } from '@/lib/weightConversions';

interface PriceCardProps {
  price: {
    metal: string;
    price: number;
    changePercentage: number;
    change24h: number;
    timestamp: string;
  };
  currency?: string;
  unit?: WeightUnit;
  onClick?: () => void;
}

const metalIcons: Record<string, string> = {
  gold: '🥇',
  gold_22k: '🥇',
  silver: '🥈',
  platinum: '⚪',
  palladium: '⚙️',
  rhodium: '💎',
  iridium: '🔷',
  ruthenium: '🔶',
  osmium: '🔷',
};

const metalNames: Record<string, string> = {
  gold: 'Gold (24k)',
  gold_22k: 'Gold (22k)',
  silver: 'Silver',
  platinum: 'Platinum',
  palladium: 'Palladium',
  rhodium: 'Rhodium',
  iridium: 'Iridium',
  ruthenium: 'Ruthenium',
  osmium: 'Osmium',
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export default function PriceCard({ price, currency = 'USD', unit = 'oz', onClick }: PriceCardProps) {
  const isPositive = price.changePercentage >= 0;
  const currencySymbol = currencySymbols[currency] || '$';
  const conversionFactor = UNIT_CONVERSIONS[unit];

  // Convert price based on unit
  const convertedPrice = price.price * conversionFactor;
  const convertedChange = price.change24h * conversionFactor;

  return (
    <div
      className="card cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl border border-gray-200 dark:border-gray-700"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{metalIcons[price.metal] || '🔸'}</span>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
          {isPositive ? '↑' : '↓'} {Math.abs(price.changePercentage).toFixed(2)}%
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 capitalize">
        {metalNames[price.metal] || price.metal.replace('_', ' ')}
      </h3>

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {UNIT_LABELS[unit]}
      </div>

      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-3">
        {currencySymbol}{convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? '+' : ''}{currencySymbol}{Math.abs(convertedChange).toFixed(2)} <span className="text-gray-500 dark:text-gray-400">(24h)</span>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        Last updated: {new Date(price.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
