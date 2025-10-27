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
  silver: '🥈',
  platinum: '⚪',
  palladium: '⚙️',
};

const metalNames: Record<string, string> = {
  gold: 'Gold',
  silver: 'Silver',
  platinum: 'Platinum',
  palladium: 'Palladium',
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
      className="card cursor-pointer hover:shadow-xl transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{metalIcons[price.metal]}</span>
        <span className={`text-sm font-semibold px-2 py-1 rounded ${
          isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPositive ? '↑' : '↓'} {Math.abs(price.changePercentage).toFixed(2)}%
        </span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {metalNames[price.metal]}
      </h3>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {UNIT_LABELS[unit]}
      </div>

      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
        {currencySymbol}{convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{currencySymbol}{Math.abs(convertedChange).toFixed(2)} (24h)
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Last updated: {new Date(price.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
